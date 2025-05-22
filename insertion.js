// --- START OF FILE js/visualizations/sorting/insertionSort.js ---
// Assumes 'visualizations' object is declared globally (e.g., in dom-setup.js)
// Assumes helper functions (getRandomInt, renderBars, sleep, getDelay, updateInfo, getSortedIndices, MIN_DATA_VALUE, MAX_DATA_VALUE, disableControls, structureControlsContainer, sizeSlider, isRunning, pauseButton) are globally available

if (typeof visualizations === 'undefined') {
    console.error("insertionSort.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
} else {
    visualizations.insertionSort = {
        title: "Insertion Sort",
        description: "Iterates through the array, taking one element (<code>current</code>) at a time and inserting it into its correct position within the already sorted portion.",
        timeComplexities: {
            best: "O(n)",
            average: "O(n<sup>2</sup>)",
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
            if (n > 0) {
                renderBars(arr, { sorted: getSortedIndices(1, 1, false) });
                updateInfo(null, `Element <strong>${arr[0]}</strong> is considered sorted.`);
                yield await sleep(getDelay());
            }

            for (let i = 1; i < n; i++) {
                let current = arr[i];
                let j = i - 1;
                updateInfo(null, `Taking element <strong>${current}</strong> (at index ${i}) to insert into sorted part.`);
                renderBars(arr, { special: [i], sorted: getSortedIndices(i, i, false) });
                yield await sleep(getDelay());

                updateInfo(null, `Comparing <strong>${current}</strong> with sorted elements to its left...`);
                let shifted = false;

                if (j >= 0) {
                    renderBars(arr, { comparing: [j], special: [i], sorted: getSortedIndices(i, i, false) });
                    yield await sleep(getDelay());
                }

                while (j >= 0 && arr[j] > current) {
                    shifted = true;
                    updateInfo(null, `Shifting <strong>${arr[j]}</strong> (idx ${j}) right to index ${j + 1}.`);
                    renderBars(arr, { swapping: [j, j + 1], special: [i], sorted: getSortedIndices(i, i, false) });
                    yield await sleep(getDelay());

                    arr[j + 1] = arr[j];

                    renderBars(arr, { special: [j], sorted: getSortedIndices(i, i, false) });
                    yield await sleep(getDelay());

                    j--;

                    if (j >= 0) {
                        renderBars(arr, { comparing: [j], special: [i], sorted: getSortedIndices(i, i, false) });
                        yield await sleep(getDelay());
                    }
                }

                const insertionIndex = j + 1;
                if (insertionIndex !== i) {
                    updateInfo(null, `Inserting <strong>${current}</strong> at index ${insertionIndex}.`);
                } else if (!shifted) {
                     updateInfo(null, `Element <strong>${current}</strong> is already in correct sorted position.`);
                }

                arr[insertionIndex] = current;

                renderBars(arr, { special: [insertionIndex], sorted: getSortedIndices(i + 1, i + 1, false) });
                yield await sleep(getDelay() * 1.2);

                renderBars(arr, { sorted: getSortedIndices(i + 1, i + 1, false) });
                yield await sleep(getDelay());
            }
            updateInfo(null, `Array is sorted!`);
            renderBars(arr, { sorted: Array.from({length: n}, (_, k) => k) });
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
// --- END OF FILE js/visualizations/sorting/insertionSort.js ---