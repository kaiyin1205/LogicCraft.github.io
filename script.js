// --- START OF FILE js/script.js ---

// === MAIN EVENT LISTENERS and CONTROL FLOW ===

// Helper function to get a default size for a given visualization
function getDefaultSizeForViz(vizName) {
    const defaults = {
        bubbleSort: 20, selectionSort: 20, insertionSort: 20,
        mergeSort: 20, quickSort: 20, heapSort: 20,
        minHeap: 10, maxHeap: 10,
        towerOfHanoi: 3,
        bfs: 7, dfs: 7, prim: 7,
    };
    return defaults[vizName] || 20;
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing script.js...");

    // --- Initial Setup ---
    updateInfo("Select a Visualization", "Choose an algorithm or data structure from the sidebar to visualize its process.");
    disableControls(false);
    startButton.disabled = true;
    pauseButton.disabled = true;
    animationSpeed = parseInt(speedSlider.value);
    sizeLabel.style.display = 'none';
    sizeSlider.style.display = 'none';

    injectFooter(); // Dynamically add the footer to the main-content

    // --- Sidebar Navigation ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const vizName = button.dataset.viz;
            console.log(`Sidebar button clicked: ${vizName}`);

            if (vizName === currentViz && !isRunning) {
                console.log("Re-initializing the same visualization.");
                resetVisualization();
                return;
            }
            if (vizName === currentViz && isRunning) {
                console.log("Visualization already running.");
                return;
            }

            if (animationTimeoutId) {
                clearTimeout(animationTimeoutId);
                animationTimeoutId = null;
            }
            isRunning = false;
            isPaused = false;
            currentAlgorithm = null;
            pauseButton.textContent = 'Pause';

            currentViz = vizName;
            setActiveButton(currentViz);

            const vizConfig = visualizations[currentViz];

            if (!vizConfig) {
                console.error(`No visualization config found for: ${vizName}`);
                updateInfo("Error", `Configuration for '${vizName}' not found.`);
                vizArea.innerHTML = '<p style="color: var(--primary);">Error: Visualization not implemented.</p>';
                disableControls(true);
                resetButton.disabled = false;
                sizeLabel.style.display = 'none';
                sizeSlider.style.display = 'none';
                return;
            }

            const showSizeSlider = isSizeRelevant(currentViz);
            sizeLabel.style.display = showSizeSlider ? 'inline-block' : 'none';
            sizeSlider.style.display = showSizeSlider ? 'inline-block' : 'none';

            if (showSizeSlider) {
                if (currentViz === 'towerOfHanoi' && vizConfig.maxDisks) {
                    sizeSlider.min = vizConfig.minDisks || 2;
                    sizeSlider.max = vizConfig.maxDisks;
                } else {
                    sizeSlider.min = 5;
                    sizeSlider.max = 100;
                }

                if (vizConfig.currentSize === undefined) {
                    vizConfig.currentSize = getDefaultSizeForViz(currentViz);
                }
                let currentSizeForViz = parseInt(vizConfig.currentSize);
                const sliderMin = parseInt(sizeSlider.min);
                const sliderMax = parseInt(sizeSlider.max);

                if (currentSizeForViz < sliderMin) currentSizeForViz = sliderMin;
                if (currentSizeForViz > sliderMax) currentSizeForViz = sliderMax;

                vizConfig.currentSize = currentSizeForViz;
                sizeSlider.value = vizConfig.currentSize;
            }


            updateInfo(vizConfig.title, vizConfig.description);
            structureControlsContainer.innerHTML = '';
            if (vizConfig.addControls && typeof vizConfig.addControls === 'function') {
                vizConfig.addControls(structureControlsContainer);
                structureControlsContainer.querySelectorAll('button, input').forEach(el => el.disabled = false);
            }

            resetVisualization();
        });
    });

    // --- Control Buttons ---
    startButton.addEventListener('click', () => {
        const vizConfig = visualizations[currentViz];
        if (vizConfig && vizConfig.start) {
            let isReady = true;
            if (vizConfig.checkReadyState && typeof vizConfig.checkReadyState === 'function') {
                isReady = vizConfig.checkReadyState();
            } else {
                if (isSizeRelevant(currentViz) && (!vizConfig.currentSize || vizConfig.currentSize <= 0)) {
                    isReady = false;
                }
            }

            if (!isReady) {
                console.log("Data/state not ready, re-initializing before start...");
                resetVisualization();
            }
            console.log(`Starting visualization: ${currentViz}`);
            startAnimation(vizConfig.start());
        } else {
            console.error("No start function defined for this visualization or visualization not selected.");
            updateInfo(null, "Cannot start: Visualization does not have a 'start' function or is not selected.");
            startButton.disabled = true;
        }
    });

    pauseButton.addEventListener('click', () => {
        console.log("Pause/Resume button clicked.");
        pauseResumeAnimation();
    });

    resetButton.addEventListener('click', () => {
        console.log("Reset button clicked.");
        resetVisualization();
    });

    // --- Sliders ---
    speedSlider.addEventListener('input', () => {
        animationSpeed = parseInt(speedSlider.value);
        console.log(`Animation speed set to: ${animationSpeed} (Effective Delay: ${getDelay()}ms)`);
    });

    sizeSlider.addEventListener('input', () => {
        const newSize = parseInt(sizeSlider.value);
        if (currentViz && visualizations[currentViz] && isSizeRelevant(currentViz)) {
            visualizations[currentViz].currentSize = newSize;
            console.log(`Size for ${currentViz} changed to: ${newSize}. Resetting visualization.`);
        } else {
            console.log(`Global size slider changed to: ${newSize}, but no relevant viz active or current viz doesn't use it.`);
        }
        if (currentViz) {
            resetVisualization();
        }
    });

    if (!currentViz) {
        vizArea.innerHTML = '<p style="color: var(--text-secondary);">Select a visualization from the sidebar.</p>';
    }


}); // End DOMContentLoaded

