"""
flora-graph ingestion pipeline
Loads all processed/*.csv into a live Neo4j instance (local Docker or Aura).

Reads connection from repo-root .env:
  NEO4J_URI, NEO4J_USER (or NEO4J_USERNAME), NEO4J_PASSWORD
"""

import csv
import os
from collections import defaultdict
from glob import glob
from pathlib import Path

from dotenv import load_dotenv
from neo4j import GraphDatabase


# ── Env ──────────────────────────────────────────────────────────────────────
def get_driver():
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
    uri = os.environ["NEO4J_URI"]
    user = os.environ.get("NEO4J_USER", os.environ.get("NEO4J_USERNAME", "neo4j"))
    password = os.environ["NEO4J_PASSWORD"]
    return GraphDatabase.driver(uri, auth=(user, password))


# ── Helpers ──────────────────────────────────────────────────────────────────
def _v(value):
    if value is None:
        return None
    v = value.strip()
    return v if v else None


def _list(value):
    v = _v(value)
    if not v:
        return []
    return [x.strip() for x in v.split("|") if x.strip()]


def _bool(value):
    v = _v(value)
    if v is None:
        return None
    return v.lower() in ("true", "1", "yes")


def _parse_regions(value):
    v = _v(value)
    if not v:
        return []
    # Split by semicolon or slash
    regions = []
    for part in v.replace(';', '/').split('/'):
        part = part.split('(')[0].strip() # Remove parentheticals
        if part.lower().startswith('widely') or part == '':
            continue
        regions.append(part)
    return regions


# ── Constraints ──────────────────────────────────────────────────────────────
def create_constraints(tx):
    constraints = [
        ("Species",      "scientificName"),
        ("Genus",        "name"),
        ("Family",       "name"),
        ("Order",        "name"),
        ("Class",        "name"),
        ("Phylum",       "name"),
        ("Kingdom",      "name"),
        ("Pollinator",   "name"),
        ("Subfamily",    "name"),
        ("Region",       "name"),
    ]
    for label, prop in constraints:
        if label == "Subfamily":
            tx.run(f"""
                CREATE CONSTRAINT `Subfamily_family_name` IF NOT EXISTS
                FOR (n:Subfamily)
                REQUIRE (n.family, n.name) IS UNIQUE
            """)
        else:
            tx.run(f"""
                CREATE CONSTRAINT `{label}_{prop}` IF NOT EXISTS
                FOR (n:{label})
                REQUIRE n.{prop} IS UNIQUE
            """)


# ── Family loader (batched — single transaction) ─────────────────────────────
FAMILY_COLUMNS = [
    "scientific_name", "common_names", "image_url", "is_invasive",
    "genus", "subfamily", "family", "order", "class", "phylum", "kingdom",
    "watering_level", "ppfd_min", "ppfd_max", "light_requirement",
    "soil_type", "growth_pattern", "mature_height_cm", "toxicity_notes",
]

LOAD_FAMILY_CYPHER = """
UNWIND $rows AS row

// --- Taxonomic backbone ----------------------------------------------------
MERGE (k:Kingdom {name: coalesce(row.kingdom, "Unknown Kingdom")})
MERGE (p:Phylum  {name: coalesce(row.phylum, "Unknown Phylum")})   MERGE (p)-[:BELONGS_TO]->(k)
MERGE (c:Class   {name: coalesce(row.class, "Unknown Class")})    MERGE (c)-[:BELONGS_TO]->(p)
MERGE (o:Order   {name: coalesce(row.order, "Unknown Order")})    MERGE (o)-[:BELONGS_TO]->(c)
MERGE (f:Family  {name: coalesce(row.family, "Unknown Family")})  MERGE (f)-[:BELONGS_TO]->(o)

// subname is only set when present; coerce whitespace to null
WITH row, f,
     CASE
       WHEN row.subfamily IS NOT NULL AND trim(row.subfamily) <> ''
       THEN trim(row.subfamily)
       ELSE null
     END AS subname

// Subfamily node (only when present) + immediate family link
FOREACH (_ IN CASE WHEN subname IS NULL THEN [] ELSE [1] END |
    MERGE (sf:Subfamily {name: subname, family: row.family})
    MERGE (sf)-[:BELONGS_TO]->(f)
)

// Genus -> immediate taxon parent, plus subfamily when present ---------------
MERGE (g:Genus {name: row.genus})
MERGE (g)-[:BELONGS_TO]->(f)
FOREACH (_ IN CASE WHEN subname IS NULL THEN [] ELSE [1] END |
    MERGE (sf:Subfamily {name: subname, family: row.family})
    MERGE (sf)-[:BELONGS_TO]->(f)
    MERGE (g)-[:BELONGS_TO]->(sf)
)

// Species and care profile
MERGE (s:Species {scientificName: row.scientific_name})
MERGE (s)-[:BELONGS_TO]->(g)
  SET s.commonNames    = row.common_names_list,
      s.imageUrl       = row.image_url,
      s.isInvasive     = row.is_invasive_val,
      s.growthPattern  = row.growth_pattern,
      s.matureHeightCm = row.mature_height_cm,
      s.toxicityNotes  = row.toxicity_notes

// Shared CareProfile (only when care data exists)
FOREACH (_ IN CASE
    WHEN row.watering_level    IS NULL
     AND row.light_requirement IS NULL
     AND row.soil_type         IS NULL
    THEN [] ELSE [1] END |
    MERGE (cp:CareProfile {
        wateringLevel: coalesce(row.watering_level, "Unknown"),
        lightRequirement: coalesce(row.light_requirement, "Unknown"),
        soilType: coalesce(row.soil_type, "Unknown")
    })
    ON CREATE SET cp.ppfdMin = row.ppfd_min,
                  cp.ppfdMax = row.ppfd_max
    MERGE (s)-[:HAS_CARE_PROFILE]->(cp)
)

// Regions (Native To)
FOREACH (reg IN row.native_regions_list |
    MERGE (r:Region {name: reg})
    MERGE (s)-[:NATIVE_TO]->(r)
)
"""


