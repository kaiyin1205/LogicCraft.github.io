// --- START OF FILE js/visualizations/data-structures/maxHeap.js ---
// Assumes 'visualizations' object is declared globally
// Assumes helper functions (updateInfo, sleep, getDelay, highlightElement, setElementClass, removeAllHighlights, vizArea, disableControls, startAnimation, renderBars, addHeapControls, handleHeapOperation, getRandomInt, MIN_DATA_VALUE, MAX_DATA_VALUE, sizeSlider) are globally available
// Assumes structureInstance is a global variable (holds heap array)

// --- Heap Helper Functions (Generic - MAX HEAP VERSION) ---
// getParentIndex, getLeftChildIndex, getRightChildIndex are the same as MinHeap (will be defined locally or assumed global)

async function* heapifyUpMax(heapArray, startIndex) {
    let currentIndex = startIndex;
    let parentIndex = getParentIndex(currentIndex); // Assuming getParentIndex is globally available

    updateInfo(null, `Heapifying up from index ${currentIndex} (Value: <strong>${heapArray[currentIndex]}</strong>)`);

    while (currentIndex > 0 && heapArray[currentIndex] > heapArray[parentIndex]) {
        updateInfo(null, `Node <strong>${heapArray[currentIndex]}</strong> (idx ${currentIndex}) > Parent <strong>${heapArray[parentIndex]}</strong> (idx ${parentIndex}). Swapping.`);
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

async function* heapifyDownMax(heapArray, startIndex, heapSize) {
    let currentIndex = startIndex;
    updateInfo(null, `Heapifying down from index ${currentIndex} (Value: <strong>${heapArray[currentIndex]}</strong>)`);
    renderBars(heapArray, {special: [currentIndex]});
    yield await sleep(getDelay());

    while (true) {
        let leftChildIndex = getLeftChildIndex(currentIndex); // Assuming getLeftChildIndex is global
        let rightChildIndex = getRightChildIndex(currentIndex); // Assuming getRightChildIndex is global
        let largestIndex = currentIndex;

        const nodesToCompare = [currentIndex];
        if (leftChildIndex < heapSize) nodesToCompare.push(leftChildIndex);
        if (rightChildIndex < heapSize) nodesToCompare.push(rightChildIndex);

         updateInfo(null, `Checking children of node ${currentIndex} (<strong>${heapArray[currentIndex]}</strong>)`);
         renderBars(heapArray, { comparing: nodesToCompare });
         yield await sleep(getDelay());

        if (leftChildIndex < heapSize && heapArray[leftChildIndex] > heapArray[largestIndex]) {
            largestIndex = leftChildIndex;
        }
        if (rightChildIndex < heapSize && heapArray[rightChildIndex] > heapArray[largestIndex]) {
            largestIndex = rightChildIndex;
        }

        if (largestIndex !== currentIndex) {
             updateInfo(null, `Largest child is <strong>${heapArray[largestIndex]}</strong> (idx ${largestIndex}). Swapping with current node <strong>${heapArray[currentIndex]}</strong> (idx ${currentIndex}).`);
             renderBars(heapArray, { comparing: nodesToCompare, special: [largestIndex]});
             yield await sleep(getDelay()/2);

             renderBars(heapArray, { swapping: [currentIndex, largestIndex] });
             yield await sleep(getDelay());

            [heapArray[currentIndex], heapArray[largestIndex]] = [heapArray[largestIndex], heapArray[currentIndex]];

            renderBars(heapArray, { swapping: [currentIndex, largestIndex] });
             yield await sleep(getDelay());

            currentIndex = largestIndex;
             renderBars(heapArray, { special: [currentIndex] });
             yield await sleep(getDelay()/2);
        } else {
            updateInfo(null, `Node <strong>${heapArray[currentIndex]}</strong> is larger than its children. Heap property restored.`);
             renderBars(heapArray);
            yield await sleep(getDelay()/2);
            break;
        }
    }
}

// --- MaxHeap Visualization Definition ---
if (typeof visualizations === 'undefined') {
    console.error("maxHeap.js: 'visualizations' object not found.");
} else {
    visualizations.maxHeap = {
        title: "Max-Heap",
        description: "Tree-based structure where parent are always <code>greater than</code> or <code>equal to</code> child nodes. Root holds the <code>maximum value</code>.",
        // currentSize will be managed by script.js

        init: async function(n = 10) { // n is the specific size for this visualization
             this.currentSize = n;
             structureInstance = Array.from({ length: n }, () => getRandomInt(MIN_DATA_VALUE, MAX_DATA_VALUE));
             const firstNonLeaf = Math.floor(structureInstance.length / 2) - 1;
             for (let i = firstNonLeaf; i >= 0; i--) {
                 instantHeapifyDownMax(structureInstance, i, structureInstance.length);
             }
            renderBars(structureInstance);
            updateInfo(this.title, this.description + "<br>Max-Heap initialized.");
            this.addControls(); // Call its own addControls
            disableControls(false);
            startButton.disabled = true;
             sizeSlider.style.display = 'inline-block';
             sizeLabel.style.display = 'inline-block';
        },
        addControls: () => addHeapControls('maxHeap'), // Uses the shared heap controls
        start: null,

        insert: async function*(value) {
             if (!structureInstance || !Array.isArray(structureInstance)) structureInstance = [];
             updateInfo("MaxHeap Insert", `Inserting value <strong>${value}</strong>...`);
             structureInstance.push(value);
             const insertedIndex = structureInstance.length - 1;
             renderBars(structureInstance, { special: [insertedIndex] });
             yield await sleep(getDelay());

             yield* heapifyUpMax(structureInstance, insertedIndex);

             updateInfo("MaxHeap Insert", `Value <strong>${value}</strong> inserted and heap property restored.`);
             renderBars(structureInstance);
             disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
        },

        extract: async function*() { // Extract Max
             if (!structureInstance || structureInstance.length === 0) {
                 updateInfo("MaxHeap Extract", "Heap is empty. Cannot extract.");
                 yield await sleep(getDelay());
                 disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
                 return;
             }

             const maxValue = structureInstance[0];
             updateInfo("MaxHeap Extract", `Maximum value is <strong>${maxValue}</strong> (at root).`);
             renderBars(structureInstance, { special: [0] });
             yield await sleep(getDelay());

             const lastValue = structureInstance.pop();
             const lastIndexOriginal = structureInstance.length;

             if (structureInstance.length === 0) {
                  updateInfo("MaxHeap Extract", `Extracted <strong>${maxValue}</strong>. Heap is now empty.`);
                  renderBars(structureInstance);
                  yield await sleep(getDelay());
             } else {
                 updateInfo("MaxHeap Extract", `Moving last element <strong>${lastValue}</strong> to root.`);
                  renderBars(structureInstance.concat([maxValue]), { swapping: [0, lastIndexOriginal] });
                  yield await sleep(getDelay());

                 structureInstance[0] = lastValue;
                 renderBars(structureInstance, { special: [0] });
                 yield await sleep(getDelay());

                 yield* heapifyDownMax(structureInstance, 0, structureInstance.length);

                 updateInfo("MaxHeap Extract", `Extracted <strong>${maxValue}</strong>. Heap property restored.`);
                 renderBars(structureInstance);
             }
             disableControls(false); startButton.disabled = true; pauseButton.disabled = true;
        }
    };
     // Instant version for init
     function instantHeapifyDownMax(heapArray, startIndex, heapSize) {
         let currentIndex = startIndex;
         while (true) {
             let leftChildIndex = getLeftChildIndex(currentIndex);
             let rightChildIndex = getRightChildIndex(currentIndex);
             let largestIndex = currentIndex;
             if (leftChildIndex < heapSize && heapArray[leftChildIndex] > heapArray[largestIndex]) {
                 largestIndex = leftChildIndex;
             }
             if (rightChildIndex < heapSize && heapArray[rightChildIndex] > heapArray[largestIndex]) {
                 largestIndex = rightChildIndex;
             }
             if (largestIndex !== currentIndex) {
                 [heapArray[currentIndex], heapArray[largestIndex]] = [heapArray[largestIndex], heapArray[currentIndex]];
                 currentIndex = largestIndex;
             } else {
                 break;
             }
         }
     }
     // Share heap helper indices (ensure these are defined if not importing from minHeap.js)
     // If minHeap.js is loaded first, these will be global. Otherwise, define them here too.
     if (typeof getParentIndex === 'undefined') {
        function getParentIndex(i) { return Math.floor((i - 1) / 2); }
        function getLeftChildIndex(i) { return 2 * i + 1; }
        function getRightChildIndex(i) { return 2 * i + 2; }
     }
}
// --- END OF FILE js/visualizations/data-structures/maxHeap.js ---