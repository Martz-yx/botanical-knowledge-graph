# Graph Data Schema

This folder contains the documentation (e.g., `flora-graph-schema.md`) defining the structural integrity of the Botanical Knowledge Graph.

## Core Entities
- **Taxonomic Nodes:** `Kingdom`, `Phylum`, `Class`, `Order`, `Family`, `Subfamily`, `Genus`, `Species`. These represent the strict biological hierarchy of the plant.
- **Environmental Nodes:** `CareProfile`. Represents a unique combination of sunlight, water, and soil requirements.
- **Ecological Nodes:** `Pollinator`, `Region`. Represents the real-world ecological impact and origins of the plant.

## Core Relationships
- `(Species)-[:BELONGS_TO]->(Genus)`: Traces the plant up the taxonomic tree.
- `(Species)-[:HAS_CARE_PROFILE]->(CareProfile)`: Links the plant to its environmental needs.
- `(Species)-[:GROWS_WELL_WITH]->(Species)`: Represents a companion planting synergy (e.g., Tomatoes and Basil).
- `(Species)-[:INHIBITS]->(Species)`: Represents allelopathy or negative interactions (e.g., Walnuts inhibiting Tomatoes).
- `(Species)-[:POLLINATED_BY]->(Pollinator)`: Links plants to local ecology (Bees, Moths, Bats).

## The Power of the Schema
By abstracting `CareProfile` into its own node rather than keeping it as properties on the `Species`, the database automatically clusters similar plants together. A user can query a `CareProfile` and instantly discover 50 distinct species that thrive in identical conditions, creating a native recommendation engine without complex SQL joins.
