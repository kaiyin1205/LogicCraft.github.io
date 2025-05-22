// --- START OF FILE js/visualizations/data-structures/linkedList.js ---
// Assumes 'visualizations' object is declared globally
// Assumes helper functions (updateInfo, sleep, getDelay, highlightElement, setElementClass, removeAllHighlights, vizArea, disableControls, startAnimation) are globally available
// Assumes structureInstance is a global variable

// --- Node Class for SLL ---
class LinkedListNode {
    constructor(value, next = null) {
        this.value = value;
        this.next = next;
        this.id = `ll-node-${Date.now()}-${Math.random().toString(16).slice(2)}`; // Unique enough ID
        this.element = null; // Reference to the DOM element
    }
}

// --- Rendering Function for SLL ---
function renderLinkedList(listHead) {
    if (!vizArea) return;
    vizArea.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'll-container';

    if (!listHead) {
        container.innerHTML = '<p style="color: var(--text-secondary);">List is empty</p>';
         container.style.minHeight = '100px'; // Keep minimum height
         container.style.justifyContent = 'center';
         container.style.alignItems = 'center';
        vizArea.appendChild(container);
        return;
    }

    let current = listHead;
    let isHead = true;
    while (current !== null) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'll-node viz-element';
        nodeDiv.textContent = current.value;
        nodeDiv.dataset.id = current.id; // Link DOM element to node object
        nodeDiv.dataset.value = current.value;
        current.element = nodeDiv; // Store DOM ref in node object

        if (isHead) {
            nodeDiv.classList.add('head');
            isHead = false;
            // Add "HEAD" label
            const headLabel = document.createElement('span');
             headLabel.textContent = 'HEAD';
             headLabel.style.position = 'absolute';
             headLabel.style.top = '-25px';
             headLabel.style.left = '50%';
             headLabel.style.transform = 'translateX(-50%)';
             headLabel.style.fontSize = '0.8em';
             headLabel.style.color = 'var(--primary)';
             nodeDiv.appendChild(headLabel);
        }
        if (current.next === null) {
            nodeDiv.classList.add('tail'); // Mark the tail for styling (null pointer)
        }

        container.appendChild(nodeDiv);
        current = current.next;
    }
    vizArea.appendChild(container);
}

// --- Control Handlers for SLL ---
function addLinkedListControls() {
    structureControlsContainer.innerHTML = '';

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.id = 'll-value-input';
    valueInput.placeholder = 'Value';

    const insertHeadButton = document.createElement('button');
    insertHeadButton.textContent = 'Insert Head';
    insertHeadButton.onclick = () => handleLLOperation('insertHead');

    const insertTailButton = document.createElement('button');
    insertTailButton.textContent = 'Insert Tail';
    insertTailButton.onclick = () => handleLLOperation('insertTail');

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => handleLLOperation('delete');

    const searchButton = document.createElement('button');
    searchButton.textContent = 'Search';
    searchButton.onclick = () => handleLLOperation('search');

    structureControlsContainer.appendChild(valueInput);
    structureControlsContainer.appendChild(insertHeadButton);
    structureControlsContainer.appendChild(insertTailButton);
    structureControlsContainer.appendChild(deleteButton);
    structureControlsContainer.appendChild(searchButton);

     // Enter key listener
     valueInput.addEventListener('keypress', (event) => {
         if (event.key === 'Enter') {
             // Default action on Enter could be Insert Tail or Search
             insertTailButton.click();
         }
     });
}

async function handleLLOperation(operationType) {
    if (isRunning) return;
    const input = document.getElementById('ll-value-input');
    const value = input.value.trim();

    if ((operationType === 'insertHead' || operationType === 'insertTail' || operationType === 'delete' || operationType === 'search') && value === '') {
        updateInfo(null, "Please enter a value.");
        input.focus();
        return;
    }

    const viz = visualizations.linkedList;
    if (viz && viz[operationType]) {
        // Ensure list structure exists
        if (!structureInstance || typeof structureInstance.head === 'undefined') {
            structureInstance = { head: null }; // Initialize if needed
        }
        startAnimation(viz[operationType](value));
        if (operationType.startsWith('insert')) {
             input.value = ''; // Clear after insert
        }
    }
}


