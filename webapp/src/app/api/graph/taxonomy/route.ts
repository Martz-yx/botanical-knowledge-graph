import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const session = driver.session();
  try {
    if (!id) {
      // Fetch the entire taxonomy graph
      const queryFull = `
        MATCH path = (s:Species)-[:BELONGS_TO*]->(k:Kingdom)
        RETURN nodes(path) as nodes, relationships(path) as rels
        LIMIT 200
      `;
      const result = await session.run(queryFull);
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
    }

    // Traverse upwards (BELONGS_TO) to get the taxonomy lineage
    const queryLineage = `
      MATCH (s) WHERE id(s) = toInteger($id)
      OPTIONAL MATCH path = (s)-[:BELONGS_TO*]->(ancestor)
      RETURN s, nodes(path) as nodes, relationships(path) as rels
    `;
    const result = await session.run(queryLineage, { id });
    
    const nodesMap = new Map();
    const linksMap = new Set();
    const links: any[] = [];

    result.records.forEach(record => {
      const sNode = record.get('s');
      if (sNode) {
        const sId = sNode.identity.toNumber();
        if (!nodesMap.has(sId)) {
          nodesMap.set(sId, {
            id: sId,
            label: sNode.labels[0],
            name: sNode.properties.name || sNode.properties.scientificName || sNode.properties.commonName
          });
        }
      }

      const pathNodes = record.get('nodes');
      const pathRels = record.get('rels');

      if (pathNodes) {

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

      }

      if (pathRels) {
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
      }
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
        const targetId = record.get('target').toNumber();
        const linkId = `${siblingId}-${targetId}`;
        if (!linksMap.has(linkId)) {
          linksMap.add(linkId);
          links.push({
            source: siblingId,
            target: targetId,
            type: 'BELONGS_TO'
          });
        }
      }
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
    console.error('Graph error:', error);
    return NextResponse.json({ error: 'Graph fetch failed', details: error.message, stack: error.stack }, { status: 500 });
  } finally {
    await session.close();
  }
}
