// --- START OF FILE js/visualizations/graph/dfs.js ---

if (typeof visualizations === 'undefined') {
    console.error("dfs.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.dfs = {
        title: "Depth-First Search (DFS)",
        description: "A graph traversal explores <code>one branch deeply</code> using a <code>Stack</code> or <code>recursion</code>, backtracking when stuck. Prioritizes <code>depth over breadth</code>; space-efficient for narrow graphs.",
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
            addStartNodeControl(); // This function is global (from graph-utils.js)
            updateInfo(this.title, this.description);
            disableControls(false);
            startButton.disabled = false;
            sizeSlider.style.display = 'inline-block';
            sizeLabel.style.display = 'inline-block';
        },
        start: async function*() {
            const startNodeId = getStartNodeIdFromInput(); // Global from graph-utils.js
             if (startNodeId === null || graphNodes.find(n => n.id === startNodeId) === undefined) {
                updateInfo("DFS Error", "Invalid start node or graph is empty.");
                disableControls(false); startButton.disabled = true; // Or manage as per current state
                return;
            }

            const visited = new Set();
            let visitedOrderText = "Visited order: ";
            const startNodeInitial = graphNodes.find(n => n.id === startNodeId);

            async function* dfsVisit(u_id_param) {
                const u_id = u_id_param;
                visited.add(u_id);
                const u_node_data = graphNodes.find(n => n.id === u_id);

                if (!u_node_data || !u_node_data.element) {
                     console.warn(`DFS: Node data or element for ID ${u_id} not found, skipping.`);
                    return;
                }

                removeAllHighlights(vizArea.querySelector('.node-container'), 'processing');
                setElementClass(u_node_data.element, 'processing', true);
                
                if (!visitedOrderText.includes(u_node_data.value)) {
                    visitedOrderText += `${u_node_data.value} `;
                }
                updateInfo(null, `Visiting node ${u_node_data.value}.<br>${visitedOrderText}`);
                yield await sleep(getDelay());

                const neighbors = adj.get(u_id) || [];
                for (const edge of neighbors) {
                    const v_id = edge.to;
                    const v_node_data = graphNodes.find(n => n.id === v_id);
                     if (!v_node_data || !v_node_data.element) {
                         console.warn(`DFS: Neighbor node data or element for ID ${v_id} not found, skipping.`);
                        continue;
                    }

                    const edgeElement = findEdgeElement(u_id, v_id);

                    if (!visited.has(v_id)) {
                        if (edgeElement) {
                            setElementClass(edgeElement, 'edge-path', true);
                        }
                        yield* dfsVisit(v_id);
                        
                        removeAllHighlights(vizArea.querySelector('.node-container'), 'processing');
                        setElementClass(u_node_data.element, 'processing', true);
                        updateInfo(null, `Backtracking to node ${u_node_data.value}.<br>${visitedOrderText}`);
                        yield await sleep(getDelay() / 2);
                    } else if (edgeElement && !edgeElement.classList.contains('edge-path') && !edgeElement.classList.contains('edge-traversed')) {
                        highlightElement(edgeElement, 'edge-traversed', getDelay());
                        yield await sleep(getDelay() / 2);
                    }
                }
                setElementClass(u_node_data.element, 'processing', false);
                setElementClass(u_node_data.element, 'visited', true);
                yield await sleep(getDelay() / 2);
            }
            
            updateInfo("DFS Running", `Starting DFS from node ${startNodeInitial?.value || startNodeId}.`);
            yield* dfsVisit(startNodeId);

            updateInfo("DFS Complete", `DFS finished.<br>${visitedOrderText}`);
            // disableControls(false); // Finish function will handle this
            // pauseButton.disabled = true;
        },
        finish: async function() { // 'this' refers to visualizations.dfs
            updateInfo(null, "DFS complete. All reachable nodes visited."); // Can use this.title for consistency
            disableControls(false);
            if (pauseButton) {
                pauseButton.disabled = true;
                pauseButton.textContent = 'Pause';
            }
        }
    };
}
// --- END OF FILE js/visualizations/graph/dfs.js ---