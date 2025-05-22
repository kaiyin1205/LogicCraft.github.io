// --- START OF FILE js/visualizations/sorting/selectionSort.js ---
// Assumes 'visualizations' object is declared globally (e.g., in dom-setup.js)
// Assumes helper functions (getRandomInt, renderBars, sleep, getDelay, updateInfo, getSortedIndices, MIN_DATA_VALUE, MAX_DATA_VALUE, disableControls, structureControlsContainer, sizeSlider, isRunning, pauseButton) are globally available

if (typeof visualizations === 'undefined') {
    console.error("selectionSort.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.selectionSort = {
         title: "Selection Sort",
         description: "Finds the minimum element in the unsorted part (<code>minVal</code>) and swaps it with the element at the current position (<code>arr[i]</code>).",
         timeComplexities: {
            best: "O(n<sup>2</sup>)",
            average: "O(n<sup>2</sup>)",
            worst: "O(n<sup>2</sup>)"
        },
        // currentSize will be managed by script.js

         init: async function(n) {
            this.currentSize = n;
            data = Array.from({ length: n }, () => getRandomInt(MIN_DATA_VALUE, MAX_DATA_VALUE));
            renderBars(data);
            let descriptionHtml = this.description;
            descriptionHtml += "<br>Array initialized. Use controls to set specific cases.";
            updateInfo(this.title, descriptionHtml);
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
                updateInfo(null, `<span style="color: #53d8fb;"><b>Time Complexity (Best):</b></span> <span style="color: white;"><b>${this.timeComplexities.best}</b></span><br>Best case array (sorted) generated. Press <b>Start</b>.`);
                disableControls(false);
                if (pauseButton) pauseButton.disabled = true;
            };

            const worstCaseButton = document.createElement('button');
            worstCaseButton.textContent = 'Worst Case';
            worstCaseButton.onclick = () => {
                if (isRunning) return;
                data = this.generateWorstCase(currentAlgorithmSize);
                renderBars(data);
                updateInfo(null, `<span style="color: #53d8fb;"><b>Time Complexity (Worst):</b></span> <span style="color: white;"><b>${this.timeComplexities.worst}</b></span><br>Worst case array (reverse sorted) generated. Press <b>Start</b>.`);
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
             for (let i = 0; i < n - 1; i++) {
                 let minIndex = i;
                 updateInfo(null, `Finding minimum for index <strong>${i}</strong>... Current min: <strong>${arr[minIndex]}</strong>.`);
                 renderBars(arr, { special: [i], comparing: [minIndex], sorted: getSortedIndices(i, i, false) });
                 yield await sleep(getDelay());

                 for (let j = i + 1; j < n; j++) {
                     updateInfo(null, `Comparing current min <strong>${arr[minIndex]}</strong> with <strong>${arr[j]}</strong>.`);
                     renderBars(arr, { comparing: [minIndex, j], special: [i], sorted: getSortedIndices(i, i, false) });
                     yield await sleep(getDelay());

                     if (arr[j] < arr[minIndex]) {
                         minIndex = j;
                         updateInfo(null, `Found new minimum: <strong>${arr[minIndex]}</strong> at index ${minIndex}.`);
                          renderBars(arr, { comparing: [minIndex], special: [i], sorted: getSortedIndices(i, i, false) });
                          yield await sleep(getDelay());
                     } else {
                          renderBars(arr, { comparing: [minIndex, j], special: [i], sorted: getSortedIndices(i, i, false) });
                          yield await sleep(getDelay()/2);
                     }
                 }
                 renderBars(arr, { special: [i], comparing: [minIndex], sorted: getSortedIndices(i, i, false) });
                 yield await sleep(getDelay()/2);

                 if (minIndex !== i) {
                     updateInfo(null, `Swapping minimum <strong>${arr[minIndex]}</strong> (idx ${minIndex}) with element at index ${i} (<strong>${arr[i]}</strong>).`);
                     renderBars(arr, { swapping: [i, minIndex], sorted: getSortedIndices(i, i, false) });
                     yield await sleep(getDelay());

                     [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];

                     renderBars(arr, { swapping: [i, minIndex], sorted: getSortedIndices(i, i, false) });
                     yield await sleep(getDelay());
                 } else {
                      updateInfo(null, `Element <strong>${arr[i]}</strong> is already in correct position.`);
                      renderBars(arr, { special: [i], sorted: getSortedIndices(i, i, false) });
                      yield await sleep(getDelay()/2);
                 }
                  updateInfo(null, `Element <strong>${arr[i]}</strong> is now sorted.`);
                  renderBars(arr, { sorted: getSortedIndices(i + 1, i + 1, false) });
                 yield await sleep(getDelay());
             }
             const finalSortedIndices = Array.from({length: n}, (_, k) => k);
             updateInfo(null, `Array is sorted!`);
             renderBars(arr, { sorted: finalSortedIndices });
             data = [...arr];
         },
        finish: async function() { 
        updateInfo(this.title, "Final sorted array."); 
        disableControls(false);
        if (pauseButton) {
            pauseButton.disabled = true;
            pauseButton.textContent = 'Pause';
        }
    }
    };
}
// --- END OF FILE js/visualizations/sorting/selectionSort.js ---