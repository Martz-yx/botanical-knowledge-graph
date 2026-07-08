"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Leaf, Droplets, Sun, Bug, Globe, Moon, Trees, Sprout, Haze, Orbit, Waypoints, GitFork, CloudRain, TrendingUp } from 'lucide-react';
import Graph from '@/components/Graph';

const LevelBar = ({ value }: { value: string | number }) => {
  let percentage = 0;
  let textLabel = String(value || 'Unknown');
  
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const num = Number(value);
    if (num === 1) { percentage = 20; textLabel = 'Extremely Low'; }
    else if (num === 2) { percentage = 40; textLabel = 'Low'; }
    else if (num === 3) { percentage = 60; textLabel = 'Medium'; }
    else if (num === 4) { percentage = 80; textLabel = 'High'; }
    else if (num === 5) { percentage = 100; textLabel = 'Extremely High / Aquatic'; }
  } else {
    const valLower = String(value || '').toLowerCase();
    if (valLower.includes('high')) { percentage = 100; textLabel = 'High'; }
    else if (valLower.includes('medium')) { percentage = 66; textLabel = 'Medium'; }
    else if (valLower.includes('low')) { percentage = 33; textLabel = 'Low'; }
  }

  if (percentage === 0) return <span className="stat-value">{textLabel}</span>;

  return (
    <div style={{ marginTop: '0.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', opacity: 0.7 }}>
        <span>Dry</span>
        <span>Aquatic</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)', 
          borderRadius: '4px', 
          transition: 'width 0.5s ease',
          boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)'
        }}></div>
      </div>
      <div style={{ fontSize: '0.8rem', marginTop: '4px', textAlign: 'center', color: '#3b82f6', fontWeight: 'bold' }}>{textLabel}</div>
    </div>
  );
};

const PercentageBar = ({ value, color, glowColor }: { value: number, color: string, glowColor: string }) => {
  if (value === undefined || value === null) return <span className="stat-value">Unknown</span>;
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div style={{ marginTop: '0.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', opacity: 0.7 }}>
        <span>0%</span>
        <span>100%</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: color, 
          borderRadius: '4px', 
          transition: 'width 0.5s ease',
          boxShadow: `0 0 8px ${glowColor}`
        }}></div>
      </div>
      <div style={{ fontSize: '0.8rem', marginTop: '4px', textAlign: 'center', color: glowColor, fontWeight: 'bold' }}>{percentage}%</div>
    </div>
  );
};

