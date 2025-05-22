// --- START OF FILE js/visualizations/data-structures/minHeap.js ---
// Assumes 'visualizations' object is declared globally
// Assumes helper functions (updateInfo, sleep, getDelay, highlightElement, setElementClass, removeAllHighlights, vizArea, disableControls, startAnimation, renderBars, getRandomInt, MIN_DATA_VALUE, MAX_DATA_VALUE, sizeSlider) are globally available
// Assumes structureInstance is a global variable (holds heap array)

// --- Heap Control Handlers ---
function addHeapControls(heapType) { // heapType is 'minHeap' or 'maxHeap'
    structureControlsContainer.innerHTML = '';

    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.id = `${heapType}-value-input`;
    valueInput.placeholder = 'Value';

    const insertButton = document.createElement('button');
    insertButton.textContent = 'Insert';
    insertButton.onclick = () => handleHeapOperation(heapType, 'insert');

    const extractButton = document.createElement('button');
    extractButton.textContent = heapType === 'minHeap' ? 'Extract Min' : 'Extract Max';
    extractButton.onclick = () => handleHeapOperation(heapType, 'extract');

    structureControlsContainer.appendChild(valueInput);
    structureControlsContainer.appendChild(insertButton);
    structureControlsContainer.appendChild(extractButton);

     valueInput.addEventListener('keypress', (event) => {
         if (event.key === 'Enter') {
             insertButton.click();
         }
     });
}

async function handleHeapOperation(heapType, operationType) {
    if (isRunning) return;
    const input = document.getElementById(`${heapType}-value-input`);
    let value = null;
    let numValue = NaN;

    if (operationType === 'insert') {
        value = input.value.trim();
        numValue = parseInt(value);
        if (value === '' || isNaN(numValue)) {
            updateInfo(null, "Please enter a valid number to insert.");
            input.focus();
            return;
        }
    }

    const viz = visualizations[heapType];
    if (viz && viz[operationType]) {
        if (!structureInstance || !Array.isArray(structureInstance)) {
            structureInstance = []; // Initialize if needed
        }
        if (operationType === 'insert') {
             startAnimation(viz[operationType](numValue));
             input.value = ''; // Clear input
        } else {
             startAnimation(viz[operationType]()); // Extract doesn't need a value
        }
    }
}

// --- Heap Helper Functions (Generic - MIN HEAP VERSION) ---
function getParentIndex(i) { return Math.floor((i - 1) / 2); }
function getLeftChildIndex(i) { return 2 * i + 1; }
function getRightChildIndex(i) { return 2 * i + 2; }

async function* heapifyUpMin(heapArray, startIndex) {
    let currentIndex = startIndex;
    let parentIndex = getParentIndex(currentIndex);

    updateInfo(null, `Heapifying up from index ${currentIndex} (Value: <strong>${heapArray[currentIndex]}</strong>)`);

    while (currentIndex > 0 && heapArray[currentIndex] < heapArray[parentIndex]) {
        updateInfo(null, `Node <strong>${heapArray[currentIndex]}</strong> (idx ${currentIndex}) < Parent <strong>${heapArray[parentIndex]}</strong> (idx ${parentIndex}). Swapping.`);
         renderBars(heapArray, { comparing: [currentIndex, parentIndex] });
         yield await sleep(getDelay());

         renderBars(heapArray, { swapping: [currentIndex, parentIndex] });
         yield await sleep(getDelay());

        [heapArray[currentIndex], heapArray[parentIndex]] = [heapArray[parentIndex], heapArray[currentIndex]];

         renderBars(heapArray, { swapping: [currentIndex, parentIndex] });
         yield await sleep(getDelay());

         renderBars(heapArray, { special: [parentIndex] });
         yield await sleep(getDelay() / 2);

        currentIndex = parentIndex;
        parentIndex = getParentIndex(currentIndex);
         if(currentIndex > 0) {
             renderBars(heapArray, { comparing: [currentIndex, parentIndex] });
             yield await sleep(getDelay() / 2);
         }
    }
    updateInfo(null, `Heap property restored for index ${currentIndex}.`);
    renderBars(heapArray);
    yield await sleep(getDelay()/2);
}

async function* heapifyDownMin(heapArray, startIndex, heapSize) {
    let currentIndex = startIndex;
    updateInfo(null, `Heapifying down from index ${currentIndex} (Value: <strong>${heapArray[currentIndex]}</strong>)`);
    renderBars(heapArray, {special: [currentIndex]});
    yield await sleep(getDelay());

    while (true) {
        let leftChildIndex = getLeftChildIndex(currentIndex);
        let rightChildIndex = getRightChildIndex(currentIndex);
        let smallestIndex = currentIndex;

        const nodesToCompare = [currentIndex];
        if (leftChildIndex < heapSize) nodesToCompare.push(leftChildIndex);
        if (rightChildIndex < heapSize) nodesToCompare.push(rightChildIndex);

        updateInfo(null, `Checking children of node ${currentIndex} (<strong>${heapArray[currentIndex]}</strong>)`);
        renderBars(heapArray, { comparing: nodesToCompare });
        yield await sleep(getDelay());

        if (leftChildIndex < heapSize && heapArray[leftChildIndex] < heapArray[smallestIndex]) {
            smallestIndex = leftChildIndex;
        }
        if (rightChildIndex < heapSize && heapArray[rightChildIndex] < heapArray[smallestIndex]) {
            smallestIndex = rightChildIndex;
        }

        if (smallestIndex !== currentIndex) {
             updateInfo(null, `Smallest child is <strong>${heapArray[smallestIndex]}</strong> (idx ${smallestIndex}). Swapping with current node <strong>${heapArray[currentIndex]}</strong> (idx ${currentIndex}).`);
             renderBars(heapArray, { comparing: nodesToCompare, special: [smallestIndex]});
             yield await sleep(getDelay()/2);

             renderBars(heapArray, { swapping: [currentIndex, smallestIndex] });
             yield await sleep(getDelay());

            [heapArray[currentIndex], heapArray[smallestIndex]] = [heapArray[smallestIndex], heapArray[currentIndex]];

            renderBars(heapArray, { swapping: [currentIndex, smallestIndex] });
             yield await sleep(getDelay());

            currentIndex = smallestIndex;
             renderBars(heapArray, { special: [currentIndex] });
             yield await sleep(getDelay()/2);
        } else {
            updateInfo(null, `Node <strong>${heapArray[currentIndex]}</strong> is smaller than its children. Heap property restored.`);
            renderBars(heapArray);
            yield await sleep(getDelay()/2);
            break;
        }
    }
}


