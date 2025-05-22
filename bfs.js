// --- START OF FILE js/visualizations/graph/bfs.js ---

if (typeof visualizations === 'undefined') {
    console.error("bfs.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.bfs = {
        title: "Breadth-First Search (BFS)",
        description: "A graph traversal explores <code>neighbors level-by-level</code> using a <code>Queue (FIFO)</code>. Guarantees <code>shortest path</code> in unweighted graphs. ",
        // currentSize (for numNodes) will be managed by script.js

        init: async function(graphSize) { // graphSize is passed by script.js
            this.currentSize = graphSize; // Store if needed

            const numNodesForGraph = graphSize || 7; // Use graphSize, fallback to 7 if undefined

            currentGraphConfig = {
                numNodes: numNodesForGraph,
                isWeighted: false,
                isDirected: false,
                layout: 'circle'
            };
            createSampleGraph(currentGraphConfig);
            addStartNodeControl(); // Global from graph-utils.js
            updateInfo(this.title, this.description);
            disableControls(false);
            startButton.disabled = false;
            sizeSlider.style.display = 'inline-block';
            sizeLabel.style.display = 'inline-block';
        },
        start: async function*() {
            const startNodeId = getStartNodeIdFromInput(); // Global
            if (startNodeId === null || graphNodes.find(n => n.id === startNodeId) === undefined) {
                updateInfo("BFS Error", "Invalid start node or graph is empty.");
                disableControls(false);
                startButton.disabled = true; // Or manage as per current state
                return;
            }

            const q = [];
            const visited = new Set();
            let visitedOrderText = "Visited order: ";

            q.push(startNodeId);
            visited.add(startNodeId);

            const startNodeInitial = graphNodes.find(n => n.id === startNodeId);
            if (startNodeInitial && startNodeInitial.element) {
                 highlightElement(startNodeInitial.element, 'traversing', getDelay() * 2);
            } else {
                console.error("Start node or its element not found for ID:", startNodeId);
                disableControls(false); return;
            }

            updateInfo("BFS Running", `Starting BFS from node ${startNodeInitial?.value || startNodeId}.<br>${visitedOrderText}`);
            yield await sleep(getDelay());

            while (q.length > 0) {
                const u_id = q.shift();
                const u_node_data = graphNodes.find(n => n.id === u_id);

                if (!u_node_data || !u_node_data.element) {
                    console.warn(`BFS: Node data or element for ID ${u_id} not found, skipping.`);
                    continue;
                }

                removeAllHighlights(vizArea.querySelector('.node-container'), 'processing');
                setElementClass(u_node_data.element, 'processing', true);
                setElementClass(u_node_data.element, 'traversing', false);
                
                const queueValues = q.map(id => graphNodes.find(n=>n.id===id)?.value || id);
                // Append current node to visitedOrderText only once when it's processed
                if (!visitedOrderText.includes(u_node_data.value + " ")) { // Add space to avoid partial match
                    visitedOrderText += `${u_node_data.value} `;
                }
                updateInfo(null, `Processing node ${u_node_data.value}. Queue: [${queueValues.join(', ')}]<br>${visitedOrderText}`);


                yield await sleep(getDelay());

                const neighbors = adj.get(u_id) || [];
                for (const edge of neighbors) {
                    const v_id = edge.to;
                    const v_node_data = graphNodes.find(n => n.id === v_id);
                    if (!v_node_data || !v_node_data.element) {
                        console.warn(`BFS: Neighbor node data or element for ID ${v_id} not found, skipping.`);
                        continue;
                    }

                    const edgeElement = findEdgeElement(u_id, v_id);
                    if (edgeElement) {
                        highlightElement(edgeElement, 'edge-traversed', getDelay());
                        yield await sleep(getDelay() / 2);
                    }

                    if (!visited.has(v_id)) {
                        visited.add(v_id);
                        q.push(v_id);
                        highlightElement(v_node_data.element, 'traversing', getDelay() * 2);
                        const updatedQueueValues = q.map(id => graphNodes.find(n=>n.id===id)?.value || id);
                         // Don't add to visitedOrderText here, add when it's dequeued and processed
                        updateInfo(null, `Visiting ${v_node_data.value}, adding to queue. Queue: [${updatedQueueValues.join(', ')}]<br>${visitedOrderText}`);
                        yield await sleep(getDelay());
                    }
                }
                setElementClass(u_node_data.element, 'processing', false);
                setElementClass(u_node_data.element, 'visited', true);
                yield await sleep(getDelay() / 2);
            }
            updateInfo("BFS Complete", `BFS finished.<br>${visitedOrderText}`);
            // disableControls(false); // Handled by finish
            // pauseButton.disabled = true;
        },
        finish: async function() { // 'this' refers to visualizations.bfs
            updateInfo(null, "BFS complete. All reachable nodes visited."); // Can use this.title
            disableControls(false);
            if (pauseButton) {
                pauseButton.disabled = true;
                pauseButton.textContent = 'Pause';
            }
        }
    };
}
// --- END OF FILE js/visualizations/graph/bfs.js ---