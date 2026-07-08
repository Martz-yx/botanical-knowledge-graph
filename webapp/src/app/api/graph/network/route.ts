import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const depth = parseInt(searchParams.get('depth') || '3');
  
  if (!id) {
    return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
  }

  const session = driver.session();
  try {
    const query = `
      MATCH (start) WHERE id(start) = toInteger($id)
      MATCH path = (start)-[:BELONGS_TO*0..${depth}]-(relative)
      RETURN nodes(path) as nodes, relationships(path) as rels
    `;
    const result = await session.run(query, { id: parseInt(id) });
    const nodesMap = new Map();
    const linksMap = new Set();
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
        const sourceId = rel.start.toNumber();
        const targetId = rel.end.toNumber();
        const linkId = `${sourceId}-${targetId}`;
        if (!linksMap.has(linkId)) {
          linksMap.add(linkId);
          links.push({
            source: sourceId,
            target: targetId,
            type: rel.type
          });
        }
      });
    });

    // Now fetch child counts for all loaded nodes
    const nodeIds = Array.from(nodesMap.keys());
    if (nodeIds.length > 0) {
      const childCountQuery = `
        UNWIND $nodeIds AS id
        MATCH (n) WHERE id(n) = id
        OPTIONAL MATCH (c)-[:BELONGS_TO]->(n)
        RETURN id, count(c) as count
      `;
      const countRes = await session.run(childCountQuery, { nodeIds });
      countRes.records.forEach(r => {
        const idVal = r.get('id');
        const nid = typeof idVal === 'number' ? idVal : idVal.toNumber();
        const countVal = r.get('count');
        const count = typeof countVal === 'number' ? countVal : countVal.toNumber();
        if (nodesMap.has(nid)) {
          nodesMap.get(nid).childCount = count;
        }
      });
    }

    return NextResponse.json({ 
      nodes: Array.from(nodesMap.values()), 
      links 
    });
  } catch (error: any) {
    console.error('Graph network error:', error);
    return NextResponse.json({ error: 'Graph fetch failed', details: error.message, stack: error.stack }, { status: 500 });
  } finally {
    await session.close();
  }
}
