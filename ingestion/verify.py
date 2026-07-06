from dotenv import load_dotenv
from pathlib import Path
from neo4j import GraphDatabase
import os, re

load_dotenv(Path('.').resolve() / '.env')
uri = os.environ['NEO4J_URI']
user = os.environ.get('NEO4J_USER', os.environ.get('NEO4J_USERNAME', 'neo4j'))
pw = os.environ['NEO4J_PASSWORD']
d = GraphDatabase.driver(uri, auth=(user, pw))

with d.session() as s:
    print('=== Solanum lycopersicum path ===')
    r = s.run("""
        MATCH (sp:Species {scientific_name:'Solanum lycopersicum'})
        MATCH (sp)-[:BELONGS_TO]->(g:Genus)-[:BELONGS_TO]->(f:Family)
        RETURN sp.scientific_name AS species, g.name AS genus, f.name AS family
    """).data()
    for row in r:
        print(f"  {row['species']} | Genus={row['genus']} | Family={row['family']}")

    print()
    print('=== Solanum edges ===')
    for rel in ['GROWS_WELL_WITH', 'INHIBITS', 'HAS_CARE_PROFILE', 'POLLINATED_BY']:
        for row in s.run(f"""
            MATCH (sp:Species {{scientific_name:'Solanum lycopersicum'}})-[r:{rel}]->(n)
            RETURN type(r) AS t, labels(n)[0] AS lbl,
                   coalesce(n.name, n.species_ref) AS tgt, r.confidence AS conf
        """).data():
            print(f"  {row['t']}({row['conf']}) -> {row['lbl']}({row['tgt']})")

    print()
    print('=== Family counts ===')
    fams = s.run("""
        MATCH (sp:Species)-[:BELONGS_TO]->(g:Genus)-[:BELONGS_TO]->(f:Family)
        RETURN f.name AS fam, count(DISTINCT sp) AS n
        ORDER BY fam
    """).data()
    loaded = {r['fam']: r['n'] for r in fams if r['fam']}
    for fam in sorted(loaded):
        print(f"  {fam}: {loaded[fam]}")

    print()
    tot_sp = s.run("MATCH (n:Species) RETURN count(n) AS c").single()['c']
    tot_cp = s.run("MATCH (n:CareProfile) RETURN count(n) AS c").single()['c']
    tot_gen = s.run("MATCH (n:Genus) RETURN count(n) AS c").single()['c']
    tot_fam = s.run("MATCH (n:Family) RETURN count(n) AS c").single()['c']
    deep = s.run("MATCH p=(s:Species)-[:BELONGS_TO*3]->(f:Family) RETURN count(DISTINCT s) AS c").single()['c']
    print(f'Species={tot_sp}, CareProfile={tot_cp}, Genus={tot_gen}, Family={tot_fam}, depth3={deep}')

d.close()
