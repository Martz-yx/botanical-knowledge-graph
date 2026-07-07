"use client";

import React, { useState } from 'react';
import { Search, Leaf, Droplets, Sun, Bug, Globe } from 'lucide-react';
import Graph from '@/components/Graph';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

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
    
    try {
      const res = await fetch(`/api/graph/taxonomy?id=${species.id}`);
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="app-container">
      {/* Background Graph Layer */}
      <div className="graph-container">
        <Graph data={graphData} onNodeClick={(node: any) => console.log('Clicked', node)} />
      </div>
      
      {/* Sidebar Overlay */}
      <div className="sidebar">
        <div>
          <h1 className="title">Botanical Graph</h1>
          <p className="subtitle">Explore taxonomy and care profiles</p>
        </div>
        
        <form className="search-box" onSubmit={handleSearch}>
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
        
        {results.length > 0 && (
          <div className="results-list">
            {results.map((r: any) => (
              <div key={r.id} className="result-item" onClick={() => selectSpecies(r)}>
                <div className="result-name">{r.commonName || r.name}</div>
                <div className="result-sci">{r.scientificName}</div>
              </div>
            ))}
          </div>
        )}
        
        {selectedSpecies && (
          <div className="care-profile">
            <h2 className="care-title">
              <Leaf size={24} color="#66fcf1" />
              {selectedSpecies.commonName || selectedSpecies.name}
            </h2>
            <div style={{ fontStyle: 'italic', opacity: 0.7, marginBottom: '1rem' }}>
              {selectedSpecies.scientificName}
            </div>
            
            {selectedSpecies.careProfile ? (
              <div className="care-stats">
                <div className="care-stat">
                  <span className="stat-label"><Droplets size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Water</span>
                  <span className="stat-value">{selectedSpecies.careProfile.wateringFrequency || 'Unknown'}</span>
                </div>
                <div className="care-stat">
                  <span className="stat-label"><Sun size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Sunlight</span>
                  <span className="stat-value">{selectedSpecies.careProfile.sunlightRequirement || 'Unknown'}</span>
                </div>
                <div className="care-stat">
                  <span className="stat-label"><Bug size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Pest Resist</span>
                  <span className="stat-value">{selectedSpecies.careProfile.pestResistance || 'Unknown'}</span>
                </div>
                <div className="care-stat">
                  <span className="stat-label"><Globe size={16} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/> Hardiness</span>
                  <span className="stat-value">{selectedSpecies.careProfile.hardinessZone || 'Unknown'}</span>
                </div>
              </div>
            ) : (
              <p style={{ opacity: 0.6 }}>No specific care profile generated for this plant.</p>
            )}
          </div>
        )}
      </div>

      {/* Graph Legend Overlay */}
      {graphData && (
        <div className="graph-overlay">
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#ff6b6b'}}></div>Kingdom</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#feca57'}}></div>Phylum</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#48dbfb'}}></div>Class</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#ff9ff3'}}></div>Order</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#1dd1a1'}}></div>Family</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#5f27cd'}}></div>Genus</div>
          <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#66fcf1'}}></div>Species</div>
        </div>
      )}
    </main>
  );
}
