// --- START OF FILE js/visualizations/data-structures/stack.js ---
// Assumes 'visualizations' object is declared globally (e.g., in dom-setup.js)
// Assumes helper functions (renderStack, updateInfo, sleep, getDelay, highlightElement, vizArea) are globally available
// Assumes structureInstance is a global variable (from dom-setup.js) used to hold the stack data

// Need a basic renderStack function (can be moved to rendering.js later)
function renderStack(stackData) {
    if (!vizArea) return;
    vizArea.innerHTML = ''; // Clear previous state
    const container = document.createElement('div');
    container.className = 'stack-queue-container stack-container'; // Add specific class

    // Add a base plate visually
    const base = document.createElement('div');
    base.style.width = '100%';
    base.style.height = '5px';
    base.style.backgroundColor = 'var(--text-secondary)';
    base.style.alignSelf = 'center'; // Center the base
    base.style.marginTop = 'auto'; // Push base to bottom if container is taller than content

    const elementsContainer = document.createElement('div'); // Container for actual stack elements
    elementsContainer.style.display = 'flex';
    elementsContainer.style.flexDirection = 'column-reverse'; // Items added appear on top
    elementsContainer.style.alignItems = 'center';
    elementsContainer.style.width = '100%';
    elementsContainer.classList.add('stack-elements-wrapper'); // *** MODIFICATION: Added class for easier selection ***

    if (!stackData || stackData.length === 0) {
        elementsContainer.innerHTML = '<p style="color: var(--text-secondary); padding: 20px 0;">Stack is empty</p>';
    } else {
        stackData.forEach((value, index) => {
            const element = document.createElement('div');
            element.className = 'stack-element viz-element';
            element.textContent = value;
            element.dataset.value = value;
            element.dataset.id = `stack-${index}`;
            elementsContainer.appendChild(element);
        });
    }

    container.appendChild(elementsContainer);
    container.appendChild(base); // Add base below elements
    vizArea.appendChild(container);
}

// Function to add Stack specific controls (can be moved to a controls file later)

if (typeof visualizations === 'undefined') {
    console.error("stack.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.stack = {
        title: "Stack (LIFO)",
        description: "Last-In, First-Out structure: <code>push(value)</code> operation inserts an item onto the stack, while <code>pop(value)</code> removes the most recently added element.",
        init: async () => {
            structureInstance = []; // Use simple array, reset it
            renderStack(structureInstance);
            updateInfo(visualizations.stack.title, visualizations.stack.description + "<br>Stack initialized. Use controls to push/pop.");
            // Ensure controls are added and enabled on init/reset
            visualizations.stack.addControls();
            disableControls(false); // Enable controls after init
             startButton.disabled = true; // Disable general start button for stack
             sizeSlider.style.display = 'none'; // Hide size slider
             sizeLabel.style.display = 'none';
        },
        addControls: () => addStackQueueControls('stack'), // Use the helper function
        start: null, // Operations are triggered by the specific buttons, not the main 'Start'
        push: async function*(value) {
            if (!structureInstance || !Array.isArray(structureInstance)) {
                structureInstance = []; // Initialize if called before init (safety)
            }
             updateInfo("Stack Push", `Pushing <strong>${value}</strong>...`);
             structureInstance.push(value); // Update data first
             renderStack(structureInstance); // Re-render with new element visually present but not yet highlighted

             // Short delay before highlighting the pushed element
             yield await sleep(getDelay()/3);

             // *** MODIFICATION: Changed selector to target the visually topmost element (DOM last-child due to column-reverse) ***
             const element = vizArea.querySelector('.stack-container .stack-elements-wrapper .stack-element:last-child');
             if(element) {
                highlightElement(element, 'special', getDelay() * 1.5); // Highlight the newly added element
             }
             yield await sleep(getDelay()); // Hold highlight
             updateInfo("Stack Push", `Element <strong>${value}</strong> pushed.`);
             // Highlight fades automatically based on highlightElement duration
             disableControls(false); // Re-enable controls after operation
              startButton.disabled = true;
             pauseButton.disabled = true;
        },
        pop: async function*() {
            if (!structureInstance || !Array.isArray(structureInstance) || structureInstance.length === 0) {
                 updateInfo("Stack Pop", "Stack is empty. Cannot pop.");
                 yield await sleep(getDelay()); // Give user time to read message
                 disableControls(false); // Re-enable controls
                  startButton.disabled = true;
                 pauseButton.disabled = true;
                return; // Exit generator
            }

            const value = structureInstance[structureInstance.length - 1];
            updateInfo("Stack Pop", `Popping <strong>${value}</strong>...`);

            // *** MODIFICATION: Changed selector to target the visually topmost element (DOM last-child due to column-reverse) ***
            const element = vizArea.querySelector('.stack-container .stack-elements-wrapper .stack-element:last-child'); // Top element to be popped
            if(element) {
                highlightElement(element, 'swapping', getDelay() * 1.5); // Use swapping highlight for pop visual
            }
            yield await sleep(getDelay()); // Hold highlight during "removal"

            structureInstance.pop(); // Update data model
            renderStack(structureInstance); // Re-render without the popped element
            updateInfo("Stack Pop", `Element <strong>${value}</strong> popped.`);
            yield await sleep(getDelay()/2); // Short pause after rerender
            disableControls(false); // Re-enable controls
             startButton.disabled = true;
            pauseButton.disabled = true;
        }
    };
}
// --- END OF FILE js/visualizations/data-structures/stack.js ---
