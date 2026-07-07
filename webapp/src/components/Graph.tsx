"use client";

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function Graph({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  const fgRef = useRef<any>(null);
  
  // Define colors for different taxonomy levels
  const colorMap = {
    Kingdom: '#ff6b6b',
    Phylum: '#feca57',
    Class: '#48dbfb',
    Order: '#ff9ff3',
    Family: '#1dd1a1',
    Genus: '#5f27cd',
    Species: '#66fcf1' // Highlight species with accent color
  };

  useEffect(() => {
    // Zoom to fit after data loads
    if (data && data.nodes.length > 0 && fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [data]);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.5)' }}>
        No graph data available. Search for a species to explore the taxonomy tree.
      </div>
    );
  }

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={data}
      nodeLabel="name"
      nodeColor={(node: any) => colorMap[node.label as keyof typeof colorMap] || '#cccccc'}
      nodeRelSize={6}
      linkColor={() => 'rgba(255, 255, 255, 0.2)'}
      linkWidth={1.5}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      onNodeClick={(node) => {
        // Center on clicked node
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(8, 2000);
        if (onNodeClick) onNodeClick(node);
      }}
      backgroundColor="#0b0c10"
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
    />
  );
}
