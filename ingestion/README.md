# Graph Ingestion Scripts

This module is responsible for extracting the generated CSV files from the `processed/` directory and loading them into the Neo4j Graph Database.

## Features

- **Cypher ETL:** The `load_graph.py` script uses the official `neo4j` Python driver to run highly optimized `UNWIND` Cypher queries. Instead of inserting rows one-by-one, it passes entire CSV arrays into Neo4j in a single transaction for massive performance gains.
- **Null Safety:** Because taxonomic data from the wild is often incomplete (e.g., missing Class or Subfamily), the ingestion scripts use `coalesce()` and conditional `FOREACH` loops to dynamically build the taxonomy tree without breaking the Graph constraints if an intermediate node is missing.
- **Many-to-1 Profile Linking:** The script hashes the environmental care data (sunlight, water, soil) into a unified `CareProfile` ID. It then uses the `MERGE` command to ensure that if 50 different species share the exact same environmental needs, they all link to the *same* `CareProfile` node, vastly reducing graph size and enabling powerful recommendation queries.
