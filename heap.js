// --- START OF FILE js/visualizations/sorting/heapSort.js ---
// Assumes 'visualizations' object is declared globally (e.g., in dom-setup.js)
// Assumes helper functions (getRandomInt, renderBars, sleep, getDelay, updateInfo, MIN_DATA_VALUE, MAX_DATA_VALUE, disableControls, structureControlsContainer, sizeSlider, isRunning, pauseButton) are globally available

if (typeof visualizations === 'undefined') {
    console.error("heapSort.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.heapSort = {
        title: "Heap Sort",
        description: "Builds a Max Heap, then repeatedly swaps the root (<code>max element</code>) with the last heap element, shrinks the heap, and restores heap property (heapify).",
        timeComplexities: {
            best: "O(n log n)",
            average: "O(n log n)",
            worst: "O(n log n)"
        },
        // currentSize will be managed by script.js

        init: async function(n) {
            this.currentSize = n;
            data = Array.from({ length: n }, () => getRandomInt(MIN_DATA_VALUE, MAX_DATA_VALUE));
            renderBars(data);
             updateInfo(this.title, this.description + "<br>Array initialized. Use controls to set specific cases.");
        },
        addControls: function() {
            const currentAlgorithmSize = this.currentSize || parseInt(sizeSlider.value);
            structureControlsContainer.innerHTML = '';

            const bestCaseButton = document.createElement('button');
            bestCaseButton.textContent = 'Best Case';
            bestCaseButton.onclick = () => {
                if (isRunning) return;
                data = this.generateBestCase(currentAlgorithmSize);
                renderBars(data);
                updateInfo(null, `<span style="color: #53d8fb;"><b>Time Complexity (Best):</b></span> <span style="color: white;"><b>${this.timeComplexities.best}</b></span><br>Best case array generated. Press <b>Start</b>.`);
                disableControls(false);
                if (pauseButton) pauseButton.disabled = true;
            };

            const worstCaseButton = document.createElement('button');
            worstCaseButton.textContent = 'Worst Case';
            worstCaseButton.onclick = () => {
                if (isRunning) return;
                data = this.generateWorstCase(currentAlgorithmSize);
                renderBars(data);
                updateInfo(null, `<span style="color: #53d8fb;"><b>Time Complexity (Worst):</b></span> <span style="color: white;"><b>${this.timeComplexities.worst}</b></span><br>Worst case array generated. Press <b>Start</b>.`);
                disableControls(false);
                if (pauseButton) pauseButton.disabled = true;
            };

            const averageCaseButton = document.createElement('button');
            averageCaseButton.textContent = 'Average Case';
            averageCaseButton.onclick = () => {
                if (isRunning) return;
                data = Array.from({ length: currentAlgorithmSize }, () => getRandomInt(MIN_DATA_VALUE, MAX_DATA_VALUE));
                renderBars(data);
                updateInfo(null, `<span style="color: #53d8fb;"><b>Time Complexity (Average):</b></span> <span style="color: white;"><b>${this.timeComplexities.average}</b></span><br>Average case array (random) generated. Press <b>Start</b>.`);
                disableControls(false);
                if (pauseButton) pauseButton.disabled = true;
            };

            structureControlsContainer.appendChild(bestCaseButton);
            structureControlsContainer.appendChild(worstCaseButton);
            structureControlsContainer.appendChild(averageCaseButton);
        },
        generateBestCase: (s_parameter_is_now_ignored_for_length) => {
            const FIXED_SIZE = 12;

            const range = MAX_DATA_VALUE - MIN_DATA_VALUE;
            const step = FIXED_SIZE > 1 ? range / (FIXED_SIZE - 1) : 0;
            return Array.from({ length: FIXED_SIZE }, (_, i) => Math.round(MIN_DATA_VALUE + i * step));
        },
        generateWorstCase: (s_parameter_is_now_ignored_for_length) => {
            const FIXED_SIZE = 12; 

            const range = MAX_DATA_VALUE - MIN_DATA_VALUE;
            const step = FIXED_SIZE > 1 ? range / (FIXED_SIZE - 1) : 0;
           return Array.from({ length: FIXED_SIZE }, (_, i) => Math.round(MAX_DATA_VALUE - i * step));
        },
        start: async function*() {
            let arr = [...data];
            let n = arr.length;
            let sortedIndices = new Set();

            async function* heapify(array, heapSize, i, contextMsg) {
                let largest = i;
                let left = 2 * i + 1;
                let right = 2 * i + 2;
                const comparingNodes = [i];
                if (left < heapSize) comparingNodes.push(left);
                if (right < heapSize) comparingNodes.push(right);

                 updateInfo(null, `${contextMsg}: Comparing node ${i} (<strong>${array[i]}</strong>) with children.`);
                 const validComparing = comparingNodes.filter(idx => idx < heapSize);
                 renderBars(array, { comparing: validComparing, sorted: [...sortedIndices] });
                 yield await sleep(getDelay());

                if (left < heapSize && array[left] > array[largest]) {
                    updateInfo(null, `${contextMsg}: Left child ${left} (${array[left]}) > current largest ${largest} (${array[largest]}).`);
                    largest = left;
                    renderBars(array, { comparing: validComparing, special: [largest], sorted: [...sortedIndices] });
                    yield await sleep(getDelay()/2);
                } else if (left < heapSize) {
                    updateInfo(null, `${contextMsg}: Left child ${left} (${array[left]}) <= current largest ${i} (${array[i]}).`);
                     yield await sleep(getDelay()/2);
                }

                if (right < heapSize && array[right] > array[largest]) {
                    updateInfo(null, `${contextMsg}: Right child ${right} (${array[right]}) > current largest ${largest} (${array[largest]}).`);
                    largest = right;
                    renderBars(array, { comparing: validComparing, special: [largest], sorted: [...sortedIndices] });
                    yield await sleep(getDelay()/2);
                } else if (right < heapSize) {
                    updateInfo(null, `${contextMsg}: Right child ${right} (${array[right]}) <= current largest ${largest} (${array[largest]}).`);
                    yield await sleep(getDelay()/2);
                }

                 if (largest === i) { // If no child was larger
                      renderBars(array, { comparing: validComparing, sorted: [...sortedIndices] }); // Show comparison ended
                      yield await sleep(getDelay()/2);
                 }

                if (largest !== i) {
                    updateInfo(null, `${contextMsg}: Swapping root ${i} (<strong>${array[i]}</strong>) with largest child ${largest} (<strong>${array[largest]}</strong>).`);
                    renderBars(array, { swapping: [i, largest], sorted: [...sortedIndices] });
                    yield await sleep(getDelay());
                    [array[i], array[largest]] = [array[largest], array[i]];
                    renderBars(array, { swapping: [i, largest], sorted: [...sortedIndices] });
                    yield await sleep(getDelay());
                    updateInfo(null, `${contextMsg}: Recursively heapifying affected subtree at index ${largest}.`);
                    yield* heapify(array, heapSize, largest, contextMsg);
                } else {
                     updateInfo(null, `${contextMsg}: Node ${i} (${array[i]}) is largest. Heap property maintained locally.`);
                      renderBars(array, { sorted: [...sortedIndices] }); // Render with no highlights other than sorted
                      yield await sleep(getDelay()/2);
                }
            }

            updateInfo(null, `Building Max Heap...`);
            yield await sleep(getDelay());
            const firstNonLeaf = Math.floor(n / 2) - 1;
            for (let i = firstNonLeaf; i >= 0; i--) {
                yield* heapify(arr, n, i, `Building heap (node ${i})`);
                renderBars(arr, { sorted: [...sortedIndices] }); // Re-render after each heapify call in the loop
                yield await sleep(getDelay()/2);
            }

            updateInfo(null, `Max Heap built. Starting sort phase...`);
            renderBars(arr, { sorted: [...sortedIndices] }); // Show the fully built heap
            yield await sleep(getDelay());

            for (let i = n - 1; i > 0; i--) {
                updateInfo(null, `Swapping root (max: <strong>${arr[0]}</strong>) with end of current heap (<strong>${arr[i]}</strong> at index ${i}).`);
                renderBars(arr, { swapping: [0, i], sorted: [...sortedIndices] });
                yield await sleep(getDelay());
                [arr[0], arr[i]] = [arr[i], arr[0]];

                sortedIndices.add(i);
                updateInfo(null, `Element <strong>${arr[i]}</strong> at index ${i} is now sorted.`);
                renderBars(arr, { swapping: [0, i], sorted: [...sortedIndices] }); // Show swap and new sorted
                yield await sleep(getDelay());

                updateInfo(null, `Heapifying root (index 0) for reduced heap size ${i}...`);
                yield* heapify(arr, i, 0, `Heapify root after extracting max`);
                 renderBars(arr, { sorted: [...sortedIndices] }); // Show state after heapify
                 yield await sleep(getDelay()/2);
            }

            if (n > 0) sortedIndices.add(0); // Add the last remaining element (root)
            updateInfo(null, `Element <strong>${arr[0]}</strong> at index 0 is sorted. Array is sorted!`);
            renderBars(arr, { sorted: [...sortedIndices] });
            data = [...arr];
        },
        finish: async function() { 
        updateInfo(this.title, "Final sorted array."); 
        disableControls(false);
        if (pauseButton) {
            pauseButton.disabled = true;
            pauseButton.textContent = 'Pause';
        }
}}};

// --- END OF FILE js/visualizations/sorting/heapSort.js ---