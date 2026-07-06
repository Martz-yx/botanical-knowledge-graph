# Memoria del Proyecto: Botanical Knowledge Graph (Flora-Graph)

## Resumen del Proyecto
El proyecto "Botanical Knowledge Graph" (también conocido como Flora-Graph) es un grafo de conocimiento construido en **Neo4j** que documenta aproximadamente 320 especies de plantas cultivadas distribuidas en 20 familias. El grafo no solo modela la taxonomía botánica, sino que también incluye perfiles de cuidados hortícolas y relaciones ecológicas y de cultivo entre las plantas.

## Stack Tecnológico
- **Base de Datos:** Neo4j (versión 5), compatible con Neo4j Aura.
- **Lenguaje/Herramientas:** Python 3, usando el SDK de Neo4j (`neo4j` driver).
- **Infraestructura Local:** Docker y Docker Compose para levantar la instancia local de Neo4j (con el plugin APOC activado).

## Estructura del Repositorio
- `schema/`: Contiene la definición del esquema del grafo (`flora-graph-schema.md`) y la lista autoritativa de especies (`flora-graph-species-list.md`).
- `processed/`: Directorio donde se almacenan los archivos de datos en formato CSV (uno por familia) así como los archivos de relaciones (`companion_edges.csv`, `pollinator_edges.csv`).
- `ingestion/`: Contiene el pipeline principal de carga de datos hacia Neo4j (`load_graph.py`) y un script de verificación (`verify.py`).
- `docker-compose.yml`: Configuración para levantar la base de datos localmente exponiendo los puertos 7474 y 7687.
- `sourcing-log.md` y `sourcing-log-batch3.md`: Registros de procedencia de los datos, notas, lagunas y ambigüedades taxonómicas/hortícolas (ej. taxonomía de Sansevieria tratada como Dracaena, especies de orquídeas con datos parciales).

## Modelo del Grafo (Graph Model)

### Nodos (Labels)
El esquema modela la taxonomía jerárquica y entidades complementarias:
- **Taxonomía:** `Kingdom` (Plantae), `Phylum`, `Class`, `Order`, `Family` (20 familias), `Subfamily` (32 subfamilias), `Genus` (242 géneros), `Species` (320 especies).
- **Otros:** `CareProfile` (316 especies con datos hortícolas), `Pollinator` (14 taxones de polinizadores).

### Relaciones (Relationships)
- `(Taxón Menor)-[:BELONGS_TO]->(Taxón Mayor)`: Relación del árbol taxonómico.
- `(Species)-[:HAS_CARE_PROFILE]->(CareProfile)`: Conexión con los datos de cuidado.
- `(Species)-[:GROWS_WELL_WITH]->(Species)`: Plantas complementarias (companion planting).
- `(Species)-[:INHIBITS]->(Species)`: Alelopatía (plantas antagonistas).
- `(Species)-[:POLLINATED_BY]->(Pollinator)`: Ecología de polinización.

### Restricciones (Constraints)
- Índices únicos en las propiedades clave de cada etiqueta principal (`scientific_name`, `name`).
- Unicidad compuesta para subfamilias (`Subfamily.family`, `Subfamily.name`).

## Ejecución y Flujo de Trabajo
1. **Entorno Local:** Se levanta la BD con `docker compose up neo4j -d`. Se copian las variables de entorno desde `.env.example` hacia `.env`.
2. **Ingesta de Datos:** El script `python3 ingestion/load_graph.py` lee los CSVs de la carpeta `processed/` y los carga en Neo4j mediante el SDK de Python utilizando consultas Cypher. Se puede verificar la carga accediendo a la consola de Neo4j en `http://localhost:7474`.

## Notas Adicionales y Contexto (Lo que se sabe / Lo que falta saber)
- **Propósito de los Datos:** El dataset está compilado a partir de fuentes de dominio público como Wikipedia, bases de datos de toxicidad, manuales hortícolas, etc.
- **Enfoque Actual del Repositorio:** El repositorio actúa exclusivamente como un entorno de Ingesta (ETL) y definición de Base de Datos / Grafo de Conocimiento. 
- **Lo que falta por conocer (Para desarrollo futuro):** 
  - Actualmente no hay en el repositorio una interfaz gráfica (Frontend) o aplicación cliente (API, LLM agent, etc.) que consuma los datos del grafo.
  - (Nota: Existe historial reciente de conversaciones sobre la implementación de una aplicación en Chainlit con SQL para "Desambiguación de Establecimientos", pero ese flujo parece no pertenecer a este modelo botánico basado en Neo4j, sino posiblemente a otro proyecto paralelo).
