import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const session = driver.session();
  try {
    // Traverse upwards (BELONGS_TO) to get the taxonomy lineage
    const queryLineage = `
      MATCH path = (s)-[:BELONGS_TO*]->(k:Kingdom)
      WHERE id(s) = toInteger($id)
      RETURN nodes(path) as nodes, relationships(path) as rels
    `;
    const result = await session.run(queryLineage, { id });
    
    const nodesMap = new Map();
    const links: any[] = [];

    result.records.forEach(record => {
      const pathNodes = record.get('nodes');
      const pathRels = record.get('rels');

      pathNodes.forEach((node: any) => {
        const nodeId = node.identity.toNumber();
        if (!nodesMap.has(nodeId)) {
          nodesMap.set(nodeId, {
            id: nodeId,
            label: node.labels[0],
            name: node.properties.name || node.properties.scientificName || node.properties.commonName
          });
        }
      });

      pathRels.forEach((rel: any) => {
        links.push({
          source: rel.start.toNumber(),
          target: rel.end.toNumber(),
          type: rel.type
        });
      });
    });

    // Also get siblings (other species in the same genus) to make exploration interesting
    const querySiblings = `
      MATCH (s)-[:BELONGS_TO]->(g:Genus)<-[:BELONGS_TO]-(sibling:Species)
      WHERE id(s) = toInteger($id)
      RETURN id(sibling) as id, labels(sibling)[0] as label, sibling.name as name, sibling.scientificName as scientificName, sibling.commonName as commonName, id(g) as target
      LIMIT 15
    `;
    const resultSiblings = await session.run(querySiblings, { id });
    
    resultSiblings.records.forEach(record => {
      const siblingId = record.get('id').toNumber();
      if (!nodesMap.has(siblingId)) {
        nodesMap.set(siblingId, {
          id: siblingId,
          label: record.get('label'),
          name: record.get('name') || record.get('commonName') || record.get('scientificName')
        });
        links.push({
          source: siblingId,
          target: record.get('target').toNumber(),
          type: 'BELONGS_TO'
        });
      }
    });

    return NextResponse.json({ 
      nodes: Array.from(nodesMap.values()), 
      links 
    });
  } catch (error) {
    console.error('Graph error:', error);
    return NextResponse.json({ error: 'Graph fetch failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}
