// --- START OF FILE js/visualizations/graph/graph-utils.js ---

// It's good practice to have a Node class, but object literals also work if consistent.
// class GraphNode {
//     constructor(id, value, x, y) {
//         this.id = id; this.value = value; this.x = x; this.y = y;
//         this.element = null; this.cost = Infinity; this.parent = null; this.inMST = false;
//     }
// }

/**
 * Clears all graph data and the visualization area for graphs.
 */
function clearGraphVisualization() {
    vizArea.innerHTML = '';
    graphNodes.length = 0;    // Clear the global array
    graphEdges.length = 0;    // Clear the global array
    if (adj instanceof Map) {
        adj.clear();          // Clear the global map
    } else {
        adj = new Map();      // Initialize if it wasn't a map
    }
}

/**
 * Renders the graph (nodes and edges) based on global graphNodes and graphEdges.
 */
function renderGraph() {
    // vizArea should be cleared by clearGraphVisualization before calling createSampleGraph,
    // and createSampleGraph calls this renderGraph.
    // If renderGraph is called independently, ensure vizArea is prepared.
    // For safety, we can clear it here too, specific to graph elements.
    const existingNodeContainer = vizArea.querySelector('.node-container');
    if (existingNodeContainer) existingNodeContainer.remove();

    const nodeContainer = document.createElement('div');
    nodeContainer.className = 'node-container';
    vizArea.appendChild(nodeContainer);

    // Render Edges first so they are underneath nodes (or manage z-index)
    graphEdges.forEach(edge => {
        const edgeEl = document.createElement('div');
        edgeEl.className = 'edge';
        edgeEl.dataset.from = edge.from;
        edgeEl.dataset.to = edge.to;

        const node1 = graphNodes.find(n => n.id === edge.from);
        const node2 = graphNodes.find(n => n.id === edge.to);

        if (node1 && node2) {
            positionEdge(edgeEl, node1, node2);
            nodeContainer.appendChild(edgeEl);
            edge.element = edgeEl; // Store DOM element reference

            if (edge.weight !== undefined) {
                const weightEl = document.createElement('span');
                weightEl.className = 'edge-weight';
                weightEl.textContent = edge.weight;
                // Position the weight in the middle of the edge
                const midX = (node1.x + node2.x) / 2;
                const midY = (node1.y + node2.y) / 2;
                // Adjust positioning based on your .edge-weight CSS
                weightEl.style.left = `${midX}px`;
                weightEl.style.top = `${midY}px`;
                // A common way is to offset it slightly from the line
                // A small transform can help center it better if its own size is unknown
                weightEl.style.transform = `translate(-50%, -50%)`;
                if (edge.weightElement) edge.weightElement.remove(); // Remove old one if exists
                edge.weightElement = weightEl;
                nodeContainer.appendChild(weightEl);
            }
        } else {
            console.error("Could not find nodes for edge: ", edge, "Node1:", node1, "Node2:", node2);
        }
    });

    // Render Nodes
    graphNodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'node viz-element'; // viz-element for general highlight removal
        nodeEl.dataset.id = node.id;
        // Assuming node x,y are centers. Adjust for node size (e.g., 45px width/height)
        nodeEl.style.left = `${node.x - 22.5}px`;
        nodeEl.style.top = `${node.y - 22.5}px`;

        const nodeValueEl = document.createElement('span');
        nodeValueEl.className = 'node-value';
        nodeValueEl.textContent = node.value;
        nodeEl.appendChild(nodeValueEl);

        // For Prim's: Add cost display
        if (currentGraphConfig.isWeighted) { // Check if graph is weighted
            const costEl = document.createElement('span');
            costEl.className = 'node-cost';
            costEl.textContent = node.cost === Infinity ? '∞' : node.cost.toString();
            nodeEl.appendChild(costEl);
            node.costElement = costEl; // Store reference to update later
        }
        
        if (node.element) node.element.remove(); // Remove old one if exists (e.g. on re-render)
        nodeContainer.appendChild(nodeEl);
        node.element = nodeEl; // Store DOM element reference
    });
}


/**
 * Positions an edge element between two node objects.
 * @param {HTMLElement} edgeElement - The div representing the edge.
 * @param {object} node1 - The first node object {x, y}.
 * @param {object} node2 - The second node object {x, y}.
 */
