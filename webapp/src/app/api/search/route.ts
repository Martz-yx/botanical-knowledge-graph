import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const session = driver.session();
  try {
    // Search for a species by commonName or scientificName (case insensitive regex/contains)
    // Return species and their care profile if any
    const query = `
      MATCH (s:Species)
      WHERE toLower(s.scientificName) CONTAINS toLower($q) 
         OR toLower(s.name) CONTAINS toLower($q)
         OR (s.commonNames IS NOT NULL AND any(c IN s.commonNames WHERE toLower(c) CONTAINS toLower($q)))
      RETURN id(s) as id, s
      LIMIT 10
    `;
    const result = await session.run(query, { q });
    
    const species = result.records.map(record => {
      const node = record.get('s').properties;
      // Convert any neo4j Integer objects (which have .low and .high) to Javascript numbers
      const cleanedNode: any = {};
      for (const [k, v] of Object.entries(node)) {
        if (v && typeof v === 'object' && 'low' in v && 'high' in v) {
          cleanedNode[k] = (v as any).toNumber();
        } else {
          cleanedNode[k] = v;
        }
      }
      return {
        id: record.get('id').toNumber(),
        ...cleanedNode,
        name: cleanedNode.name || cleanedNode.commonName || cleanedNode.scientificName
      };
    });

    return NextResponse.json({ results: species });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}
