import os
import csv
import time
from neo4j import GraphDatabase
from dotenv import load_dotenv
from pathlib import Path
from deep_translator import GoogleTranslator

load_dotenv(Path(r"c:\Users\Angel Rosemberg\botanical-knowledge-graph\webapp\.env.local"))
uri = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
user = os.environ.get("NEO4J_USER", "neo4j")
password = os.environ.get("NEO4J_PASSWORD", "neo4j")
driver = GraphDatabase.driver(uri, auth=(user, password))

csv_path = r"c:\Users\Angel Rosemberg\botanical-knowledge-graph\species_details.csv"

def get_translator():
    return GoogleTranslator(source='es', target='en')

def restore_and_translate():
    translator = get_translator()
    updates = 0
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        with driver.session() as session:
            for row in reader:
                sci_name = row.get('scientificName', '').strip()
                pollinators_es = row.get('pollinators', '').strip()
                regions_es = row.get('nativeRegions', '').strip()
                
                if not sci_name:
                    continue
                
                pollinators_en = ""
                regions_en = ""
                
                if pollinators_es:
                    try:
                        pollinators_en = translator.translate(pollinators_es)
                        time.sleep(0.05)
                    except Exception as e:
                        pollinators_en = pollinators_es
                
                if regions_es:
                    try:
                        regions_en = translator.translate(regions_es)
                        time.sleep(0.05)
                    except Exception as e:
                        regions_en = regions_es
                
                if pollinators_en or regions_en:
                    # Execute update
                    session.run("""
                    MATCH (s:Species)
                    WHERE toLower(s.scientificName) = toLower($name)
                    SET s.pollinators = $poll,
                        s.nativeRegions = $reg
                    """, name=sci_name, poll=pollinators_en if pollinators_en else None, reg=regions_en if regions_en else None)
                    updates += 1
                    
                    if updates % 10 == 0:
                        print(f"Restored {updates} nodes so far...")

    print(f"Done restoring. Total updated: {updates}")

if __name__ == "__main__":
    restore_and_translate()