// --- SLL Visualization Definition ---
if (typeof visualizations === 'undefined') {
    console.error("linkedList.js: 'visualizations' object not found.");
} else {
    visualizations.linkedList = {
        title: "Singly Linked List",
        description: "A linear collection of elements where each <code>node</code> contains data and a pointer to the <code>next element</code>. Operation involves <code>traversing pointers</code> sequentially from the head node.",
        init: async () => {
            structureInstance = { head: null }; // Store head node
            renderLinkedList(structureInstance.head);
            updateInfo(visualizations.linkedList.title, visualizations.linkedList.description + "<br>List initialized.");
            visualizations.linkedList.addControls();
            disableControls(false);
            startButton.disabled = true;
            sizeSlider.style.display = 'none';
            sizeLabel.style.display = 'none';
        },
        addControls: addLinkedListControls,
        start: null,

        insertHead: async function*(value) {
             updateInfo("Insert Head", `Inserting <strong>${value}</strong> at head...`);
             const newNode = new LinkedListNode(value);

             // 1. Create new node visually (optional, can appear on render)
             // You could render it off to the side initially if desired.

             // 2. Point new node's next to current head
             newNode.next = structureInstance.head;
             updateInfo("Insert Head", `New node points to old head (<strong>${structureInstance.head?.value ?? 'NULL'}</strong>).`);
             // Re-render to show potential new node and connect arrow conceptually
             renderLinkedList(newNode); // Temporarily render with newNode as head for visual linkup
             const newElement = vizArea.querySelector(`[data-id="${newNode.id}"]`);
             if (newElement) highlightElement(newElement, 'special');
             if (structureInstance.head?.element) highlightElement(structureInstance.head.element, 'comparing');
             yield await sleep(getDelay() * 1.5);
             removeAllHighlights();


             // 3. Update head
             structureInstance.head = newNode;
             updateInfo("Insert Head", `Updating HEAD pointer.`);
             renderLinkedList(structureInstance.head); // Final render with new head
             if (newNode.element) highlightElement(newNode.element, 'special');
             yield await sleep(getDelay());

             updateInfo("Insert Head", `Node <strong>${value}</strong> inserted at head.`);
             removeAllHighlights();
             disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
        },

        insertTail: async function*(value) {
            updateInfo("Insert Tail", `Inserting <strong>${value}</strong> at tail...`);
            const newNode = new LinkedListNode(value);

            if (!structureInstance.head) {
                // If list is empty, insert at head
                 yield* visualizations.linkedList.insertHead(value); // Delegate to insertHead
                 updateInfo("Insert Tail", `List was empty. Node <strong>${value}</strong> inserted as head/tail.`);
                return;
            }

            // Traverse to the last node
            let current = structureInstance.head;
            updateInfo("Insert Tail", `Traversing to find tail...`);
             if(current.element) highlightElement(current.element, 'traversing');
             yield await sleep(getDelay());

            while (current.next !== null) {
                 if(current.element) setElementClass(current.element, 'traversing', false); // Remove previous highlight
                 current = current.next;
                 if(current.element) highlightElement(current.element, 'traversing'); // Highlight current
                 updateInfo("Insert Tail", `At node <strong>${current.value}</strong>...`);
                 yield await sleep(getDelay());
            }
             // Now 'current' is the last node
             if(current.element) highlightElement(current.element, 'special'); // Highlight tail found
             updateInfo("Insert Tail", `Found tail node <strong>${current.value}</strong>.`);
             yield await sleep(getDelay());

             // Link last node to the new node
             current.next = newNode;
             updateInfo("Insert Tail", `Linking tail node to new node <strong>${value}</strong>.`);
             renderLinkedList(structureInstance.head); // Re-render to show new link
             if(current.element) highlightElement(current.element, 'special'); // Keep tail highlighted briefly
             const newElement = vizArea.querySelector(`[data-id="${newNode.id}"]`);
             if(newElement) highlightElement(newElement, 'special'); // Highlight new node
             yield await sleep(getDelay() * 1.5);

             updateInfo("Insert Tail", `Node <strong>${value}</strong> inserted at tail.`);
             removeAllHighlights();
             renderLinkedList(structureInstance.head); // Final clean render
             disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
        },

        delete: async function*(value) {
            updateInfo("Delete Node", `Attempting to delete node with value <strong>${value}</strong>...`);
            if (!structureInstance.head) {
                updateInfo("Delete Node", "List is empty. Cannot delete.");
                yield await sleep(getDelay());
                disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
                return;
            }

            // Case 1: Delete head node
            if (structureInstance.head.value == value) { // Use == for potential type coercion if input is string
                updateInfo("Delete Node", `Value found at HEAD. Removing node <strong>${value}</strong>.`);
                const headElement = structureInstance.head.element;
                if(headElement) highlightElement(headElement, 'swapping');
                yield await sleep(getDelay());

                structureInstance.head = structureInstance.head.next; // Update head
                renderLinkedList(structureInstance.head); // Re-render
                updateInfo("Delete Node", `Node <strong>${value}</strong> deleted from head.`);
                 yield await sleep(getDelay());
                disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
                return;
            }

            // Case 2: Delete node other than head
            let current = structureInstance.head;
            let previous = null;
            updateInfo("Delete Node", `Searching for node <strong>${value}</strong>...`);

            while (current !== null && current.value != value) {
                 if(previous?.element) setElementClass(previous.element, 'traversing', false);
                 if(current.element) highlightElement(current.element, 'traversing');
                 updateInfo("Delete Node", `Checking node <strong>${current.value}</strong>...`);
                 yield await sleep(getDelay());
                 previous = current;
                 current = current.next;
            }

            if (current === null) {
                updateInfo("Delete Node", `Value <strong>${value}</strong> not found in the list.`);
                 removeAllHighlights();
                 renderLinkedList(structureInstance.head); // Ensure clean render
                yield await sleep(getDelay());
                disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
                return;
            }

            // Value found at 'current'
            updateInfo("Delete Node", `Value <strong>${value}</strong> found. Unlinking node...`);
             if(previous?.element) highlightElement(previous.element, 'special'); // Highlight previous
             if(current.element) highlightElement(current.element, 'swapping');   // Highlight node to delete
             yield await sleep(getDelay());

            // Unlink the node
            previous.next = current.next;
            updateInfo("Delete Node", `Linking node <strong>${previous.value}</strong> to <strong>${current.next?.value ?? 'NULL'}</strong>.`);
            renderLinkedList(structureInstance.head); // Re-render showing the bypass
            if(previous?.element) highlightElement(previous.element, 'special');
            if(current.next?.element) highlightElement(current.next.element, 'comparing');
             yield await sleep(getDelay() * 1.5);

            updateInfo("Delete Node", `Node <strong>${value}</strong> deleted.`);
            removeAllHighlights();
            renderLinkedList(structureInstance.head); // Final clean render
            disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
        },

        search: async function*(value) {
            updateInfo("Search Node", `Searching for node with value <strong>${value}</strong>...`);
             removeAllHighlights(); // Clear previous highlights
            if (!structureInstance.head) {
                updateInfo("Search Node", "List is empty.");
                yield await sleep(getDelay());
                disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
                return;
            }

            let current = structureInstance.head;
            let found = false;
            while (current !== null) {
                 if(current.element) highlightElement(current.element, 'comparing'); // Highlight node being checked
                 updateInfo("Search Node", `Checking node <strong>${current.value}</strong>...`);
                 yield await sleep(getDelay());

                 if (current.value == value) {
                     found = true;
                     updateInfo("Search Node", `Value <strong>${value}</strong> found!`);
                     if(current.element) {
                         setElementClass(current.element, 'comparing', false); // Remove comparing
                         highlightElement(current.element, 'found', getDelay() * 3); // Special highlight for found
                     }
                     yield await sleep(getDelay() * 2); // Hold found highlight longer
                     break; // Exit loop once found
                 }

                 if(current.element) setElementClass(current.element, 'comparing', false); // Remove comparing highlight
                 // Optional: Keep traversed nodes highlighted differently?
                 // if(current.element) setElementClass(current.element, 'visited');
                 current = current.next;
                 yield await sleep(getDelay()/3); // Small pause before next iteration
            }

            if (!found) {
                updateInfo("Search Node", `Value <strong>${value}</strong> not found in the list.`);
                yield await sleep(getDelay());
            }
             removeAllHighlights(); // Clean up at the end
             renderLinkedList(structureInstance.head);
             disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
        }
    };
}
// --- END OF FILE js/visualizations/data-structures/linkedList.js ---