const RangeBar = ({ min, max }: { min: number, max: number }) => {
  if (!min && !max) return <span className="stat-value">Unknown</span>;
  
  const MAX_PPFD = 2000;
  const minVal = min || 0;
  const maxVal = max || minVal || 0;
  
  const startPercent = Math.min(100, Math.max(0, (minVal / MAX_PPFD) * 100));
  const endPercent = Math.min(100, Math.max(0, (maxVal / MAX_PPFD) * 100));
  const widthPercent = Math.max(2, endPercent - startPercent); // at least 2% width

  return (
    <div style={{ marginTop: '0.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', opacity: 0.7 }}>
        <span>0 μMol/m²/s</span>
        <span>2000 μMol/m²/s</span>
      </div>
      <div style={{ position: 'relative', width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
        <div style={{ 
          position: 'absolute',
          left: `${startPercent}%`,
          width: `${widthPercent}%`,
          height: '100%', 
          background: 'linear-gradient(90deg, #feca57 0%, #ff9f43 100%)', 
          borderRadius: '4px', 
          boxShadow: '0 0 8px rgba(255, 159, 67, 0.5)'
        }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', marginTop: '4px', color: '#feca57', fontWeight: 'bold' }}>
        <span>{minVal}</span>
        <span>-</span>
        <span>{maxVal}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [fullGraphData, setFullGraphData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [explorationMode, setExplorationMode] = useState<'lineage' | 'network'>('lineage');
  const [networkDepth, setNetworkDepth] = useState<number>(2);
  const [isExpanded, setIsExpanded] = useState(false);


  useEffect(() => {
    // Check initial body class for theme
    if (document.body.classList.contains('light-theme')) {
      setTheme('light');
    }
    
    // Load full graph initially
    fetch('/api/graph/taxonomy')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFullGraphData(data);
          setGraphData(data);
        }
      })
      .catch(console.error);
  }, []);

  // Effect to re-apply filtering when mode/depth changes
  useEffect(() => {
    if (!selectedSpecies || !fullGraphData) return;
    
    if (explorationMode === 'network') {
      fetch(`/api/graph/network?id=${selectedSpecies.id}&depth=${networkDepth}`)
        .then(res => res.json())
        .then(data => setGraphData(data))
        .catch(console.error);
    } else {
      // Lineage mode: fetch lineage from API
      fetch(`/api/graph/taxonomy?id=${selectedSpecies.id}`)
        .then(res => res.json())
        .then(data => setGraphData(data))
        .catch(console.error);
    }
  }, [explorationMode, networkDepth, selectedSpecies, fullGraphData]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSpecies = async (species: any) => {
    setSelectedSpecies(species);
    setResults([]);
    setQuery('');
    // Graph update is handled by the useEffect watching selectedSpecies
  };

  return (
    <main className="app-container">
      {/* Background Graph Layer */}
      <div className="graph-container">
        <button 
          onClick={toggleTheme} 
          style={{ 
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            zIndex: 100,
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)', 
            color: 'var(--text-main)', 
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s, transform 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <Graph 
          data={graphData} 
          selectedNodeId={selectedSpecies?.id}
          onNodeClick={(node: any) => {
            if (node.label === 'Species') {
              fetch(`/api/search?q=${encodeURIComponent(node.name)}`)
                .then(res => res.json())
                .then(data => {
                  if (data.results && data.results.length > 0) {
                    selectSpecies(data.results[0]);
                  }
                });
            }
          }} 
        />
      </div>
      
      {/* Sidebar Overlay */}
      <div className="sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="title">FloGraph</h1>
            <p className="subtitle">Botanical Knowledge Graph</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <form className="search-box" onSubmit={handleSearch} style={{ flex: 1 }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search for a species (e.g. Monstera)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="search-button" disabled={isSearching}>
              <Search size={20} />
            </button>
          </form>
          {selectedSpecies && (
            <button 
              onClick={() => {
                setSelectedSpecies(null);
                setQuery('');
                setExplorationMode('lineage');
                setGraphData(fullGraphData);
              }}
              style={{
                background: 'var(--panel-bg)',
                border: '1px solid var(--accent)',
                color: 'var(--text-main)',
                padding: '0 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              title="Back to Full Graph"
            >
              <Orbit size={20} />
            </button>
          )}
        </div>
        
        {results.length > 0 && (
          <div className="results-list">
            {results.map((r: any) => (
              <div key={r.id} className="result-item" onClick={() => selectSpecies(r)}>
                <div className="result-name">{r.name}</div>
                <div className="result-sci">
                  {r.commonNames && Array.isArray(r.commonNames) && r.commonNames.length > 0 
                    ? r.commonNames.join(', ') 
                    : 'No common names'}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedSpecies && (
          <div className="care-profile">
            <h2 className="care-title">
              <Leaf size={24} color="var(--text-highlight)" />
              {selectedSpecies.name}
            </h2>
            <div style={{ fontStyle: 'italic', opacity: 0.7, marginBottom: '1rem' }}>
              {selectedSpecies.commonNames && Array.isArray(selectedSpecies.commonNames) && selectedSpecies.commonNames.length > 0 
                ? selectedSpecies.commonNames.join(', ') 
                : 'No common names'}
            </div>
            
            <div className="care-stats">
              <div className="care-stat" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="stat-label"><Droplets size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Water</span>
                <LevelBar value={selectedSpecies.wateringLevel} />
              </div>
              <div className="care-stat" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="stat-label"><CloudRain size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Humidity</span>
                <PercentageBar value={selectedSpecies.humidity} color="linear-gradient(90deg, #48dbfb 0%, #0abde3 100%)" glowColor="#48dbfb" />
              </div>
              <div className="care-stat" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="stat-label"><TrendingUp size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Growth Rate</span>
                <PercentageBar value={selectedSpecies.growthRate} color="linear-gradient(90deg, #10ac84 0%, #1dd1a1 100%)" glowColor="#10ac84" />
              </div>
              <div className="care-stat" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="stat-label"><Sun size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Sunlight (PPFD)</span>
                <RangeBar min={selectedSpecies.ppfdMin} max={selectedSpecies.ppfdMax} />
              </div>
              
              {isExpanded && (
                <>
                  <div className="care-stat">
                    <span className="stat-label"><Haze size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Locations</span>
                    <span className="stat-value">{selectedSpecies.lightRequirement || 'Unknown'}</span>
                  </div>
                  <div className="care-stat">
                    <span className="stat-label"><Trees size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Growth Pattern</span>
                    <span className="stat-value">{selectedSpecies.growthPattern || 'Unknown'}</span>
                  </div>
                  <div className="care-stat">
                    <span className="stat-label"><Sprout size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Soil Type</span>
                    <span className="stat-value">{selectedSpecies.soilType || 'Unknown'}</span>
                  </div>
                  <div className="care-stat">
                    <span className="stat-label"><Bug size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Pollinators</span>
                    <span className="stat-value">{selectedSpecies.pollinators || 'Unknown'}</span>
                  </div>
                  <div className="care-stat">
                    <span className="stat-label"><Globe size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Regions</span>
                    <span className="stat-value">{selectedSpecies.nativeRegions || 'Unknown'}</span>
                  </div>
                </>
              )}

              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  marginTop: '8px',
                  fontSize: '0.85rem'
                }}
              >
                {isExpanded ? 'Hide Details' : 'Expand Details'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Graph Legend Overlay */}
      {/* Graph Legend Overlay */}
      {graphData && (
        <div className="graph-overlay" style={{ bottom: '2rem' }}>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#093318'}}></div>Kingdom</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#0e4a27'}}></div>Phylum</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#126333'}}></div>Class</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#177d40'}}></div>Order</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#1b994e'}}></div>Family</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#1fb55b'}}></div>Subfamily</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#24d469'}}></div>Genus</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#2ecc71'}}></div>Species</div>
        </div>
      )}

      {/* Exploration Controls Overlay */}
      {selectedSpecies && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '430px',
          background: 'var(--panel-bg)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          zIndex: 10,
          color: 'var(--text-main)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '250px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '0.9rem' }}>Graph Mode</strong>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                title="Lineage View"
                onClick={() => setExplorationMode('lineage')}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: explorationMode === 'lineage' ? 'var(--accent)' : 'rgba(0,0,0,0.2)',
                  color: explorationMode === 'lineage' ? '#0b0c10' : 'inherit',
                  transition: 'all 0.2s',
                  boxShadow: explorationMode === 'lineage' ? '0 0 10px rgba(46, 204, 113, 0.4)' : 'none'
                }}
              >
                <Waypoints size={18} />
              </button>
              <button 
                title="Network View"
                onClick={() => setExplorationMode('network')}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: explorationMode === 'network' ? 'var(--accent)' : 'rgba(0,0,0,0.2)',
                  color: explorationMode === 'network' ? '#0b0c10' : 'inherit',
                  transition: 'all 0.2s',
                  boxShadow: explorationMode === 'network' ? '0 0 10px rgba(46, 204, 113, 0.4)' : 'none'
                }}
              >
                <GitFork size={18} />
              </button>
            </div>
          </div>
          
          {explorationMode === 'network' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.8 }}>
                <span>Depth: {networkDepth}</span>
                <span>(Max: 6)</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="6" 
                value={networkDepth} 
                onChange={(e) => setNetworkDepth(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '4px', textAlign: 'center' }}>
                {networkDepth === 1 ? 'Direct siblings' : networkDepth === 2 ? 'Cousins (Same family)' : 'Extended Relatives'}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