// Function to dynamically create and inject the footer
function injectFooter() {
    const mainContentArea = document.getElementById('main-content');
    if (mainContentArea) {
        const footer = document.createElement('footer');
        // Updated innerHTML with spans for styling and links
        footer.innerHTML = `&copy; <span class="footer-ids">1123517 &bull; 1123526 &bull; 1123564</span> &mdash; 
        <a href="https://www.in.yzu.edu.tw/" target="_blank" class="footer-link footer-keyword">IBPI Department</a> 
        <a href="https://www.yzu.edu.tw/index.php/tw/?gad_source=1&gad_campaignid=22442120571&gbraid=0AAAAApN5hKhNLHslwVBXTqYk_Z-ZPx891&gclid=CjwKCAjw87XBBhBIEiwAxP3_A-Xwhvhg9r8fYGuzO3LKFXeoL38fzYjQXZl8IVa5Loc3MRNupDqewxoCiMIQAvD_BwE" target="_blank" class="footer-link footer-keyword">YuanZe University</a>`;
        mainContentArea.appendChild(footer);
    } else {
        console.error("Error: #main-content element not found. Footer not injected.");
    }
}


// --- Helper Function for Resetting ---
async function resetVisualization() {
    console.log(`Resetting visualization: ${currentViz || 'None'}`);

    if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
    }
    isRunning = false;
    isPaused = false;
    currentAlgorithm = null;
    pauseButton.textContent = 'Pause';
    pauseButton.disabled = true;


    removeAllHighlights();
    vizArea.innerHTML = '';
    if (structureInstance && typeof structureInstance.reset === 'function') {
        structureInstance.reset();
    }
    hanoiState = null;

    const vizConfig = visualizations[currentViz];

    if (currentViz && vizConfig) {
        let sizeForInit;
        if (isSizeRelevant(currentViz)) {
            if (vizConfig.currentSize === undefined) {
                 vizConfig.currentSize = parseInt(sizeSlider.value) || getDefaultSizeForViz(currentViz);
            }
            const sliderMin = parseInt(sizeSlider.min);
            const sliderMax = parseInt(sizeSlider.max);
            let currentSizeForViz = parseInt(vizConfig.currentSize);

            if (currentSizeForViz < sliderMin) currentSizeForViz = sliderMin;
            if (currentSizeForViz > sliderMax) currentSizeForViz = sliderMax;

            vizConfig.currentSize = currentSizeForViz;
            sizeSlider.value = vizConfig.currentSize;
            sizeForInit = vizConfig.currentSize;
        } else {
            sizeForInit = undefined;
        }

        console.log(`Initializing ${currentViz} with effective size ${sizeForInit}`);

        if (vizConfig.init && typeof vizConfig.init === 'function') {
            try {
                await vizConfig.init(sizeForInit);
                updateInfo(vizConfig.title, vizConfig.description);
            } catch (error) {
                console.error(`Error during ${currentViz} initialization:`, error);
                updateInfo("Initialization Error", `Failed to initialize ${vizConfig.title || currentViz}. Error: ${error.message}`);
                vizArea.innerHTML = `<p style="color: var(--primary);">Error during initialization.</p>`;
                disableControls(true);
                resetButton.disabled = false;
                startButton.disabled = true;
                return;
            }
        } else {
             console.warn(`No init function found for ${currentViz}`);
             vizArea.innerHTML = `<p style="color: var(--text-secondary);">Select an operation or press Start if available.</p>`;
        }

        disableControls(false);
        startButton.disabled = !(vizConfig.start && typeof vizConfig.start === 'function');
        pauseButton.disabled = true;
        speedSlider.disabled = false;


    } else {
        console.log("No current visualization selected to reset/display.");
        updateInfo("Select a Visualization", "Choose an algorithm or data structure from the sidebar.");
        vizArea.innerHTML = '<p style="color: var(--text-secondary);">Select a visualization from the sidebar.</p>';
        disableControls(false);
        startButton.disabled = true;
        pauseButton.disabled = true;
        speedSlider.disabled = false;
        sizeLabel.style.display = 'none';
        sizeSlider.style.display = 'none';
    }
    console.log("Reset complete.");
}