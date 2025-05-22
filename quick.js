// --- START OF FILE js/visualizations/sorting/quickSort.js ---
// Assumes 'visualizations' object is declared globally (e.g., in dom-setup.js)
// Assumes helper functions (getRandomInt, renderBars, sleep, getDelay, updateInfo, MIN_DATA_VALUE, MAX_DATA_VALUE, disableControls, structureControlsContainer, sizeSlider, isRunning, pauseButton) are globally available

if (typeof visualizations === 'undefined') {
    console.error("quickSort.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.quickSort = {
        title: "Quick Sort (Middle Pivot)",
        description: "Divide & Conquer: Picks the (<code>middle element</code>) as 'pivot', swaps it to the end, then partitions the array around the pivot value. Recursively sorts sub-arrays.",
        timeComplexities: {
            best: "O(n log n)",
            average: "O(n log n)",
            worst: "O(n<sup>2</sup>)"
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
                updateInfo(null, `<span style="color: #53d8fb;"><b>Time Complexity (Worst):</b></span> <span style="color: white;"><b>${this.timeComplexities.worst}</b></span><br>Worst case array (e.g. reverse sorted) generated. Press <b>Start</b>.`);
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

            function rangeIndices(start, end) {
                 return Array.from({length: Math.max(0, end - start + 1)}, (_, k) => start + k);
             }

            async function* partition(array, low, high) {
                if (low >= high) return low; 

                const midIndexInitial = Math.floor((low + high) / 2);
                let pivotValue = array[midIndexInitial];

                updateInfo(null, `Chosen middle pivot: <strong>${pivotValue}</strong> (idx ${midIndexInitial}) from range [${low}..${high}]. Swapping to end (idx ${high}).`);
                renderBars(array, {
                    pivot: [],
                    swapping: [midIndexInitial, high],
                    special: rangeIndices(low, high).filter(idx => !sortedIndices.has(idx)),
                    sorted: [...sortedIndices]
                });
                yield await sleep(getDelay());

                if (midIndexInitial !== high) { 
                    [array[midIndexInitial], array[high]] = [array[high], array[midIndexInitial]];
                }
                pivotValue = array[high]; 

                renderBars(array, {
                    pivot: [high], 
                    special: rangeIndices(low, high).filter(idx => !sortedIndices.has(idx)),
                    sorted: [...sortedIndices]
                });
                yield await sleep(getDelay());

                let i = low - 1;
                updateInfo(null, `Partitioning range [${low}..${high-1}] using pivot <strong>${pivotValue}</strong> (at idx ${high}).`);
                renderBars(array, {
                    pivot: [high],
                    special: rangeIndices(low, high - 1).filter(idx => !sortedIndices.has(idx)),
                    sorted: [...sortedIndices]
                 });
                yield await sleep(getDelay());

                for (let j = low; j < high; j++) {
                    if (sortedIndices.has(j)) continue;

                    updateInfo(null, `Comparing element <strong>${array[j]}</strong> (idx ${j}) with pivot <strong>${pivotValue}</strong>.`);
                    renderBars(array, {
                        pivot: [high],
                        comparing: [j],
                        special: rangeIndices(low, high - 1).filter(idx => !sortedIndices.has(idx) && idx !== j),
                        sorted: [...sortedIndices]
                    });
                    yield await sleep(getDelay());

                    if (array[j] < pivotValue) {
                        i++;
                        while (sortedIndices.has(i) && i < j) { i++; }

                         if (i < j) {
                             updateInfo(null, `Element <strong>${array[j]}</strong> < pivot. Swapping <strong>${array[i]}</strong> (idx ${i}) and <strong>${array[j]}</strong> (idx ${j}).`);
                             renderBars(array, {
                                pivot: [high],
                                swapping: [i, j],
                                special: rangeIndices(low, high - 1).filter(idx => !sortedIndices.has(idx) && idx !== i && idx !==j),
                                sorted: [...sortedIndices]
                            });
                            yield await sleep(getDelay());
                            [array[i], array[j]] = [array[j], array[i]];
                            renderBars(array, { 
                                pivot: [high],
                                swapping: [i, j],
                                special: rangeIndices(low, high - 1).filter(idx => !sortedIndices.has(idx) && idx !== i && idx !==j),
                                sorted: [...sortedIndices]
                             });
                            yield await sleep(getDelay());
                         }
                    }
                     renderBars(array, { 
                        pivot: [high],
                        special: rangeIndices(low, high - 1).filter(idx => !sortedIndices.has(idx)),
                        sorted: [...sortedIndices]
                    });
                     if (i === j || array[j] >= pivotValue || i >= j) yield await sleep(getDelay()/2);
                }

                 let finalPivotIndex = i + 1;
                 while(sortedIndices.has(finalPivotIndex) && finalPivotIndex < high) { finalPivotIndex++; }

                 if (finalPivotIndex > high) finalPivotIndex = high;

                 updateInfo(null, `Swapping pivot <strong>${pivotValue}</strong> (from idx ${high}) into correct position ${finalPivotIndex}.`);
                 renderBars(array, {
                     swapping: [finalPivotIndex, high],
                     special: rangeIndices(low, high).filter(idx => !sortedIndices.has(idx) && idx !== finalPivotIndex && idx !== high),
                     sorted: [...sortedIndices]
                 });
                 yield await sleep(getDelay());

                 [array[finalPivotIndex], array[high]] = [array[high], array[finalPivotIndex]];

                 renderBars(array, { 
                     sorted: [...sortedIndices] 
                 });
                 yield await sleep(getDelay());
                 return finalPivotIndex;
            }

            async function* quickSortRecursive(array, low, high) {
                if (low < high) {
                    let allSortedInRange = true;
                    for(let k = low; k <= high; k++) {
                        if (!sortedIndices.has(k)) {
                            allSortedInRange = false;
                            break;
                        }
                    }
                    if(allSortedInRange) {
                         updateInfo(null, `Range [${low}..${high}] already sorted. Skipping.`);
                         yield await sleep(getDelay()/2);
                         return;
                    }

                    updateInfo(null, `Processing range [${low}..${high}]...`);
                    const currentRange = rangeIndices(low, high).filter(idx => !sortedIndices.has(idx));
                    renderBars(array, { special: currentRange, sorted: [...sortedIndices] });
                    yield await sleep(getDelay());

                    const partitionGenerator = partition(array, low, high);
                    let result = await partitionGenerator.next(); 
                    let pi; 

                    while (!result.done) { 
                        yield; 
                        result = await partitionGenerator.next();
                    }
                    pi = result.value; 

                    if (pi !== undefined && pi >= low && pi <= high) { 
                        sortedIndices.add(pi);
                        updateInfo(null, `Pivot placed at sorted index ${pi} (value: <strong>${array[pi]}</strong>).`);
                        renderBars(array, { sorted: [...sortedIndices] });
                        yield await sleep(getDelay());

                        yield* quickSortRecursive(array, low, pi - 1);
                        yield* quickSortRecursive(array, pi + 1, high);
                    } else {
                        if (high - low <= 1) { // If partition didn't yield a valid index (e.g. range too small or already sorted)
                            // Mark remaining elements in this small range as sorted
                            for (let k_idx = low; k_idx <=high; k_idx++) if (k_idx >=0 && k_idx < array.length) sortedIndices.add(k_idx);
                            renderBars(array, {sorted: [...sortedIndices]});
                            yield await sleep(getDelay());
                        }
                    }
                } else if (low === high && low >= 0 && low < array.length) { // Base case: single element
                    if (!sortedIndices.has(low)) {
                        sortedIndices.add(low);
                        updateInfo(null, `Element at index ${low} (value: <strong>${array[low]}</strong>) is sorted (single element range).`);
                        renderBars(array, { sorted: [...sortedIndices] });
                        yield await sleep(getDelay()/2);
                    }
                }
            }

            yield* quickSortRecursive(arr, 0, n - 1);

            // Ensure all indices are marked as sorted at the very end
             for(let k_idx = 0; k_idx < n; k_idx++) sortedIndices.add(k_idx);

            updateInfo(null, `Array is sorted!`);
            renderBars(arr, { sorted: [...sortedIndices] }); // Use the populated sortedIndices
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
// --- END OF FILE js/visualizations/sorting/quickSort.js ---