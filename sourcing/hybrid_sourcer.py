import csv
import json
import os
import requests
import time
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# Ensure processed directory exists
PROCESSED_DIR = Path(__file__).resolve().parent.parent / "processed"
PROCESSED_DIR.mkdir(exist_ok=True)

CSV_HEADERS = [
    "scientific_name", "common_names", "image_url", "is_invasive",
    "genus", "subfamily", "family", "order", "class", "phylum", "kingdom",
    "watering_level", "ppfd_min", "ppfd_max", "light_requirement",
    "soil_type", "growth_pattern", "mature_height_cm", "toxicity_notes",
    "native_regions"
]

def fetch_gbif_taxonomy(family_name, limit=20):
    print(f"Fetching species for {family_name} from GBIF...")
    url = f"https://api.gbif.org/v1/species/search?q={family_name}&rank=SPECIES&kingdomKey=6&limit={limit}"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    
    species_list = []
    for result in data.get("results", []):
        if result.get("taxonomicStatus") == "ACCEPTED" and "species" in result:
            species_list.append({
                "scientific_name": result.get("species"),
                "genus": result.get("genus", ""),
                "family": result.get("family", ""),
                "order": result.get("order", ""),
                "class": result.get("class", ""),
                "phylum": result.get("phylum", ""),
                "kingdom": result.get("kingdom", "")
            })
    return species_list

def generate_care_profile(client, species_name):
    prompt = f"""
    Provide the horticultural care profile and metadata for the plant species: {species_name}.
    Return a valid JSON object with the following keys EXACTLY:
    - common_names: string (comma-separated common names)
    - image_url: string (leave empty if unknown)
    - is_invasive: boolean (true or false)
    - subfamily: string (leave empty if none)
    - watering_level: string (low, medium, or high)
    - ppfd_min: integer (minimum Photosynthetic Photon Flux Density)
    - ppfd_max: integer (maximum PPFD)
    - light_requirement: string (e.g. Full Sun, Partial Shade)
    - soil_type: string (e.g. Well-draining, Loamy)
    - growth_pattern: string (e.g. climbing, rosette, shrub, trailing)
    - mature_height_cm: integer (approximate height in cm)
    - toxicity_notes: string (leave empty if safe)
    - native_regions: string (comma/slash separated regions, e.g. North America / Europe)
    
    If any numeric value is unknown, use 0 or a reasonable estimate. If a string is unknown, return an empty string.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"  Error generating profile for {species_name}: {e}")
        return None

def source_family(family_name, limit=20):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in .env. Please add it to use the LLM enrichment engine.")
        return
        
    client = genai.Client(api_key=api_key)
    
    species_list = fetch_gbif_taxonomy(family_name, limit)
    print(f"Found {len(species_list)} accepted species.")
    
    csv_path = PROCESSED_DIR / f"{family_name.lower()}.csv"
    file_exists = csv_path.exists()
    
    with open(csv_path, 'a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        if not file_exists:
            writer.writeheader()
            
        for idx, taxonomy in enumerate(species_list):
            sname = taxonomy['scientific_name']
            print(f"Enriching ({idx+1}/{len(species_list)}): {sname}")
            
            care_data = generate_care_profile(client, sname)
            if not care_data:
                continue
                
            # Merge taxonomy and care data
            row_data = {**taxonomy, **care_data}
            
            # Ensure all keys match CSV_HEADERS exactly
            final_row = {key: row_data.get(key, "") for key in CSV_HEADERS}
            writer.writerow(final_row)
            
            # Sleep to avoid hitting the 15 RPM free tier limit
            print("  Sleeping 16 seconds to respect rate limits...")
            time.sleep(16)
            
    print(f"Finished! Data saved to {csv_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Hybrid Sourcing Engine for Flora Graph")
    parser.add_argument("family", help="Botanical family to source (e.g., Rutaceae)")
    parser.add_argument("--limit", type=int, default=20, help="Number of species to fetch")
    args = parser.parse_args()
    
    source_family(args.family, args.limit)
