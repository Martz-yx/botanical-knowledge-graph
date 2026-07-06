# Flora-Graph / Botanical Knowledge Graph

Neo4j knowledge graph for ~320 cultivated plant species across 20 families,
covering taxonomy, horticultural care profiles, and ecological interactions.

## Tech Stack

- Database: `neo4j:5` (Aura-compatible)
- Driver: `neo4j` Python SDK
- Schema: `schema/flora-graph-schema.md`
- Source material: `Documents/flora-graph/`

## Repo structure

```
botanical-knowledge-graph/
├── schema/
│   ├── flora-graph-schema.md          # graph schema definition
│   ├── flora-graph-species-list.md    # authoritative species list by family
│   └── ...
├── processed/                         # one CSV per family + edge files
│   ├── araceae.csv, bignoniaceae.csv, ...
│   ├── companion_edges.csv
│   └── pollinator_edges.csv
├── ingestion/
│   └── load_graph.py                  # pipeline that loads CSV → Neo4j
├── sourcing-log.md                    # known gaps / uncertainties
├── docker-compose.yml
├── .env
└── README.md
```

## Running locally (Docker)

```bash
docker compose up neo4j -d
cp .env.example .env   # set NEO4J_PASSWORD
python3 ingestion/load_graph.py
open http://localhost:7474
```

## Running against Neo4j Aura

Populate `.env` with:

```
NEO4J_URI=neo4j+s://5eeb9cc0.databases.neo4j.io
NEO4J_USER=5eeb9cc0
NEO4J_PASSWORD=<your-key>
```

Then:

```bash
python3 ingestion/load_graph.py
```

## Graph model

### Node labels

- `Kingdom`     — Plantae
- `Phylum`      Tracheophyta, Bryophyta, ...
- `Class`       Liliopsida, Magnoliopsida, ...
- `Order`       Asparagales, Rosales, Solanales, ...
- `Family`      20 families
- `Subfamily`   32 subfamilies (where applicable)
- `Genus`       242 genera
- `Species`     320 species
- `CareProfile` 316 species with horticultural care data
- `Pollinator`  14 pollinator taxa

### Relationships

- `(Lower)-[:BELONGS_TO]->(Higher)` — taxonomic backbone
- `(Species)-[:HAS_CARE_PROFILE]->(CareProfile)` — care data
- `(Species)-[:GROWS_WELL_WITH]->(Species)` — companion planting
- `(Species)-[:INHIBITS]->(Species)` — allelopathy
- `(Species)-[:POLLINATED_BY]->(Pollinator)` — pollination ecology

### Constraints

Unique indexes on every primary label property (`scientific_name`, `name`),
plus composite uniqueness on `(Subfamily.family, Subfamily.name)`.

## Sample Cypher

```cypher
// companion plants for Solanum lycopersicum (tomato)
MATCH (sp:Species {scientific_name:'Solanum lycopersicum'})-[r:GROWS_WELL_WITH]->(c)
RETURN sp.scientific_name AS sp, type(r) AS rel, c.scientific_name AS companion, r.confidence AS conf

// full taxonomy chain for any species
MATCH (sp:Species {scientific_name:'Solanum lycopersicum'})-[*1..8]->(top)
RETURN [n in nodes(p) | n.name] AS chain
```

## Sourcing-log

Gaps, ambiguities, and data provenance notes are tracked in `sourcing-log.md`.

- 3 Orchidaceae species with partial care data (`Zygopetalum intermedium`, `Masdevallia coccinea`, `Bulbophyllum lobbii`)
- Sansevieria taxonomic synonymy noted (currently treated as Dracaena per APG IV)

## Data sources

Primary: Wikipedia + Wikispecies (background taxonomy), horticultural references
(Streib 1989, NPHR extension, ASPCA toxicity database, University extension services).

## License

Source data sourced from public-domain horticultural/reference materials. See
`sourcing-log.md` for individual line provenance.
