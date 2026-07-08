import os
from neo4j import GraphDatabase
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(r"c:\Users\Angel Rosemberg\botanical-knowledge-graph\webapp\.env.local"))
uri = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
user = os.environ.get("NEO4J_USER", "neo4j")
password = os.environ.get("NEO4J_PASSWORD", "neo4j")
driver = GraphDatabase.driver(uri, auth=(user, password))

EXTREMELY_DRY_FAMILIES = ['cactaceae', 'crassulaceae', 'aizoaceae', 'agavaceae', 'asphodelaceae', 'portulacaceae', 'euphorbiaceae', 'apocynaceae', 'didiereaceae', 'zamiaceae']
AQUATIC_FAMILIES = ['nymphaeaceae', 'hydrocharitaceae', 'alismataceae', 'pontederiaceae', 'araceae (some)', 'lentibulariaceae', 'haloragaceae', 'nelumbonaceae']

def analyze():
    updates_1 = []
    updates_5 = []
    
    with driver.session() as session:
        # Get species and their families
        res = session.run("""
        MATCH (s:Species)-[:BELONGS_TO*]->(f:Family)
        RETURN id(s) as id, s.name as name, f.name as family, 
               toLower(s.soilType) as soil, toLower(s.growthPattern) as pattern, 
               s.wateringLevel as wl
        """)
        
        for r in res:
            sid = r['id']
            name = r['name'] or ''
            family = (r['family'] or '').lower()
            soil = r['soil'] or ''
            pattern = r['pattern'] or ''
            wl = r['wl']
            
            # Check for Aquatic (Level 5)
            is_aquatic = False
            if any(af in family for af in AQUATIC_FAMILIES):
                is_aquatic = True
            if 'aquatic' in pattern or 'floating' in pattern or 'submerged' in pattern:
                is_aquatic = True
            if 'aquatic' in soil or 'water' in soil or 'pond' in soil or 'bog' in soil or 'swamp' in soil:
                is_aquatic = True
                
            # Check for Extremely Dry (Level 1)
            is_dry = False
            if any(df in family for df in EXTREMELY_DRY_FAMILIES) and 'euphorbiaceae' not in family: # Euphorbia is tricky, mostly succulents but not all
                is_dry = True
            if 'cactus' in name.lower() or 'succulent' in pattern:
                is_dry = True
            if 'desert' in soil or 'arid' in soil or 'very dry' in soil:
                is_dry = True
                
            if is_aquatic and wl != 5:
                updates_5.append((sid, name, family, wl))
            elif is_dry and wl != 1:
                updates_1.append((sid, name, family, wl))
                
        print(f"Found {len(updates_1)} candidates for Extremely Dry (Level 1)")
        for u in updates_1[:10]: print(u)
        
        print(f"Found {len(updates_5)} candidates for Aquatic (Level 5)")
        for u in updates_5[:10]: print(u)
        
        # Apply updates
        if updates_1 or updates_5:
            print("Applying updates...")
            for sid, _, _, _ in updates_1:
                session.run("MATCH (s) WHERE id(s) = $sid SET s.wateringLevel = 1, s.humidity = 20", sid=sid)
            for sid, _, _, _ in updates_5:
                session.run("MATCH (s) WHERE id(s) = $sid SET s.wateringLevel = 5, s.humidity = 95", sid=sid)
            print("Updates applied.")
            
if __name__ == "__main__":
    analyze()
