// --- START OF FILE js/visualizations/graph/prim.js ---

if (typeof visualizations === 'undefined') {
    console.error("prim.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.prim = {
        title: "Prim's Algorithm (MST)",
        description: "Prim's algorithm builds a <code>minimum spanning tree</code> by adding the <code>cheapest edge</code> connecting a new vertex. Uses a <code>priority queue</code>.",
        // currentSize (for numNodes) will be managed by script.js

        init: async function(graphSize) { // graphSize is passed by script.js
            // 'this' refers to visualizations.prim
            this.currentSize = graphSize; // Store if needed by other methods of this object

            let numNodesForGraph;

            if (typeof graphSize !== 'undefined') { // graphSize comes from vizConfig.currentSize
                numNodesForGraph = graphSize;
            } else {
                // Fallback if graphSize wasn't passed, though script.js should handle this
                console.warn("Prim's init: graphSize not provided. Using default node count (e.g., from slider or hardcoded).");
                numNodesForGraph = parseInt(sizeSlider.value) || 8; // Fallback to slider or default
            }
            
            currentGraphConfig = {
                numNodes: numNodesForGraph,
                isWeighted: true,
                isDirected: false,
                layout: 'circle'
            };
            createSampleGraph(currentGraphConfig); 

            graphNodes.forEach(node => {
                node.cost = Infinity;
                node.parent = null;
                node.inMST = false;
                const costEl = document.getElementById(`cost-${node.id}`) || node.costElement;
                if (costEl) {
                    costEl.textContent = '∞';
                }
            });

            if (graphNodes.length > 0) {
                graphNodes[0].cost = 0;
                const costElNode0 = document.getElementById(`cost-${graphNodes[0].id}`) || graphNodes[0].costElement;
                if (costElNode0) {
                     costElNode0.textContent = '0';
                }
            }
            
            if (typeof structureControlsContainer !== 'undefined' && structureControlsContainer) {
                const startNodeValue = graphNodes.length > 0 ? graphNodes[0].value : 'N/A';
                // Display the actual number of nodes used for graph creation
                structureControlsContainer.innerHTML = `<p style="font-size:0.9em; color:var(--text-secondary); margin-top: 5px;">Prim's starts from node ${startNodeValue}. Graph size: ${numNodesForGraph}.</p>`;
            }
            updateInfo(this.title, this.description); // Use this.title etc.
            
            disableControls(false);
            if (typeof startButton !== 'undefined') startButton.disabled = false;
            if (typeof sizeSlider !== 'undefined' && sizeSlider) {
                 sizeSlider.style.display = 'inline-block';
            }
            if (typeof sizeLabel !== 'undefined' && sizeLabel) {
                sizeLabel.style.display = 'inline-block';
            }
        },
        start: async function*() {
            if (graphNodes.length === 0) {
                updateInfo(this.title, "Graph is empty. Cannot start Prim's.");
                disableControls(false); 
                if (typeof pauseButton !== 'undefined') pauseButton.disabled = true;
                return;
            }

            let pqNodes = [...graphNodes];
            let mstEdgesCount = 0;
            let totalMstWeight = 0;

            updateInfo(this.title, "Building Minimum Spanning Tree...");
            yield await sleep(getDelay());

            while (pqNodes.length > 0 && mstEdgesCount < graphNodes.length - 1) {
                pqNodes.sort((a, b) => a.cost - b.cost);
                const u_node_data = pqNodes.shift(); 

                if (!u_node_data || u_node_data.cost === Infinity) {
                    updateInfo(this.title, `MST construction ended. Some nodes might be unreachable. Total Weight: ${totalMstWeight}.`);
                    break; 
                }
                
                if (u_node_data.inMST) continue; 

                u_node_data.inMST = true;
                const u_node_element = document.getElementById(`node-${u_node_data.id}`) || u_node_data.element;
                if (u_node_element) {
                    setElementClass(u_node_element, 'visited', true); 
                    highlightElement(u_node_element, 'processing', getDelay() * 1.5);
                }

                if (u_node_data.parent !== null) { 
                    const parentNodeData = graphNodes.find(n => n.id === u_node_data.parent);
                    if (parentNodeData) {
                        const edgeElement = findEdgeElement(u_node_data.id, parentNodeData.id);
                        if (edgeElement) {
                            setElementClass(edgeElement, 'edge-path', true);
                        }
                        mstEdgesCount++;
                        totalMstWeight += u_node_data.cost; 
                        updateInfo(this.title, `Adding edge (${parentNodeData.value} - ${u_node_data.value}) W:${u_node_data.cost}. MST Weight: ${totalMstWeight}`);
                    }
                } else {
                    updateInfo(this.title, `Starting MST with node ${u_node_data.value}.`);
                }
                yield await sleep(getDelay());

                const neighbors = adj.get(u_node_data.id) || [];
                for (const edgeData of neighbors) { 
                    const v_node_data = graphNodes.find(n => n.id === edgeData.to);
                    if (!v_node_data || v_node_data.inMST) continue;

                    const v_node_element = document.getElementById(`node-${v_node_data.id}`) || v_node_data.element;
                    const currentEdgeEl = findEdgeElement(u_node_data.id, v_node_data.id);
                    
                    if (currentEdgeEl) highlightElement(currentEdgeEl, 'comparing', getDelay());
                    yield await sleep(getDelay() / 2); 

                    if (edgeData.weight < v_node_data.cost) {
                        v_node_data.cost = edgeData.weight;
                        v_node_data.parent = u_node_data.id;
                        
                        const v_cost_element = document.getElementById(`cost-${v_node_data.id}`) || v_node_data.costElement;
                        if (v_cost_element) { 
                            v_cost_element.textContent = v_node_data.cost;
                        }
                        if (v_node_element) {
                            highlightElement(v_node_element, 'target', getDelay());
                        }
                        updateInfo(this.title, `Updating cost for ${v_node_data.value} to ${v_node_data.cost} via ${u_node_data.value}.`);
                    }
                    yield await sleep(getDelay());
                    if (currentEdgeEl) setElementClass(currentEdgeEl, 'comparing', false);
                    if (v_node_element && v_node_element.classList.contains('target')) {
                         setElementClass(v_node_element, 'target', false);
                    }
                }
                if (u_node_element) setElementClass(u_node_element, 'processing', false);
            }
            updateInfo(this.title, `MST construction complete. Total Weight: ${totalMstWeight}. Edges: ${mstEdgesCount}.`);
        },
        finish: async function() {
            disableControls(false);
            if (typeof pauseButton !== 'undefined') {
                pauseButton.disabled = true;
                pauseButton.textContent = 'Pause'; 
            }
        },
        checkReadyState: () => {
            return graphNodes.length > 0 && graphNodes.some(node => node.cost === 0);
        }
    };
}
// --- END OF FILE js/visualizations/graph/prim.js ---