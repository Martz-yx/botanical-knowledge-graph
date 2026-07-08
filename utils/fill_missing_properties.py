import os
from neo4j import GraphDatabase
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(r"c:\Users\Angel Rosemberg\botanical-knowledge-graph\webapp\.env.local"))
uri = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
user = os.environ.get("NEO4J_USER", "neo4j")
password = os.environ.get("NEO4J_PASSWORD", "neo4j")
driver = GraphDatabase.driver(uri, auth=(user, password))

def fill_missing():
    with driver.session() as session:
        # First, find all nodes to process
        res = session.run("MATCH (s:Species) RETURN elementId(s) AS eid, s.wateringLevel AS wateringLevel, s.humidity AS humidity, s.growthRate AS growthRate")
        records = list(res)
        
        updated = 0
        for r in records:
            eid = r['eid']
            watering_val = r['wateringLevel']
            humidity = r['humidity']
            growth = r['growthRate']
            
            needs_update = False
            
            # Map string to int if necessary
            new_watering = watering_val
            if isinstance(watering_val, str):
                w_lower = watering_val.lower().strip()
                if 'low' in w_lower and 'extremely' not in w_lower: new_watering = 2
                elif 'medium' in w_lower: new_watering = 3
                elif 'high' in w_lower and 'extremely' not in w_lower: new_watering = 4
                elif 'extremely low' in w_lower: new_watering = 1
                elif 'extremely high' in w_lower or 'aquatic' in w_lower: new_watering = 5
                else: new_watering = 3
                needs_update = True
                
            elif watering_val is None:
                new_watering = 3
                needs_update = True
                
            if humidity is None:
                # Heuristic
                if new_watering == 1: humidity = 20
                elif new_watering == 2: humidity = 40
                elif new_watering == 3: humidity = 60
                elif new_watering == 4: humidity = 80
                else: humidity = 95
                needs_update = True
                
            if growth is None:
                growth = 50
                needs_update = True
                
            if needs_update:
                session.run("""
                MATCH (s:Species) WHERE elementId(s) = $eid
                SET s.wateringLevel = $new_watering,
                    s.humidity = $humidity,
                    s.growthRate = $growth
                """, eid=eid, new_watering=int(new_watering) if new_watering is not None else 3, humidity=humidity, growth=growth)
                updated += 1
                
        print(f"Updated {updated} out of {len(records)} nodes.")

if __name__ == "__main__":
    fill_missing()