function positionEdge(edgeElement, node1, node2) {
    const x1 = node1.x;
    const y1 = node1.y;
    const x2 = node2.x;
    const y2 = node2.y;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    edgeElement.style.width = `${length}px`;
    edgeElement.style.left = `${x1}px`;
    edgeElement.style.top = `${y1}px`; // CSS height of edge is 3px, this aligns top-left with center of node1
    edgeElement.style.transform = `rotate(${angle}deg)`;
    // transform-origin is set to 0 0 in CSS for .edge
}

/**
 * Finds the DOM element associated with a node ID.
 * @param {number | string} nodeId - The ID of the node.
 * @returns {HTMLElement | null} The node's DOM element or null if not found.
 */
function findNodeElement(nodeId) {
    const node = graphNodes.find(n => n.id.toString() === nodeId.toString());
    return node ? node.element : null;
}

/**
 * Finds the DOM element associated with an edge between two node IDs.
 * @param {number | string} node1_id - The ID of the first node.
 * @param {number | string} node2_id - The ID of the second node.
 * @returns {HTMLElement | null} The edge's DOM element or null if not found.
 */
function findEdgeElement(node1_id, node2_id) {
    const id1 = node1_id.toString();
    const id2 = node2_id.toString();
    const edge = graphEdges.find(e =>
        (e.from.toString() === id1 && e.to.toString() === id2) ||
        (e.from.toString() === id2 && e.to.toString() === id1 && !currentGraphConfig.isDirected)
    );
    return edge ? edge.element : null;
}

/**
 * Creates a sample graph for testing. (MODIFIED)
 * @param {object} options - Configuration options.
 * @param {number} [options.numNodes=7] - Number of nodes to create.
 * @param {boolean} [options.isWeighted=false] - True if edges should have weights.
 * @param {boolean} [options.isDirected=false] - True if the graph is directed.
 * @param {string} [options.layout='circle'] - 'circle', 'line', or other future layouts.
 */
function createSampleGraph(options = {}) {
    clearGraphVisualization(); // Clear previous graph data and DOM

    const defaults = {
        numNodes: parseInt(sizeSlider.value) || 7,
        isWeighted: false,
        isDirected: false,
        layout: 'circle'
    };
    const config = { ...defaults, ...options };
    currentGraphConfig = { ...config }; // Store current config globally

    const vizWidth = vizArea.clientWidth;
    const vizHeight = vizArea.clientHeight;
    const padding = 60; // Padding from edges of vizArea

    for (let i = 0; i < config.numNodes; i++) {
        let x, y;
        const nodeId = i;
        const nodeValue = String.fromCharCode(65 + i);

        if (config.layout === 'line' && config.numNodes <= 10) {
            x = ((vizWidth - 2 * padding) / (config.numNodes - 1 || 1)) * i + padding; // Avoid div by zero if 1 node
            y = vizHeight / 2;
            if (config.numNodes === 1) x = vizWidth / 2; // Center single node
        } else { // Default circular layout
            const angle = (i / config.numNodes) * 2 * Math.PI - Math.PI / 2; // Start at top
            const radius = Math.min(vizWidth - 2 * padding, vizHeight - 2 * padding) / 2;
            x = vizWidth / 2 + radius * Math.cos(angle);
            y = vizHeight / 2 + radius * Math.sin(angle);
        }
        
        // Create node data object
        const nodeDataObject = {
            id: nodeId,
            value: nodeValue,
            x: x,
            y: y,
            element: null, // Will be set by renderGraph
            // Algorithm-specific properties, initialized here or in algo init
            cost: Infinity,
            parent: null,
            inMST: false,
            // visited: false, // could be general purpose
        };
        graphNodes.push(nodeDataObject);
        adj.set(nodeDataObject.id, []);
    }

    let edgesToAdd = [];
    // Define edges based on numNodes (Your existing logic is fine, ensure IDs are valid)
    if (config.numNodes === 1) { /* no edges */ }
    else if (config.numNodes === 5) {
        edgesToAdd = [
            { from: 0, to: 1 }, { from: 0, to: 2 },
            { from: 1, to: 3 },
            { from: 2, to: 4 }, { from: 3, to: 4 },
            { from: 1, to: 2 }
        ];
    } else if (config.numNodes <= 7) {
         edgesToAdd = [
            { from: 0, to: 1 }, { from: 0, to: 2 },
            { from: 1, to: 3 }, { from: 2, to: 3 }, { from: 2, to: 4 },
            { from: 3, to: (config.numNodes > 5 ? 5 : 0) % config.numNodes },
            { from: 4, to: (config.numNodes > 5 ? 5 : 0) % config.numNodes },
            { from: (config.numNodes > 5 ? 5 : 0), to: (config.numNodes > 6 ? 6 : 1) % config.numNodes},
            { from: 0, to: 4 % config.numNodes}
        ];
    } else {
        // Add some default edges for larger graphs to ensure connectivity
        for (let i = 0; i < config.numNodes -1; i++) {
            edgesToAdd.push({ from: i, to: (i + 1) % config.numNodes }); // Creates a path/cycle
            if (i < config.numNodes - 2) { // Add a few more to make it less linear
                 edgesToAdd.push({ from: i, to: (i + 2) % config.numNodes }); // Edges to node+2
            }
        }
        // Add a few more random edges
        const numRandomEdges = Math.floor(config.numNodes / 3);
        for(let i = 0; i < numRandomEdges; i++) {
            let u = getRandomInt(0, config.numNodes - 1);
            let v = getRandomInt(0, config.numNodes - 1);
            // Ensure not a self-loop and not already added (considering undirected)
            if (u !== v && !edgesToAdd.some(e => (e.from === u && e.to === v) || (e.from === v && e.to === u))) {
                edgesToAdd.push({from: u, to: v});
            }
        }
    }
    // Filter out self-loops and ensure nodes exist
    edgesToAdd = edgesToAdd.filter(edge => edge.from < config.numNodes && edge.to < config.numNodes && edge.from !== edge.to);


    edgesToAdd.forEach(edgeInfo => {
        const weight = config.isWeighted ? getRandomInt(1, 10) : undefined;
        graphEdges.push({
            from: edgeInfo.from,
            to: edgeInfo.to,
            weight: weight,
            element: null // Will be set by renderGraph
        });
        adj.get(edgeInfo.from).push({ to: edgeInfo.to, weight: weight });
        if (!config.isDirected) {
            // Check if the reverse edge already exists in adj for 'to' node to prevent duplicates if edge (B,A) was already processed from (A,B)
            if (!adj.get(edgeInfo.to).some(e => e.to === edgeInfo.from)) {
                 adj.get(edgeInfo.to).push({ to: edgeInfo.from, weight: weight });
            }
        }
    });
    renderGraph(); // Render the newly created graph
}


