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
      WHERE toLower(s.commonName) CONTAINS toLower($q) OR toLower(s.scientificName) CONTAINS toLower($q) OR toLower(s.name) CONTAINS toLower($q)
      OPTIONAL MATCH (s)-[:HAS_CARE_PROFILE]->(cp:CareProfile)
      RETURN id(s) as id, s.name as name, s.commonName as commonName, s.scientificName as scientificName, cp
      LIMIT 10
    `;
    const result = await session.run(query, { q });
    
    const species = result.records.map(record => ({
      id: record.get('id').toNumber(),
      name: record.get('name') || record.get('commonName') || record.get('scientificName'),
      scientificName: record.get('scientificName'),
      commonName: record.get('commonName'),
      careProfile: record.get('cp') ? record.get('cp').properties : null
    }));

    return NextResponse.json({ results: species });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}
