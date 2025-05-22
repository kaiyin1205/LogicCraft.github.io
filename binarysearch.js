// --- START OF FILE js/visualizations/data-structures/bst.js ---
// Assumes 'visualizations' object is declared globally
// Assumes helper functions (updateInfo, sleep, getDelay, highlightElement, setElementClass, removeAllHighlights, vizArea, disableControls, startAnimation, createTreeNode, createEdge, clearVisualizationArea) are globally available
// Assumes structureInstance is a global variable

// --- TreeNode Class for BST ---
class TreeNode {
    constructor(value, x = 0, y = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.id = `tree-node-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        this.x = x; 
        this.y = y; 
        this.level = 0; 
        this.element = null; 
        this.edgeElement = null; 
    }
}

// --- Rendering Function for BST (Layout with Root Anchor) ---
function renderTree(rootNode) {
    if (!vizArea) return;
    vizArea.innerHTML = ''; 
    const container = document.createElement('div');
    container.className = 'node-container'; 
    vizArea.appendChild(container);

    if (!rootNode) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Tree is empty</p>';
        container.style.minHeight = '300px'; 
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        return;
    }

    const nodesToRender = [];

    // --- Constants for Layout ---
    const NODE_DIAMETER = 45; 
    const HORIZONTAL_GAP = 25; 
    const HORIZONTAL_SPACING = NODE_DIAMETER + HORIZONTAL_GAP; // 70
    const VERTICAL_SPACING = 65;  
    const START_Y = 50;

    let currentXTracker = { value: 0 }; // Use an object to pass by reference

    // Helper function to count nodes in a subtree (for in-order index calculation)
    function countNodes(node) {
        if (!node) return 0;
        return 1 + countNodes(node.left) + countNodes(node.right);
    }

    // Determine the starting X offset to center the root node
    const nodesInLeftSubtree = countNodes(rootNode.left);
    const rootInOrderIndex = nodesInLeftSubtree; // 0-indexed if left subtree is empty

    // The root node's X position (center of the node) should be at vizArea center.
    // Its position in the in-order sequence before any offset is rootInOrderIndex * HORIZONTAL_SPACING.
    // So, initialX + rootInOrderIndex * HORIZONTAL_SPACING = vizArea.clientWidth / 2.
    // initialX = (vizArea.clientWidth / 2) - (rootInOrderIndex * HORIZONTAL_SPACING)
    // This initialX is where the very first node (leftmost) of the in-order traversal will be placed.
    const vizAreaWidth = container.clientWidth || vizArea.clientWidth;
    currentXTracker.value = (vizAreaWidth / 2) - (rootInOrderIndex * HORIZONTAL_SPACING) - (NODE_DIAMETER / 2);
    // The above calculation was trying to place the *center* of the root at vizAreaCenter.
    // Let's simplify: targetX for root's center is vizAreaWidth / 2.
    // Root's x will be: initial_currentX_value + rootInOrderIndex * HORIZONTAL_SPACING
    // So, initial_currentX_value = (vizAreaWidth / 2) - (rootInOrderIndex * HORIZONTAL_SPACING)
    currentXTracker.value = (vizAreaWidth / 2) - (rootInOrderIndex * HORIZONTAL_SPACING);


    // 1. Assign final X and Y coordinates
    function assignCoordinates(node, level) {
        if (!node) return;

        node.level = level;
        node.y = START_Y + level * VERTICAL_SPACING;

        if (node.left) {
            assignCoordinates(node.left, level + 1);
        }

        node.x = currentXTracker.value; // Assign center X for the current node
        currentXTracker.value += HORIZONTAL_SPACING; // Move to the next slot for the next in-order node
        nodesToRender.push(node); 

        if (node.right) {
            assignCoordinates(node.right, level + 1);
        }
    }
    
    assignCoordinates(rootNode, 0);
    
    // 2. Collect Edges now that all node positions are final
    const finalEdgesToRender = [];
    function collectEdges(node) {
        if (!node) return;
        if (node.left) {
            finalEdgesToRender.push({ from: node, to: node.left });
            collectEdges(node.left);
        }
        if (node.right) {
            finalEdgesToRender.push({ from: node, to: node.right });
            collectEdges(node.right);
        }
    }
    collectEdges(rootNode);

    // Render Edges
    finalEdgesToRender.forEach(edgeInfo => {
        const fromNode = edgeInfo.from; 
        const toNode = edgeInfo.to;
        const edgeElement = createEdge(fromNode.x, fromNode.y, toNode.x, toNode.y);
        container.appendChild(edgeElement);
        if(toNode) toNode.edgeElement = edgeElement;
    });

    // Render Nodes
    nodesToRender.forEach(node => {
        const nodeElement = createTreeNode(node.value, node.x, node.y, node.id);
        node.element = nodeElement; 
        container.appendChild(nodeElement);
    });
}

function createTreeNode(value, x, y, id) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'node viz-element';
    nodeDiv.textContent = value;
    nodeDiv.dataset.id = id;
    nodeDiv.dataset.value = value;
    nodeDiv.style.left = `${x}px`; 
    nodeDiv.style.top = `${y}px`;  
    nodeDiv.style.transform = 'translate(-50%, -50%)'; 
    return nodeDiv;
}

function createEdge(x1, y1, x2, y2) {
    const edgeDiv = document.createElement('div');
    edgeDiv.className = 'edge';
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    if (length < 1) return edgeDiv;

    const nodeRadius = 22.5; 
    const effectiveLength = Math.max(0, length - nodeRadius * 1.9); 
    
    const offsetX1 = Math.cos(angle * Math.PI / 180) * nodeRadius * 0.95; 
    const offsetY1 = Math.sin(angle * Math.PI / 180) * nodeRadius * 0.95;

    const adjustedX1 = x1 + offsetX1;
    const adjustedY1 = y1 + offsetY1;
    
    edgeDiv.style.width = `${effectiveLength}px`;
    edgeDiv.style.left = `${adjustedX1}px`;
    edgeDiv.style.top = `${adjustedY1}px`;
    edgeDiv.style.transform = `rotate(${angle}deg)`;
    edgeDiv.style.transformOrigin = '0 0'; 
    return edgeDiv;
}

// --- Control Handlers for BST ---
function addBSTControls() {
    structureControlsContainer.innerHTML = '';
    const valueInput = document.createElement('input');
    valueInput.type = 'number'; 
    valueInput.id = 'bst-value-input';
    valueInput.placeholder = 'Value';
    const insertButton = document.createElement('button');
    insertButton.textContent = 'Insert';
    insertButton.onclick = () => handleBSTOperation('insert');
    const searchButton = document.createElement('button');
    searchButton.textContent = 'Search';
    searchButton.onclick = () => handleBSTOperation('search');
    structureControlsContainer.appendChild(valueInput);
    structureControlsContainer.appendChild(insertButton);
    structureControlsContainer.appendChild(searchButton);
    valueInput.addEventListener('keypress', (event) => {
         if (event.key === 'Enter') insertButton.click();
     });
}

async function handleBSTOperation(operationType) {
    if (isRunning) return;
    const input = document.getElementById('bst-value-input');
    const value = input.value.trim();
    const numValue = parseInt(value);
    if (value === '' || isNaN(numValue)) {
        updateInfo(null, "Please enter a valid number.");
        input.focus(); return;
    }
    if (numValue < -999 || numValue > 999) {
         updateInfo(null, "Please enter a value between -999 and 999.");
         input.focus(); return;
    }
    const viz = visualizations.bst;
    if (viz && viz[operationType]) {
        if (!structureInstance || typeof structureInstance.root === 'undefined') {
            structureInstance = { root: null };
        }
        startAnimation(viz[operationType](numValue));
        input.value = ''; 
    }
}

// --- BST Visualization Definition ---
if (typeof visualizations === 'undefined') {
    console.error("bst.js: 'visualizations' object not found.");
} else {
    visualizations.bst = {
        title: "Binary Search Tree",
        description: "A hierarchical data structure where each node’s <code>left child</code> is <code>smaller</code> and <code>right child</code> is <code>larger</code> than itself. In-order traversal yields sorted values.",
        init: async () => {
            structureInstance = { root: null };
            renderTree(structureInstance.root);
            updateInfo(visualizations.bst.title, visualizations.bst.description + "<br>Tree initialized.");
            visualizations.bst.addControls();
            disableControls(false);
            startButton.disabled = true;
            sizeSlider.style.display = 'none'; 
            sizeLabel.style.display = 'none';
        },
        addControls: addBSTControls,
        start: null, 
        insert: async function*(value) {
            updateInfo("BST Insert", `Inserting value <strong>${value}</strong>...`);
            const newNode = new TreeNode(value);
            if (structureInstance.root === null) {
                structureInstance.root = newNode;
                updateInfo("BST Insert", `Tree was empty. Inserting <strong>${value}</strong> as root.`);
                renderTree(structureInstance.root);
                if(newNode.element) highlightElement(newNode.element, 'special');
                yield await sleep(getDelay());
            } else {
                let current = structureInstance.root;
                let parent = null;
                updateInfo("BST Insert", `Starting search from root <strong>${current.value}</strong>.`);
                while (current !== null) {
                    if(current.element) highlightElement(current.element, 'comparing');
                    yield await sleep(getDelay());
                    parent = current;
                    if (value < current.value) {
                        updateInfo("BST Insert", `<strong>${value}</strong> < <strong>${current.value}</strong>. Going left.`);
                        if(current.element) setElementClass(current.element, 'comparing', false);
                        if (current.left?.edgeElement) highlightElement(current.left.edgeElement, 'traversing-edge', 0); 
                        else if (current.left?.element) highlightElement(current.left.element, 'traversing');
                        current = current.left;
                    } else if (value > current.value) {
                        updateInfo("BST Insert", `<strong>${value}</strong> > <strong>${current.value}</strong>. Going right.`);
                        if(current.element) setElementClass(current.element, 'comparing', false);
                        if (current.right?.edgeElement) highlightElement(current.right.edgeElement, 'traversing-edge', 0); 
                        else if(current.right?.element) highlightElement(current.right.element, 'traversing');
                        current = current.right;
                    } else {
                        updateInfo("BST Insert", `Value <strong>${value}</strong> already exists in the tree.`);
                        if(current.element) highlightElement(current.element, 'found', getDelay()*2); 
                        yield await sleep(getDelay()*1.5);
                        removeAllHighlights();
                        disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
                        return; 
                    }
                    yield await sleep(getDelay());
                    removeAllHighlights(); 
                }
                if(parent.element) highlightElement(parent.element, 'special'); 
                updateInfo("BST Insert", `Found insertion point. Attaching <strong>${value}</strong> to node <strong>${parent.value}</strong>.`);
                yield await sleep(getDelay());
                if (value < parent.value) {
                    parent.left = newNode;
                    updateInfo("BST Insert", `Inserting <strong>${value}</strong> as left child of <strong>${parent.value}</strong>.`);
                } else {
                    parent.right = newNode;
                    updateInfo("BST Insert", `Inserting <strong>${value}</strong> as right child of <strong>${parent.value}</strong>.`);
                }
                renderTree(structureInstance.root); 
                const parentElement = document.querySelector(`[data-id="${parent.id}"]`); 
                const newNodeElement = document.querySelector(`[data-id="${newNode.id}"]`); 
                let newEdgeElement = newNode.edgeElement;
                if(parentElement) highlightElement(parentElement, 'special');
                if(newNodeElement) highlightElement(newNodeElement, 'special');
                if(newEdgeElement) highlightElement(newEdgeElement, 'special-edge'); 
                yield await sleep(getDelay() * 1.5);
            }
            updateInfo("BST Insert", `Value <strong>${value}</strong> inserted.`);
            removeAllHighlights();
            renderTree(structureInstance.root); 
            disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
        },
        search: async function*(value) {
            updateInfo("BST Search", `Searching for value <strong>${value}</strong>...`);
            removeAllHighlights();
            if (structureInstance.root === null) {
                updateInfo("BST Search", "Tree is empty.");
                yield await sleep(getDelay());
                disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
                return;
            }
            let current = structureInstance.root;
            let found = false;
            updateInfo("BST Search", `Starting search from root <strong>${current.value}</strong>.`);
            while (current !== null) {
                if(current.element) highlightElement(current.element, 'comparing');
                yield await sleep(getDelay());
                if (value === current.value) {
                    found = true;
                    updateInfo("BST Search", `Value <strong>${value}</strong> found!`);
                    if(current.element) {
                        setElementClass(current.element, 'comparing', false);
                        highlightElement(current.element, 'found', getDelay() * 3);
                    }
                    yield await sleep(getDelay() * 2); 
                    break;
                } else if (value < current.value) {
                    updateInfo("BST Search", `<strong>${value}</strong> < <strong>${current.value}</strong>. Going left.`);
                    if(current.element) setElementClass(current.element, 'comparing', false);
                    if (current.left?.edgeElement) highlightElement(current.left.edgeElement, 'traversing-edge', 0);
                    else if (current.left?.element) highlightElement(current.left.element, 'traversing');
                    current = current.left;
                } else {
                    updateInfo("BST Search", `<strong>${value}</strong> > <strong>${current.value}</strong>. Going right.`);
                    if(current.element) setElementClass(current.element, 'comparing', false);
                    if (current.right?.edgeElement) highlightElement(current.right.edgeElement, 'traversing-edge', 0);
                    else if(current.right?.element) highlightElement(current.right.element, 'traversing');
                    current = current.right;
                }
                yield await sleep(getDelay());
                removeAllHighlights(); 
            }
            if (!found) {
                updateInfo("BST Search", `Value <strong>${value}</strong> not found in the list.`);
                yield await sleep(getDelay());
            }
            removeAllHighlights();
            renderTree(structureInstance.root); 
            disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
        },
    };
}
// --- END OF FILE js/visualizations/data-structures/bst.js ---