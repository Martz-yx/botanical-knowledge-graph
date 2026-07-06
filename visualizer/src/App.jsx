import { useEffect, useState, useRef, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { Info, Leaf } from 'lucide-react'

const API_URL = "http://localhost:8000/api/graph"

const COLORS = {
  Kingdom: "#e2f1ea",
  Phylum: "#a5c3b5",
  Class: "#61a884",
  Order: "#3bf19a",
  Family: "#1d8753",
  Subfamily: "#facc15",
  Genus: "#f472b6",
  Species: "#38bdf8",
  CareProfile: "#a78bfa"
}

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [hoveredNode, setHoveredNode] = useState(null)
  const fgRef = useRef()

  useEffect(() => {
    // Fetch initial graph (Kingdoms & Phyla)
    fetch(`${API_URL}/initial`)
      .then(res => res.json())
      .then(data => {
        setGraphData(data)
      })
      .catch(err => console.error("Error fetching initial graph:", err))
  }, [])

  const handleNodeClick = useCallback(node => {
    // Focus camera
    fgRef.current.centerAt(node.x, node.y, 1000)
    fgRef.current.zoom(2.5, 2000)

    // Expand node by fetching its children from the backend
    fetch(`${API_URL}/expand/${node.id}`)
      .then(res => res.json())
      .then(newData => {
        if (newData.nodes.length === 0) return

        setGraphData(prev => {
          const newNodes = [...prev.nodes]
          const newLinks = [...prev.links]
          
          // Add nodes that don't already exist
          newData.nodes.forEach(n => {
            if (!newNodes.find(pn => pn.id === n.id)) {
              newNodes.push(n)
            }
          })
          
          // Add links that don't already exist
          newData.links.forEach(l => {
            if (!newLinks.find(pl => pl.source === l.source && pl.target === l.target)) {
              newLinks.push(l)
            }
          })
          
          return { nodes: newNodes, links: newLinks }
        })
      })
      .catch(err => console.error("Error expanding node:", err))
  }, [])

  return (
    <div className="app-container">
      <div className="header-panel">
        <h1>Flora Explorer</h1>
        <p>Interactive Taxonomic Drilldown. Click on any node to expand its biological children dynamically.</p>
      </div>

      <div className={`info-panel ${!hoveredNode ? 'hidden' : ''}`}>
        <Leaf color={hoveredNode ? COLORS[hoveredNode.label] : "#fff"} size={24} />
        <div>
          <strong style={{ display: 'block', fontSize: '18px' }}>
            {hoveredNode?.name}
          </strong>
          <span style={{ fontSize: '13px', color: '#a5c3b5', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {hoveredNode?.label}
          </span>
        </div>
      </div>

      <div className="graph-wrapper">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="name"
          nodeColor={node => COLORS[node.label] || "#fff"}
          nodeRelSize={8}
          linkColor={() => "rgba(59, 241, 154, 0.2)"}
          linkWidth={2}
          onNodeClick={handleNodeClick}
          onNodeHover={setHoveredNode}
          d3AlphaDecay={0.05}
          d3VelocityDecay={0.4}
        />
      </div>
    </div>
  )
}

export default App