// --- MinHeap Visualization Definition ---
if (typeof visualizations === 'undefined') {
    console.error("minHeap.js: 'visualizations' object not found.");
} else {
    visualizations.minHeap = {
        title: "Min-Heap",
        description: "Tree-based structure where parent are always <code>less than</code> or <code>equal to</code> child nodes. Root holds the <code>minimum value</code>.",
        // currentSize will be managed by script.js

        init: async function(n = 10) { // n is the specific size for this visualization
            this.currentSize = n;
            structureInstance = Array.from({ length: n }, () => getRandomInt(MIN_DATA_VALUE, MAX_DATA_VALUE));
            const firstNonLeaf = Math.floor(structureInstance.length / 2) - 1;
            for (let i = firstNonLeaf; i >= 0; i--) {
                instantHeapifyDownMin(structureInstance, i, structureInstance.length);
            }
            renderBars(structureInstance);
            updateInfo(this.title, this.description + "<br>Min-Heap initialized.");
            this.addControls(); // Call its own addControls
            disableControls(false);
            startButton.disabled = true;
            sizeSlider.style.display = 'inline-block';
            sizeLabel.style.display = 'inline-block';
        },
        addControls: () => addHeapControls('minHeap'), // Uses the shared heap controls
        start: null, // Operations are via buttons

        insert: async function*(value) {
             if (!structureInstance || !Array.isArray(structureInstance)) structureInstance = [];
             updateInfo("MinHeap Insert", `Inserting value <strong>${value}</strong>...`);
             structureInstance.push(value);
             const insertedIndex = structureInstance.length - 1;
             renderBars(structureInstance, { special: [insertedIndex] });
             yield await sleep(getDelay());

             yield* heapifyUpMin(structureInstance, insertedIndex);

             updateInfo("MinHeap Insert", `Value <strong>${value}</strong> inserted and heap property restored.`);
             renderBars(structureInstance);
             disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
        },

        extract: async function*() { // Extract Min
             if (!structureInstance || structureInstance.length === 0) {
                 updateInfo("MinHeap Extract", "Heap is empty. Cannot extract.");
                 yield await sleep(getDelay());
                 disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
                 return;
             }

             const minValue = structureInstance[0];
             updateInfo("MinHeap Extract", `Minimum value is <strong>${minValue}</strong> (at root).`);
             renderBars(structureInstance, { special: [0] });
             yield await sleep(getDelay());

             const lastValue = structureInstance.pop();
             const lastIndexOriginal = structureInstance.length; 

             if (structureInstance.length === 0) {
                  updateInfo("MinHeap Extract", `Extracted <strong>${minValue}</strong>. Heap is now empty.`);
                  renderBars(structureInstance);
                  yield await sleep(getDelay());
             } else {
                 updateInfo("MinHeap Extract", `Moving last element <strong>${lastValue}</strong> to root.`);
                  renderBars(structureInstance.concat([minValue]), { swapping: [0, lastIndexOriginal] }); 
                  yield await sleep(getDelay());

                 structureInstance[0] = lastValue;
                 renderBars(structureInstance, { special: [0] });
                 yield await sleep(getDelay());

                 yield* heapifyDownMin(structureInstance, 0, structureInstance.length);

                 updateInfo("MinHeap Extract", `Extracted <strong>${minValue}</strong>. Heap property restored.`);
                 renderBars(structureInstance);
             }
             disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
        }
    };
     // Instant version for init
     function instantHeapifyDownMin(heapArray, startIndex, heapSize) {
         let currentIndex = startIndex;
         while (true) {
             let leftChildIndex = getLeftChildIndex(currentIndex);
             let rightChildIndex = getRightChildIndex(currentIndex);
             let smallestIndex = currentIndex;
             if (leftChildIndex < heapSize && heapArray[leftChildIndex] < heapArray[smallestIndex]) {
                 smallestIndex = leftChildIndex;
             }
             if (rightChildIndex < heapSize && heapArray[rightChildIndex] < heapArray[smallestIndex]) {
                 smallestIndex = rightChildIndex;
             }
             if (smallestIndex !== currentIndex) {
                 [heapArray[currentIndex], heapArray[smallestIndex]] = [heapArray[smallestIndex], heapArray[currentIndex]];
                 currentIndex = smallestIndex;
             } else {
                 break;
             }
         }
     }
}
// --- END OF FILE js/visualizations/data-structures/minHeap.js ---