import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'neo4j';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

export async function GET() {
  const session = driver.session();
  try {
    const query = `
      MATCH (s:Species)
      RETURN id(s) as id, s
      ORDER BY s.name ASC
    `;
    const result = await session.run(query);
    
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
    
    return NextResponse.json(species);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch plants' }, { status: 500 });
  } finally {
    await session.close();
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, wateringLevel, lightRequirement, growthPattern, soilType, pollinators, nativeRegions, ppfdMin, ppfdMax } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const session = driver.session();
    try {
      const query = `
        MATCH (s:Species)
        WHERE id(s) = toInteger($id)
        SET s.wateringLevel = $wateringLevel,
            s.lightRequirement = $lightRequirement,
            s.growthPattern = $growthPattern,
            s.soilType = $soilType,
            s.pollinators = $pollinators,
            s.nativeRegions = $nativeRegions,
            s.ppfdMin = toInteger($ppfdMin),
            s.ppfdMax = toInteger($ppfdMax)
        RETURN id(s) as id, s
      `;
      const result = await session.run(query, {
        id,
        wateringLevel: wateringLevel || '',
        lightRequirement: lightRequirement || '',
        growthPattern: growthPattern || '',
        soilType: soilType || '',
        pollinators: pollinators || '',
        nativeRegions: nativeRegions || '',
        ppfdMin: ppfdMin || null,
        ppfdMax: ppfdMax || null
      });
      
      return NextResponse.json({ success: true });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to update plant' }, { status: 500 });
  }
}
