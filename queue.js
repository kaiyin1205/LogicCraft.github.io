// --- START OF FILE js/visualizations/data-structures/queue.js ---
// Assumes 'visualizations' object is declared globally (e.g., in dom-setup.js)
// Assumes helper functions (renderQueue, updateInfo, sleep, getDelay, highlightElement, vizArea) are globally available
// Assumes structureInstance is a global variable used to hold the queue data

// Renders the current state of the queue
function renderQueue(queueData) {
    if (!vizArea) return;
    vizArea.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'stack-queue-container queue-container';

    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.gap = '10px';
    container.style.alignItems = 'center';
    container.style.padding = '10px';
    container.style.minHeight = '85px';
    // MODIFICATION: Increased min-width to make the queue block longer
    container.style.minWidth = '500px'; // Increased from 300px (or default)
    container.style.marginTop = 'calc(27vh - 19.5px)'; // Approximate centering

    if (!queueData || queueData.length === 0) {
        // Ensure the "Queue is empty" message is centered within the longer container
        container.style.justifyContent = 'center'; // Add this to center the text
        container.innerHTML = '<p style="color: var(--text-secondary);">Queue is empty</p>';
    } else {
        container.style.justifyContent = 'flex-start'; // Align items to the start when not empty
        queueData.forEach((item, index) => {
            const element = document.createElement('div');
            element.className = 'queue-element viz-element';
            element.textContent = item;
            element.dataset.value = item;
            element.dataset.id = `queue-${index}`;
            container.appendChild(element);
        });
    }
    vizArea.appendChild(container);
}

// Define queue visualization
if (typeof visualizations === 'undefined') {
    console.error("queue.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.queue = {
        title: "Queue (FIFO)",
        description: "First-In, First-Out structure: <code>enqueue(value)</code> operation adds an item to the end, <code>dequeue()</code> removes the element from the front.",
        init: async () => {
            structureInstance = [];
            renderQueue(structureInstance);
            updateInfo(visualizations.queue.title, visualizations.queue.description + "<br>Queue initialized. Use controls to enqueue/dequeue.");
            visualizations.queue.addControls();
            disableControls(false);
            startButton.disabled = true;
            sizeSlider.style.display = 'none';
            sizeLabel.style.display = 'none';
        },
        addControls: () => addStackQueueControls('queue'),
        start: null,
        enqueue: async function* (value) {
            if (!structureInstance || !Array.isArray(structureInstance)) {
                structureInstance = [];
            }

            updateInfo("Queue Enqueue", `Enqueuing <strong>${value}</strong>...`);
            structureInstance.push(value);
            renderQueue(structureInstance);
            yield await sleep(getDelay() / 3);

            const elements = vizArea.querySelectorAll('.queue-element');
            const newElement = elements[elements.length - 1];
            if (newElement) {
                highlightElement(newElement, 'special', getDelay() * 1.5);
            }

            yield await sleep(getDelay());
            updateInfo("Queue Enqueue", `Element <strong>${value}</strong> enqueued.`);
            disableControls(false);
            startButton.disabled = true;
            pauseButton.disabled = true;
        },
        dequeue: async function* () {
            if (!structureInstance || !Array.isArray(structureInstance) || structureInstance.length === 0) {
                updateInfo("Queue Dequeue", "Queue is empty. Cannot dequeue.");
                yield await sleep(getDelay());
                disableControls(false);
                startButton.disabled = true;
                pauseButton.disabled = true;
                return;
            }

            const value = structureInstance[0];
            updateInfo("Queue Dequeue", `Dequeuing <strong>${value}</strong>...`);

            const element = vizArea.querySelector('.queue-element');
            if (element) {
                highlightElement(element, 'swapping', getDelay() * 1.5);
            }

            yield await sleep(getDelay());
            structureInstance.shift();
            renderQueue(structureInstance);
            updateInfo("Queue Dequeue", `Element <strong>${value}</strong> dequeued.`);
            yield await sleep(getDelay() / 2);
            disableControls(false);
            startButton.disabled = true;
            pauseButton.disabled = true;
        }
    };
}
// --- END OF FILE js/visualizations/data-structures/queue.js ---
