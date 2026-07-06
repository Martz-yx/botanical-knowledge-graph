# Taxonomic Explorer Visualizer

This directory contains a stunning, dark-mode web application built with **React** and **Vite** that allows users to interactively explore the Botanical Knowledge Graph.

## Visualization Engine
The app uses `react-force-graph-2d` to render the nodes and edges on an HTML5 Canvas. The physics engine simulates a "Mind-Map" layout, where the Kingdoms float at the center, and biological children elegantly branch outwards.

## Dynamic Drilling
To ensure the app can handle graphs with tens of thousands of species without crashing the browser, the visualizer uses **lazy-loading**:
1. On initial load, it only fetches `Kingdom` and `Phylum` nodes from the backend API.
2. When a user clicks a node, the React app makes an asynchronous request to the backend to fetch *only* the immediate children of that node.
3. The new nodes are dynamically merged into the physics simulation, and the camera automatically zooms and pans to focus on the newly discovered subtree.

## Styling
The app intentionally avoids heavy utility frameworks like Tailwind CSS in favor of handcrafted **Vanilla CSS**. This allows for the rich glassmorphism aesthetic, smooth micro-animations, and perfect control over the Neo4j-inspired color palette without bloated DOM elements.

## Running the App
Make sure the Python backend is running, then start the Vite development server:
```bash
npm install
npm run dev
```
