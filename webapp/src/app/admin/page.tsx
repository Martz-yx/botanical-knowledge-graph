"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProgressBarInput = ({ 
  value, 
  onChange, 
  type = "number", 
  color = "#feca57", 
  max = 2000, 
  isCategorical = false 
}: { 
  value: string | number, 
  onChange: (val: string) => void, 
  type?: "number" | "text",
  color?: string,
  max?: number,
  isCategorical?: boolean
}) => {
  let percentage = 0;
  
  if (isCategorical) {
    const valLower = String(value || '').toLowerCase();
    if (valLower.includes('high')) percentage = 100;
    else if (valLower.includes('medium')) percentage = 66;
    else if (valLower.includes('low')) percentage = 33;
  } else {
    const numVal = Number(value) || 0;
    percentage = Math.min(100, Math.max(0, (numVal / max) * 100));
  }

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '4px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        height: '100%', 
        width: `${percentage}%`, 
        background: color, 
        opacity: 0.3,
        transition: 'width 0.3s ease'
      }}></div>
      <input 
        type={type === 'number' ? 'number' : 'text'}
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        style={{
          width: '100%',
          padding: '0.5rem',
          background: 'transparent',
          color: 'white',
          border: 'none',
          outline: 'none',
          position: 'relative',
          zIndex: 1,
          fontWeight: 'bold',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)'
        }} 
      />
    </div>
  );
};

export default function AdminDashboard() {
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const res = await fetch('/api/plants');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setPlants(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  const handleChange = (id: number, field: string, value: string) => {
    setPlants(plants.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = async (plant: any) => {
    try {
      const payload = {
        ...plant,
        ppfdMin: plant.ppfdMin ? parseInt(plant.ppfdMin) : null,
        ppfdMax: plant.ppfdMax ? parseInt(plant.ppfdMax) : null,
      };
      const res = await fetch('/api/plants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Saved successfully!');
      } else {
        alert('Failed to save.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving plant.');
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-color)', color: 'var(--text-main)', minHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-highlight)' }}>Admin Dashboard (Notion-style Database)</h1>
        <button onClick={handleLogout} style={{
          background: '#ff6b6b', color: 'white', padding: '0.5rem 1rem',
          border: 'none', borderRadius: '4px', cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '1rem', minWidth: '150px' }}>Species Name</th>
              <th style={{ padding: '1rem', minWidth: '120px' }}>Min PPFD</th>
              <th style={{ padding: '1rem', minWidth: '120px' }}>Max PPFD</th>
              <th style={{ padding: '1rem', minWidth: '150px' }}>Watering</th>
              <th style={{ padding: '1rem', minWidth: '150px' }}>Sunlight</th>
              <th style={{ padding: '1rem', minWidth: '150px' }}>Growth Pattern</th>
              <th style={{ padding: '1rem', minWidth: '150px' }}>Soil Type</th>
              <th style={{ padding: '1rem', minWidth: '150px' }}>Pollinators</th>
              <th style={{ padding: '1rem', minWidth: '200px' }}>Native Regions</th>
              <th style={{ padding: '1rem', minWidth: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plants.map(plant => (
              <tr key={plant.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{plant.name}</td>
                <td style={{ padding: '0.5rem' }}>
                  <ProgressBarInput value={plant.ppfdMin} onChange={(val) => handleChange(plant.id, 'ppfdMin', val)} color="#ff9f43" />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <ProgressBarInput value={plant.ppfdMax} onChange={(val) => handleChange(plant.id, 'ppfdMax', val)} color="#ff9f43" />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <ProgressBarInput value={plant.wateringLevel} onChange={(val) => handleChange(plant.id, 'wateringLevel', val)} type="text" isCategorical={true} color="#48dbfb" />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input type="text" value={plant.lightRequirement || ''} onChange={(e) => handleChange(plant.id, 'lightRequirement', e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input type="text" value={plant.growthPattern || ''} onChange={(e) => handleChange(plant.id, 'growthPattern', e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input type="text" value={plant.soilType || ''} onChange={(e) => handleChange(plant.id, 'soilType', e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input type="text" value={plant.pollinators || ''} onChange={(e) => handleChange(plant.id, 'pollinators', e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input type="text" value={plant.nativeRegions || ''} onChange={(e) => handleChange(plant.id, 'nativeRegions', e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <button onClick={() => handleSave(plant)} style={{
                    background: 'var(--accent)', color: '#0b0c10', padding: '0.5rem 1rem',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                  }}>
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'white',
  borderRadius: '4px',
  outline: 'none'
};
