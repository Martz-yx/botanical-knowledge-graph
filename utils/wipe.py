import os
with open('.env') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            os.environ[k] = v.strip('\'\"')
from neo4j import GraphDatabase
uri = os.environ['NEO4J_URI']
user = os.environ.get('NEO4J_USER', os.environ.get('NEO4J_USERNAME', 'neo4j'))
password = os.environ['NEO4J_PASSWORD']
driver = GraphDatabase.driver(uri, auth=(user, password))
with driver.session() as session:
    session.run('MATCH (n) DETACH DELETE n')
    print('Neo4j Graph Database wiped successfully.')
driver.close()
