import os
import yaml
from pathlib import Path
from neo4j import GraphDatabase
from dotenv import load_dotenv
import re

# Load environment
load_dotenv(Path(r"c:\Users\Angel Rosemberg\botanical-knowledge-graph\webapp\.env.local"))
uri = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
user = os.environ.get("NEO4J_USER", "neo4j")
password = os.environ.get("NEO4J_PASSWORD", "neo4j")
driver = GraphDatabase.driver(uri, auth=(user, password))

md_dir = Path(r"C:\Users\Angel Rosemberg\Downloads\Capacities (2026-07-08 09-31-17)\Botanik\Plants")

def parse_frontmatter(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if not match:
        return None
    
    try:
        data = yaml.safe_load(match.group(1))
        return data
    except yaml.YAMLError as e:
        print(f"Error parsing YAML in {file_path.name}: {e}")
        return None

def process_plants():
    processed = 0
    added = 0
    updated = 0
    
    with driver.session() as session:
        for md_file in md_dir.glob("*.md"):
            data = parse_frontmatter(md_file)
            if not data or 'title' not in data:
                continue
                
            title = data.get('title')
            maxPpfd = data.get('maxPpfd', 0)
            minPpfd = data.get('minPpfd', 0)
            watering = data.get('watering', 3)
            humidity = data.get('humidity', 50)
            growthRate = data.get('growthRate', 50)
            
            # Check if species exists
            res = session.run("MATCH (s:Species) WHERE toLower(s.scientificName) = toLower($title) OR toLower(s.name) = toLower($title) RETURN s.scientificName", title=title)
            record = res.single()
            
            if record:
                # Update existing
                session.run("""
                MATCH (s:Species) WHERE toLower(s.scientificName) = toLower($title) OR toLower(s.name) = toLower($title)
                SET s.ppfdMax = $maxPpfd,
                    s.ppfdMin = $minPpfd,
                    s.wateringLevel = $watering,
                    s.humidity = $humidity,
                    s.growthRate = $growthRate
                """, title=title, maxPpfd=maxPpfd, minPpfd=minPpfd, watering=watering, humidity=humidity, growthRate=growthRate)
                updated += 1
                print(f"Updated: {title}")
            else:
                # Create new
                session.run("""
                CREATE (s:Species {
                    scientificName: $title,
                    name: $title,
                    ppfdMax: $maxPpfd,
                    ppfdMin: $minPpfd,
                    wateringLevel: $watering,
                    humidity: $humidity,
                    growthRate: $growthRate
                })
                """, title=title, maxPpfd=maxPpfd, minPpfd=minPpfd, watering=watering, humidity=humidity, growthRate=growthRate)
                added += 1
                print(f"Added NEW: {title}")
                
            processed += 1
            
    print(f"Done. Processed {processed} md files. Updated: {updated}. Added: {added}")

if __name__ == "__main__":
    process_plants()
