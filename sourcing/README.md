# Hybrid Data Sourcing Pipeline

This directory contains the tools for dynamically generating massive amounts of highly accurate botanical data using a combination of traditional APIs and Large Language Models.

## The Problem
While traditional taxonomic databases (like GBIF) have mathematically precise biological classifications, they completely lack conversational horticultural data (e.g., "How much water does this need?", "What bugs pollinate it?", "Does it grow well with tomatoes?").

Conversely, LLMs (like Gemini) excel at horticultural advice, but often hallucinate taxonomic structures or invent fake scientific names.

## The Hybrid Solution
Our `hybrid_sourcer.py` bridges the gap:
1. It queries the **GBIF API** to retrieve an ironclad taxonomic backbone (Kingdom, Phylum, Class, Order, Family, Genus, Species).
2. It passes the verified scientific name to **Google Gemini 2.5 Flash**.
3. Gemini processes a strict JSON-schema prompt to generate environmental variables, companions, regions, and pollinators.
4. The script merges the two data sources into a finalized CSV row.

## Mass Sourcing
Because LLM APIs have strict rate limits (e.g., 15 Requests Per Minute on the Free Tier), we use `mass_source.ps1` to loop over arrays of botanical families. The script enforces a strict `time.sleep(16)` delay between requests, allowing it to run unattended as an overnight batch job to generate thousands of plants without triggering a `429 RESOURCE_EXHAUSTED` ban.
