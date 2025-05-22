// --- START OF FILE js/visualizations/sorting/mergeSort.js ---
// Assumes 'visualizations' object is declared globally (e.g., in dom-setup.js)
// Assumes helper functions (getRandomInt, renderBars, sleep, getDelay, updateInfo, MIN_DATA_VALUE, MAX_DATA_VALUE, disableControls, structureControlsContainer, sizeSlider, isRunning, pauseButton) are globally available

if (typeof visualizations === 'undefined') {
    console.error("mergeSort.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.mergeSort = {
        title: "Merge Sort",
        description: "Divide & Conquer: Recursively divides the array into halves (<code>left</code>, <code>right</code>), sorts them, and then merges the sorted halves.",
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
            let workingArr = arr.map((value, originalIndex) => ({ value, originalIndex }));

            async function* merge(array, left, mid, right) {
                let n1 = mid - left + 1;
                let n2 = right - mid;

                let L = new Array(n1);
                let R = new Array(n2);
                for (let i = 0; i < n1; i++) L[i] = array[left + i];
                for (let j = 0; j < n2; j++) R[j] = array[mid + 1 + j];

                let i = 0;
                let j = 0;
                let k = left;
                const mergeRangeOriginalIndices = array.slice(left, right + 1).map(item => item.originalIndex);

                updateInfo(null, `Merging range from index ${left} to ${right}.`);
                renderBars(array.map(item => item.value), {
                    special: mergeRangeOriginalIndices,
                });
                yield await sleep(getDelay());

                while (i < n1 && j < n2) {
                    updateInfo(null, `Comparing L[${i}] (val: ${L[i].value}) and R[${j}] (val: ${R[j].value}). Placing at main array index ${k}.`);
                    renderBars(array.map(item => item.value), {
                        comparing: [L[i].originalIndex, R[j].originalIndex],
                        target: [array[k].originalIndex], 
                        special: mergeRangeOriginalIndices,
                    });
                    yield await sleep(getDelay());

                    if (L[i].value <= R[j].value) {
                        updateInfo(null, `Placing ${L[i].value} (from Left) into index ${k}.`);
                        array[k] = L[i];
                        i++;
                    } else {
                        updateInfo(null, `Placing ${R[j].value} (from Right) into index ${k}.`);
                        array[k] = R[j];
                        j++;
                    }
                    renderBars(array.map(item => item.value), {
                        swapping: [array[k].originalIndex], 
                        special: mergeRangeOriginalIndices,
                    });
                    yield await sleep(getDelay());
                    k++;
                }

                while (i < n1) {
                    updateInfo(null, `Copying remaining ${L[i].value} (from Left) into index ${k}.`);
                    renderBars(array.map(item => item.value), {
                        comparing: [L[i].originalIndex],
                        target: [array[k]?.originalIndex], 
                        special: mergeRangeOriginalIndices,
                    });
                    yield await sleep(getDelay()/2);
                    array[k] = L[i];
                    renderBars(array.map(item => item.value), {
                        swapping: [array[k].originalIndex],
                        special: mergeRangeOriginalIndices,
                    });
                    yield await sleep(getDelay()/2);
                    i++;
                    k++;
                }

                while (j < n2) {
                    updateInfo(null, `Copying remaining ${R[j].value} (from Right) into index ${k}.`);
                    renderBars(array.map(item => item.value), {
                        comparing: [R[j].originalIndex],
                        target: [array[k]?.originalIndex],
                        special: mergeRangeOriginalIndices,
                    });
                    yield await sleep(getDelay()/2);
                    array[k] = R[j];
                    renderBars(array.map(item => item.value), {
                        swapping: [array[k].originalIndex],
                        special: mergeRangeOriginalIndices,
                    });
                    yield await sleep(getDelay()/2);
                    j++;
                    k++;
                }
                updateInfo(null, `Range from index ${left} to ${right} is now merged and sorted.`);
                renderBars(array.map(item => item.value), { special: mergeRangeOriginalIndices }); 
                yield await sleep(getDelay());
            }

            async function* mergeSortRecursive(array, left, right) {
                if (left >= right) {
                    if (left < array.length) {
                        updateInfo(null, `Base case: Sub-array at index ${left} (value ${array[left].value}) is sorted.`);
                        renderBars(array.map(item => item.value), { special: [array[left].originalIndex] });
                        yield await sleep(getDelay() / 2);
                    }
                    return;
                }

                const mid = Math.floor(left + (right - left) / 2);
                const currentProcessingRange = array.slice(left, right + 1).map(item => item.originalIndex);

                updateInfo(null, `Dividing range [${left}..${right}]. Midpoint: ${mid}.`);
                renderBars(array.map(item => item.value), { special: currentProcessingRange });
                yield await sleep(getDelay());

                yield* mergeSortRecursive(array, left, mid);
                yield* mergeSortRecursive(array, mid + 1, right);
                yield* merge(array, left, mid, right);
            }

            yield* mergeSortRecursive(workingArr, 0, n - 1);

            updateInfo(null, `Array is sorted!`);
            renderBars(workingArr.map(item => item.value), { sorted: Array.from({length: n}, (_, k) => workingArr[k].originalIndex) });
            data = workingArr.map(item => item.value);
        },
        finish: async function() { 
        updateInfo(this.title, "Final sorted array."); 
        disableControls(false);
        if (pauseButton) {
            pauseButton.disabled = true;
            pauseButton.textContent = 'Pause';
        }
}}};
// --- END OF FILE js/visualizations/sorting/mergeSort.js ---