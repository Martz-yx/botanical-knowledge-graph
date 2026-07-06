# Flora Graph Database — Schema Reference

Target scope: ~300 species across the family list below. This file is the
source of truth for node labels, properties, and relationship types when
sourcing, cleaning, or ingesting data.

---

## Node Labels & Properties

### Taxonomic backbone

```
(:Kingdom      {name})
(:Phylum       {name})
(:Class        {name})
(:Order        {name})
(:Family       {name, scientificName, description})
(:Subfamily    {name, scientificName, description})   // only where taxonomically real — do not invent placeholders
(:Genus        {name, scientificName, description})
```

### Species (core node)

```
(:Species {
  scientificName,
  commonNames: [],
  imageUrl,
  isInvasive: bool,
  growthPattern,         // e.g. climbing, rosette, shrub, trailing
  matureHeightCm,
  toxicityNotes
})
```

### CareProfile (shared environmental hub)

```
(:CareProfile {
  wateringLevel,        // e.g. low / medium / high, or a literal frequency
  ppfdMin,               // µmol/m²/s — Photosynthetic Photon Flux Density
  ppfdMax,
  lightRequirement,
  soilType
})
```

### Supporting nodes

```
(:Region      {name})
(:Pollinator  {name, type})   // type: insect / bird / mammal / etc.
```

---

## Relationships

### Taxonomic backbone — one relationship type, variable depth

```
(:Phylum)-[:BELONGS_TO]->(:Kingdom)
(:Class)-[:BELONGS_TO]->(:Phylum)
(:Order)-[:BELONGS_TO]->(:Class)
(:Family)-[:BELONGS_TO]->(:Order)
(:Subfamily)-[:BELONGS_TO]->(:Family)      // only when subfamily exists
(:Genus)-[:BELONGS_TO]->(:Subfamily)       // when subfamily exists
(:Genus)-[:BELONGS_TO]->(:Family)          // when it doesn't — skip the hop, do NOT invent a placeholder subfamily
(:Species)-[:BELONGS_TO]->(:Genus)
```

Modeling rule: taxonomy is real-world inconsistent (some families split into
subfamilies, some don't). Model it as it actually is. Genus attaches to
whichever rank is its true immediate parent. Queries needing "all genuses in
a family regardless of subfamily" use a variable-length traversal:
`[:BELONGS_TO*1..2]`.

### Care

```
(:Species)-[:HAS_CARE_PROFILE]->(:CareProfile)
```

### Cross-cutting relationships (the "why graph, not tree" edges)

```
(:Species)-[:NATIVE_TO]->(:Region)
(:Species)-[:INVASIVE_IN]->(:Region)
(:Species)-[:GROWS_WELL_WITH]->(:Species)   // directional; add both directions when mutual
(:Species)-[:INHIBITS]->(:Species)          // directional; rarely mutual
(:Species)-[:POLLINATED_BY]->(:Pollinator)
```

Directionality rule: `GROWS_WELL_WITH` and `INHIBITS` are stored as directed
edges. When a relationship is genuinely mutual (e.g. basil ↔ tomato), create
edges in both directions rather than treating the relationship as
undirected. When it's one-sided (e.g. walnut → tomato via juglone, or
lettuce benefiting from corn's shade with no benefit returned), create only
the one edge.

---

## Data sourcing notes

- Taxonomy + scientific names: GBIF (primary reference for correctness).
- Care data (watering, PPFD, growth pattern): general horticultural sources.
- Companion planting / pollinator data: sparse in structured databases —
  expect to source from gardening/permaculture references, and treat as
  lower-confidence. Concentrate curation effort on: Solanaceae, Fabaceae,
  Lamiaceae, Brassicaceae, Apiaceae.
- If a field can't be confidently sourced, leave it blank and log it —
  never guess or fabricate a value to fill a gap.

---

## Target family list (~300 species)

**Houseplants / ornamentals**
| Family | ~Species |
|---|---|
| Araceae | 30 |
| Cactaceae | 30 |
| Crassulaceae | 20 |
| Asparagaceae | 20 |
| Moraceae | 15 |
| Orchidaceae | 20 |

**Edible / companion-planting relevant**
| Family | ~Species |
|---|---|
| Solanaceae | 25 |
| Fabaceae | 25 |
| Cucurbitaceae | 15 |
| Apiaceae | 15 |
| Lamiaceae | 20 |
| Brassicaceae | 20 |

**Paraguay-relevant natives**
| Family | ~Species |
|---|---|
| Bignoniaceae | 15 |
| Myrtaceae | 15 |
| Rosaceae | 15 |
| Asteraceae | 20 |

Notes:
- Cactaceae (no subfamily) and Rosaceae (has subfamilies, e.g.
  Amygdaloideae) are deliberately both included to exercise both paths of
  the taxonomic backbone.
- Orchidaceae is a risk item — cut it if care data proves inconsistent
  rather than forcing incomplete entries to hit the species count.
