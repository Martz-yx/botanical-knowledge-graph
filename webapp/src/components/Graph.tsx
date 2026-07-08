"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function Graph({ data, onNodeClick, selectedNodeId }: { data: any, onNodeClick?: (node: any) => void, selectedNodeId?: number }) {
  const [isLightMode, setIsLightMode] = useState(false);
  const fgRef = useRef<any>(null);
  
  // Define colors for different taxonomy levels using a pure green gradient
  const colorMap = {
    Kingdom: '#093318',
    Phylum: '#0e4a27',
    Class: '#126333',
    Order: '#177d40',
    Family: '#1b994e',
    Subfamily: '#1fb55b',
    Genus: '#24d469',
    Species: '#2ecc71' // Highlight species with vibrant lime green
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '204, 204, 204';
  };

  const sizeMap = {
    Kingdom: 10,
    Phylum: 9.5,
    Class: 9,
    Order: 8.5,
    Family: 8,
    Subfamily: 7.5,
    Genus: 7,
    Species: 6
  };

  useEffect(() => {
    // Check initial theme
    setIsLightMode(document.body.classList.contains('light-theme'));

    // Observe body for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsLightMode(document.body.classList.contains('light-theme'));
        }
      });
    });
    observer.observe(document.body, { attributes: true });

    // Zoom to fit after data loads
    if (data && data.nodes && data.nodes.length > 0 && fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
        
        // If a node is selected, shift the view right so the sidebar doesn't cover the starting node
        if (selectedNodeId) {
          setTimeout(() => {
            const currentCenter = fgRef.current.centerAt();
            const currentZoom = fgRef.current.zoom();
            // Offset the camera to the left by 200 pixels (half the sidebar width) so the graph moves right
            fgRef.current.centerAt(currentCenter.x - (250 / currentZoom), currentCenter.y, 400);
          }, 450);
        }
      }, 500);
    }

    return () => observer.disconnect();
  }, [data, selectedNodeId]);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.5)' }}>
        <style>
          {`
            .dna-loader {
              display: flex;
              position: relative;
              width: 250px;
              height: 88px;
              transform: scale(0.5);
            }

            .dna-wave {
              display: flex;
              justify-content: space-between;
              position: absolute;
              left: 0;
              top: 0;
              height: 100%;
              width: 100%;
              perspective: 100px;
            }

            .dna-wave > div {
              position: relative;
              width: 16px;
              height: 16px;
              border-radius: 100%;
            }

            .dna-wave > div::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: #093318;
              border-radius: 50%;
            }

            .top-wave > div::before {
              background-color: #2ecc71;
            }

            .top-wave > div { animation: move 3s ease-in-out infinite reverse; }
            .top-wave > div::before { animation: grow 3s linear infinite reverse; }
            .bottom-wave > div { animation: move 3s ease-in-out infinite; }
            .bottom-wave > div::before { animation: grow 3s linear infinite; }

            .dna-wave > div:nth-child(10) { animation-delay: 0s; }
            .dna-wave > div:nth-child(9) { animation-delay: -0.1s; }
            .dna-wave > div:nth-child(8) { animation-delay: -0.2s; }
            .dna-wave > div:nth-child(7) { animation-delay: -0.3s; }
            .dna-wave > div:nth-child(6) { animation-delay: -0.4s; }
            .dna-wave > div:nth-child(5) { animation-delay: -0.5s; }
            .dna-wave > div:nth-child(4) { animation-delay: -0.6s; }
            .dna-wave > div:nth-child(3) { animation-delay: -0.7s; }
            .dna-wave > div:nth-child(2) { animation-delay: -0.8s; }
            .dna-wave > div:nth-child(1) { animation-delay: -0.9s; }

            .bottom-wave > div:nth-child(10) { animation-delay: 0.75s; }
            .bottom-wave > div:nth-child(9) { animation-delay: 0.65s; }
            .bottom-wave > div:nth-child(8) { animation-delay: 0.55s; }
            .bottom-wave > div:nth-child(7) { animation-delay: 0.45s; }
            .bottom-wave > div:nth-child(6) { animation-delay: 0.35s; }
            .bottom-wave > div:nth-child(5) { animation-delay: 0.25s; }
            .bottom-wave > div:nth-child(4) { animation-delay: 0.15s; }
            .bottom-wave > div:nth-child(3) { animation-delay: 0.05s; }
            .bottom-wave > div:nth-child(2) { animation-delay: -0.05s; }
            .bottom-wave > div:nth-child(1) { animation-delay: -0.15s; }

            @keyframes move {
              0% { transform: translateY(0px); }
              25% { transform: translateY(88px); }
              50% { transform: translateY(0px); }
              75% { transform: translateY(88px); }
              100% { transform: translateY(0px); }
            }

            @keyframes grow {
              0%, 50%, 75%, 100% { transform: scaleX(0.7) scaleY(0.7); }
              10%, 60% { transform: scaleX(1) scaleY(1); }
              35%, 85% { transform: scaleX(0.4) scaleY(0.4); }
            }
          `}
        </style>
        <div className="dna-loader">
          <div className="dna-wave top-wave">
            <div/><div/><div/><div/><div/><div/><div/><div/><div/><div/>
          </div>
          <div className="dna-wave bottom-wave">
            <div/><div/><div/><div/><div/><div/><div/><div/><div/><div/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .scene-tooltip, .graph-tooltip, .float-tooltip-kap {
            background: transparent !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            color: inherit !important;
          }
        `}
      </style>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel={(node: any) => {
          const childTypeMap: any = {
            Kingdom: 'Phyla',
            Phylum: 'Classes',
            Class: 'Orders',
            Order: 'Families',
            Family: 'Genera',
            Subfamily: 'Genera',
            Genus: 'Species',
            Species: 'Varieties'
          };
          const childType = childTypeMap[node.label] || 'members';
          const countText = (node.childCount !== undefined && node.childCount > 0) ? `<div style="font-size: 11px; margin-top: 4px; color: #aaaaaa;">${node.childCount} ${childType}</div>` : '';
          const nodeColor = colorMap[node.label as keyof typeof colorMap] || '#cccccc';
          
          return `
            <div style="background: var(--panel-bg); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 12px 16px; border-radius: var(--border-radius, 12px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.3); color: var(--text-main); text-align: center;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${node.name}</div>
              <div style="font-size: 12px; color: ${nodeColor}; font-weight: 500;">${node.label}</div>
              ${countText}
            </div>
          `;
        }}
        nodeRelSize={6}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          if (typeof node.x !== 'number' || typeof node.y !== 'number') return;
          
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          const nodeSize = sizeMap[node.label as keyof typeof sizeMap] || 6;

          if (selectedNodeId && node.id === selectedNodeId) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize + 3, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
            ctx.fill();
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
          ctx.fillStyle = colorMap[node.label as keyof typeof colorMap] || '#cccccc';
          ctx.fill();
          
          if (globalScale > 2) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isLightMode ? '#333333' : '#ffffff';
            ctx.fillText(label, node.x, node.y + 10);
          }
        }}
        linkColor={() => isLightMode ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)'}
        linkWidth={1.2}
        onNodeClick={(node) => {
          if (node.x !== undefined && node.y !== undefined) {
            const zoomLevel = 8;
            fgRef.current.centerAt(node.x - (250 / zoomLevel), node.y, 1000);
            fgRef.current.zoom(zoomLevel, 2000);
          }
          if (onNodeClick) onNodeClick(node);
        }}
        backgroundColor={isLightMode ? '#f4f7f6' : '#0b0c10'}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </>
  );
}
