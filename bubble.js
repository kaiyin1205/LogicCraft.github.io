// --- START OF FILE js/visualizations/sorting/bubbleSort.js ---
// Assumes 'visualizations' object is declared globally (e.g., in dom-setup.js)
// Assumes helper functions (getRandomInt, renderBars, sleep, getDelay, updateInfo, getSortedIndices, MIN_DATA_VALUE, MAX_DATA_VALUE, disableControls, structureControlsContainer, sizeSlider, isRunning, pauseButton) are globally available

if (typeof visualizations === 'undefined') {
    console.error("bubbleSort.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.bubbleSort = {
        title: "Bubble Sort",
        description: "Compares adjacent elements (<code>arr[i]</code>, <code>arr[i+1]</code>) and swaps them if out of order. Largest elements 'bubble' to the end.",
        timeComplexities: { // Corrected time complexities
            best: "O(n)",
            average: "O(n<sup>2</sup>)",
            worst: "O(n<sup>2</sup>)"
        },
        // currentSize will be managed by script.js

        init: async function(n) { // n is the specific size for this visualization
            // 'this' refers to visualizations.bubbleSort
            this.currentSize = n; // Store it if needed by other methods of this object directly
            data = Array.from({ length: n }, () => getRandomInt(MIN_DATA_VALUE, MAX_DATA_VALUE));
            renderBars(data);
            let descriptionHtml = this.description; // Use this.description
            descriptionHtml += "<br>Array initialized. Use controls to set specific cases.";
            updateInfo(this.title, descriptionHtml); // Use this.title
        },
        addControls: function() {
            // 'this' refers to visualizations.bubbleSort
            const currentAlgorithmSize = this.currentSize || parseInt(sizeSlider.value); // Fallback, but currentSize should be set

            structureControlsContainer.innerHTML = '';

            const bestCaseButton = document.createElement('button');
            bestCaseButton.textContent = 'Best Case';
            bestCaseButton.onclick = () => {
                if (isRunning) return;
                data = this.generateBestCase(currentAlgorithmSize); // Use currentAlgorithmSize
                renderBars(data);
                updateInfo(null, `<span style="color: #53d8fb;"><b>Time Complexity (Best):</b></span> <span style="color: white;"><b>${this.timeComplexities.best}</b></span><br>Best case array (sorted) generated. Press <b>Start</b>.`);
                disableControls(false);
                if (pauseButton) pauseButton.disabled = true;
            };

            const worstCaseButton = document.createElement('button');
            worstCaseButton.textContent = 'Worst Case';
            worstCaseButton.onclick = () => {
                if (isRunning) return;
                data = this.generateWorstCase(currentAlgorithmSize); // Use currentAlgorithmSize
                renderBars(data);
                updateInfo(null, `<span style="color: #53d8fb;"><b>Time Complexity (Worst):</b></span> <span style="color: white;"><b>${this.timeComplexities.worst}</b></span><br>Worst case array (reverse sorted) generated. Press <b>Start</b>.`);
                disableControls(false);
                if (pauseButton) pauseButton.disabled = true;
            };

            const averageCaseButton = document.createElement('button');
            averageCaseButton.textContent = 'Average Case';
            averageCaseButton.onclick = () => {
                if (isRunning) return;
                data = Array.from({ length: currentAlgorithmSize }, () => getRandomInt(MIN_DATA_VALUE, MAX_DATA_VALUE)); // Use currentAlgorithmSize
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
            // 'this' refers to visualizations.bubbleSort
            let arr = [...data];
            let n = arr.length;
            let swapped;
            let sortedCount = 0;
            updateInfo(this.title, this.description + "<br>Sorting...");

            do {
                swapped = false;
                updateInfo(null, `Starting pass ${arr.length - n + 1}...`);
                yield await sleep(getDelay()/2);
                for (let i = 0; i < n - 1; i++) {
                    updateInfo(null, `Comparing <strong>${arr[i]}</strong> (index ${i}) and <strong>${arr[i+1]}</strong> (index ${i+1})`);
                    renderBars(arr, { comparing: [i, i + 1], sorted: getSortedIndices(arr.length, sortedCount) });
                    yield await sleep(getDelay());

                    if (arr[i] > arr[i + 1]) {
                        updateInfo(null, `Swapping <strong>${arr[i]}</strong> and <strong>${arr[i+1]}</strong>`);
                        renderBars(arr, { swapping: [i, i + 1], sorted: getSortedIndices(arr.length, sortedCount) });
                        yield await sleep(getDelay());

                        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                        swapped = true;

                        renderBars(arr, { swapping: [i, i + 1], sorted: getSortedIndices(arr.length, sortedCount) });
                        yield await sleep(getDelay());
                    }
                    renderBars(arr, { sorted: getSortedIndices(arr.length, sortedCount) });
                }
                n--;
                sortedCount++;
                // Check if 'n' is a valid index before accessing arr[n]
                if (n >= 0 && n < arr.length) {
                    updateInfo(null, `Element <strong>${arr[n]}</strong> is now sorted.`);
                } else {
                    // This case might occur if n becomes -1 (e.g. array of length 1 or 0)
                     updateInfo(null, `Pass complete. Last element considered sorted.`);
                }
                renderBars(arr, { sorted: getSortedIndices(arr.length, sortedCount) });
                yield await sleep(getDelay());

            } while (swapped && n > 1);

            const finalSortedIndices = Array.from({length: arr.length}, (_,k) => k);
            renderBars(arr, { sorted: finalSortedIndices });
            data = [...arr]; // Update the global 'data' for rendering purposes if finish doesn't immediately re-render
        },
        finish: async function() { 
        updateInfo(this.title, "Final sorted array."); 
        disableControls(false);
        if (pauseButton) {
            pauseButton.disabled = true;
            pauseButton.textContent = 'Pause';
        }

}}};