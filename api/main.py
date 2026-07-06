import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uri = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
user = os.environ.get("NEO4J_USER", "neo4j")
password = os.environ.get("NEO4J_PASSWORD", "neo4j")

driver = GraphDatabase.driver(uri, auth=(user, password))

@app.get("/api/graph/initial")
def get_initial_graph():
    # Return all Kingdoms and their Phyla
    query = """
    MATCH (k:Kingdom)<-[r:BELONGS_TO]-(p:Phylum)
    RETURN 
        id(k) as source_id, labels(k)[0] as source_label, k.name as source_name,
        id(p) as target_id, labels(p)[0] as target_label, p.name as target_name,
        type(r) as rel_type
    """
    
    nodes = {}
    links = []
    
    with driver.session() as session:
        result = session.run(query)
        for record in result:
            s_id = str(record["source_id"])
            t_id = str(record["target_id"])
            
            nodes[s_id] = {"id": s_id, "label": record["source_label"], "name": record["source_name"]}
            nodes[t_id] = {"id": t_id, "label": record["target_label"], "name": record["target_name"]}
            
            links.append({"source": t_id, "target": s_id, "type": record["rel_type"]})
            
    # Add standalone kingdoms if any have no phyla
    with driver.session() as session:
        k_res = session.run("MATCH (k:Kingdom) RETURN id(k) as id, k.name as name")
        for k in k_res:
            k_id = str(k["id"])
            if k_id not in nodes:
                nodes[k_id] = {"id": k_id, "label": "Kingdom", "name": k["name"]}

    return {"nodes": list(nodes.values()), "links": links}

@app.get("/api/graph/expand/{node_id}")
def expand_node(node_id: str):
    # Find all nodes that BELONG_TO this node
    query = """
    MATCH (child)-[r:BELONGS_TO]->(parent)
    WHERE id(parent) = toInteger($node_id)
    RETURN 
        id(child) as child_id, labels(child)[0] as child_label, child.name as child_name, child.scientificName as child_sci_name,
        type(r) as rel_type
    """
    
    nodes = []
    links = []
    
    with driver.session() as session:
        result = session.run(query, node_id=node_id)
        for record in result:
            c_id = str(record["child_id"])
            c_name = record["child_sci_name"] if record["child_sci_name"] else record["child_name"]
            
            nodes.append({"id": c_id, "label": record["child_label"], "name": c_name})
            links.append({"source": c_id, "target": node_id, "type": record["rel_type"]})
            
    return {"nodes": nodes, "links": links}