def load_family_file(tx, path):
    rows = []
    with open(path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            sname = _v(row.get("scientific_name", ""))
            kingdom = _v(row.get("kingdom", ""))
            phylum = _v(row.get("phylum", ""))
            genus = _v(row.get("genus", ""))
            if not sname or not kingdom or not phylum or not genus:
                if not sname:
                    print(f"  WARNING: skipping row with empty scientific_name in {path}")
                elif not kingdom:
                    print(f"  WARNING: skipping {sname} — empty kingdom in {path}")
                elif not phylum:
                    print(f"  WARNING: skipping {sname} — empty phylum in {path}")
                else:
                    print(f"  WARNING: skipping {sname} — empty genus in {path}")
                continue
            payload = {
                "scientific_name":    sname,
                "common_names_list":  _list(row.get("common_names", "")),
                "image_url":          _v(row.get("image_url", "")),
                "is_invasive_val":    _bool(row.get("is_invasive", "")),
                "genus":              genus,
                "subfamily":          _v(row.get("subfamily", "")),
                "family":             _v(row.get("family", "")),
                "order":              _v(row.get("order", "")),
                "class":              _v(row.get("class", "")),
                "phylum":             _v(row.get("phylum", "")),
                "kingdom":            _v(row.get("kingdom", "")),
                "watering_level":     _v(row.get("watering_level", "")),
                "ppfd_min":           _v(row.get("ppfd_min", "")),
                "ppfd_max":           _v(row.get("ppfd_max", "")),
                "light_requirement":  _v(row.get("light_requirement", "")),
                "soil_type":          _v(row.get("soil_type", "")),
                "growth_pattern":     _v(row.get("growth_pattern", "")),
                "mature_height_cm":   _v(row.get("mature_height_cm", "")),
                "toxicity_notes":     _v(row.get("toxicity_notes", "")),
                "native_regions_list": _parse_regions(row.get("native_regions", "")),
            }
            rows.append(payload)
    tx.run(LOAD_FAMILY_CYPHER, rows=rows)
    return len(rows)


# ── Edge loaders ─────────────────────────────────────────────────────────────
COMPANION_CYPHER = """
UNWIND $rows AS row
MATCH (a:Species {scientificName: row.species_a})
MATCH (b:Species {scientificName: row.species_b})
FOREACH (_ IN CASE WHEN a IS NULL OR b IS NULL THEN [] ELSE [1] END |
    MERGE (a)-[r:GROWS_WELL_WITH]->(b)
    SET r.confidence = row.confidence, r.notes = row.notes, r.source = row.source
)
"""

INHIBIT_CYPHER = """
UNWIND $rows AS row
MATCH (a:Species {scientificName: row.species_a})
MATCH (b:Species {scientificName: row.species_b})
FOREACH (_ IN CASE WHEN a IS NULL OR b IS NULL THEN [] ELSE [1] END |
    MERGE (a)-[r:INHIBITS]->(b)
    SET r.confidence = row.confidence, r.notes = row.notes, r.source = row.source
)
"""


def load_companion_edges(tx):
    path = "processed/companion_edges.csv"
    if not os.path.exists(path):
        print("  SKIP companion_edges.csv — not found")
        return
    well_with = []
    inhibits = []
    with open(path, newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            a = _v(row.get("species_a", ""))
            b = _v(row.get("species_b", ""))
            rel = _v(row.get("relationship_type", ""))
            if not (a and b and rel):
                continue
            payload = {
                "species_a":  a,
                "species_b":  b,
                "confidence": _v(row.get("confidence", "")),
                "notes":      _v(row.get("notes", "")),
                "source":     _v(row.get("source", "")),
            }
            if rel == "GROWS_WELL_WITH":
                well_with.append(payload)
            elif rel == "INHIBITS":
                inhibits.append(payload)
    if well_with:
        tx.run(COMPANION_CYPHER, rows=well_with)
        print(f"  Loaded {len(well_with)} GROWS_WELL_WITH edges")
    if inhibits:
        tx.run(INHIBIT_CYPHER, rows=inhibits)
        print(f"  Loaded {len(inhibits)} INHIBITS edges")


POLLINATOR_CYPHER = """
UNWIND $rows AS row
MATCH (s:Species {scientificName: row.species})
FOREACH (_ IN CASE WHEN s IS NULL THEN [] ELSE [1] END |
    MERGE (p:Pollinator {name: row.pollinator_name})
      SET p.type = row.pollinator_type
    MERGE (s)-[r:POLLINATED_BY]->(p)
      SET r.confidence = row.confidence, r.notes = row.notes, r.source = row.source
)
"""


def load_pollinator_edges(tx):
    path = "processed/pollinator_edges.csv"
    if not os.path.exists(path):
        print("  SKIP pollinator_edges.csv — not found")
        return
    rows = []
    with open(path, newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            sp = _v(row.get("species", ""))
            poll = _v(row.get("pollinator_name", ""))
            if not (sp and poll):
                continue
            rows.append({
                "species":         sp,
                "pollinator_name": poll,
                "pollinator_type": _v(row.get("pollinator_type", "")),
                "confidence":      _v(row.get("confidence", "")),
                "notes":           _v(row.get("notes", "")),
                "source":          _v(row.get("source", "")),
            })
    if rows:
        tx.run(POLLINATOR_CYPHER, rows=rows)
        print(f"  Loaded {len(rows)} POLLINATED_BY edges")


# ── Summary ──────────────────────────────────────────────────────────────────
def print_summary(tx):
    labels = ["Species", "CareProfile", "Genus", "Family", "Subfamily",
              "Order", "Class", "Phylum", "Kingdom", "Pollinator", "Region"]
    rels = ["BELONGS_TO", "HAS_CARE_PROFILE", "GROWS_WELL_WITH",
            "INHIBITS", "POLLINATED_BY", "NATIVE_TO"]
    print()
    for label in labels:
        c = tx.run(f"MATCH (n:{label}) RETURN count(n) AS c").single()["c"]
        print(f"  {label:20s}: {c}")
    print()
    for rel in rels:
        c = tx.run(f"MATCH ()-[r:{rel}]->() RETURN count(r) AS c").single()["c"]
        print(f"  {rel:20s}: {c}")
    print()


# ── Main ──────────────────────────────────────────────────────────────────────
SKIP_FILES = {"companion_edges.csv", "pollinator_edges.csv"}


def main():
    repo_root = Path(__file__).resolve().parent.parent
    os.chdir(repo_root)

    driver = get_driver()
    family_files = sorted(glob("processed/*.csv"))

    print(f"Found {len(family_files)} CSV files in processed/.\n")

    with driver.session() as session:
        session.execute_write(create_constraints)
        print("Constraints created.\n")

        total = 0
        for fpath in family_files:
            name = os.path.basename(fpath)
            if name in SKIP_FILES:
                continue
            print(f"Loading {fpath} ...")
            try:
                count = session.execute_write(load_family_file, fpath)
            except Exception as exc:
                print(f"  ERROR loading {fpath}: {exc}")
                raise
            print(f"  {count} species loaded")
            total += count

        print(f"\nTotal species: {total}")
        print("\nLoading companion_edges.csv ...")
        session.execute_write(load_companion_edges)
        print("Loading pollinator_edges.csv ...")
        session.execute_write(load_pollinator_edges)
        session.execute_write(print_summary)

    driver.close()
    print("Done.")


if __name__ == "__main__":
    main()
