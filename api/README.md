# FastAPI Botanical Backend

This directory contains the lightweight REST API built with **FastAPI** that acts as the bridge between the Neo4j database and any frontend interfaces.

## Why FastAPI?
FastAPI was chosen because of its exceptional asynchronous performance and native integration with Python's typing system. It allows us to securely execute Neo4j Cypher queries and serve the results as JSON instantaneously.

## Endpoints

### `GET /api/graph/initial`
Fetches the very top of the taxonomic tree. It queries Neo4j for all `Kingdom` nodes and their immediate `Phylum` children. This is used by the frontend to render the initial state of the graph.

### `GET /api/graph/expand/{node_id}`
A dynamic expansion endpoint. When a user clicks on a node in the frontend, this endpoint takes the internal Neo4j `id()` of that node, traverses the graph to find any children that `BELONGS_TO` it, and returns the newly discovered subgraph. 

## Running the API
The API relies on the Neo4j credentials specified in the `.env` file at the root of the project.

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