/**
 * Adds controls for selecting start node for BFS/DFS. (MODIFIED)
 */
function addStartNodeControl() {
    if (!structureControlsContainer) return;
    structureControlsContainer.innerHTML = '';

    const label = document.createElement('label');
    label.htmlFor = 'start-node-input';
    label.textContent = 'Start Node:';
    label.style.marginRight = '5px';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'start-node-input';
    input.value = (graphNodes.length > 0) ? graphNodes[0].value : ''; // Default to first node's value (e.g., 'A')
    input.placeholder = 'e.g., A';
    input.style.width = "60px";
    input.style.padding = "8px";

    structureControlsContainer.appendChild(label);
    structureControlsContainer.appendChild(input);
}

/**
 * Gets the ID of the selected start node from the input. (MODIFIED)
 * @returns {number|null} Node ID (numeric) or null if not found or invalid.
 */
function getStartNodeIdFromInput() {
    const inputElement = document.getElementById('start-node-input');

    if (!graphNodes || graphNodes.length === 0) {
        updateInfo(null, "Graph is empty. Cannot select start node.");
        return null;
    }
    // Default to first node if input is not available (e.g. before control is added) or empty
    if (!inputElement || inputElement.value.trim() === '') {
        updateInfo(null, `Start node input is empty. Defaulting to node ${graphNodes[0].value} (ID: ${graphNodes[0].id}).`);
        return graphNodes[0].id;
    }

    const nodeValue = inputElement.value.trim().toUpperCase();
    const foundNode = graphNodes.find(n => n.value === nodeValue);

    if (foundNode) {
        return foundNode.id;
    } else {
        updateInfo(null, `Node "${nodeValue}" not found. Defaulting to node ${graphNodes[0].value} (ID: ${graphNodes[0].id}).`);
        return graphNodes[0].id; // Default to the first node if input is invalid
    }
}
// --- END OF FILE js/visualizations/graph/graph-utils.js ---