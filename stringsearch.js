// --- START OF FILE js/visualizations/other/stringsearch.js ---
if (typeof visualizations === 'undefined') {
    console.error("stringsearch.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
}

visualizations.naiveStringSearch = {
    title: "Naive String Search",
    description: "Compares the pattern to every <code>same-length substring</code> via <code>sliding window</code>. Essiential steps: <code>current character</code> comparison (match or mismatch), <code>found</code> if all align.",
    sizeRelevant: false,

    // Default values, will be updated by inputs
    text: "ABABDABACDABABCABAB",
    pattern: "ABABCABAB",

    init: async () => {
        // Properties 'this.text' and 'this.pattern' hold the current values.
        // They are either the defaults or what the user typed before a reset.
        // addControls will ensure the input fields reflect these values.
        visualizations.naiveStringSearch.addControls();

        visualizations.naiveStringSearch.renderSearch(null, null, -1); // Initial render with current/default text & pattern
        updateInfo(visualizations.naiveStringSearch.title, visualizations.naiveStringSearch.description);
        disableControls(false);
        startButton.disabled = false;
        sizeSlider.style.display = 'none';
        sizeLabel.style.display = 'none';
    },

    addControls: () => {
        structureControlsContainer.innerHTML = ''; // Clear previous controls

        const textLabel = document.createElement('label');
        textLabel.textContent = 'Text:';
        textLabel.htmlFor = 'string-search-text';
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = 'string-search-text';
        textInput.value = visualizations.naiveStringSearch.text; // Set input value from property
        textInput.style.width = '200px';
        textInput.setAttribute('aria-label', 'Text to search in');

        textInput.addEventListener('change', () => { // Use 'change' or 'input'
            visualizations.naiveStringSearch.text = textInput.value;
            // If animation is not running, a change implies the user wants to use this new text.
            // We re-render for immediate feedback and then trigger a reset so the next "Start" uses it.
            if (!isRunning) {
                visualizations.naiveStringSearch.renderSearch(null, null, -1);
                resetVisualization(); // This will re-call init()
            }
        });
         textInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                 visualizations.naiveStringSearch.text = textInput.value;
                if (!isRunning) {
                    visualizations.naiveStringSearch.renderSearch(null, null, -1);
                    resetVisualization();
                }
            }
        });


        const patternLabel = document.createElement('label');
        patternLabel.textContent = 'Pattern:';
        patternLabel.htmlFor = 'string-search-pattern';
        const patternInput = document.createElement('input');
        patternInput.type = 'text';
        patternInput.id = 'string-search-pattern';
        patternInput.value = visualizations.naiveStringSearch.pattern; // Set input value from property
        patternInput.style.width = '150px';
        patternInput.setAttribute('aria-label', 'Pattern to search for');

        patternInput.addEventListener('change', () => { // Use 'change' or 'input'
            visualizations.naiveStringSearch.pattern = patternInput.value;
            if (!isRunning) {
                visualizations.naiveStringSearch.renderSearch(null, null, -1);
                resetVisualization();
            }
        });
        patternInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                visualizations.naiveStringSearch.pattern = patternInput.value;
                if (!isRunning) {
                    visualizations.naiveStringSearch.renderSearch(null, null, -1);
                    resetVisualization();
                }
            }
        });

        structureControlsContainer.appendChild(textLabel);
        structureControlsContainer.appendChild(textInput);
        structureControlsContainer.appendChild(patternLabel);
        structureControlsContainer.appendChild(patternInput);
    },

    renderSearch: (textHighlights, patternHighlights, patternStartInText) => {
        vizArea.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'stringsearch-visualization-container string-search-container'; // Added 'stringsearch-visualization-container'

        const text = visualizations.naiveStringSearch.text;
        const pattern = visualizations.naiveStringSearch.pattern;

        // Render Text Line
        const textLine = document.createElement('div');
        textLine.className = 'string-text-line';
        for (let i = 0; i < text.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'string-char';
            charSpan.textContent = text[i];
            charSpan.id = `text-char-${i}`;
            if (textHighlights && textHighlights[i]) {
                charSpan.classList.add(textHighlights[i]);
            }
            textLine.appendChild(charSpan);
        }
        container.appendChild(textLine);

        // Render Pattern Line (aligned with current text comparison window)
        if (patternStartInText >= 0 && patternStartInText <= text.length - pattern.length) {
            const patternLine = document.createElement('div');
            patternLine.className = 'string-pattern-line';
            // Ensure alignment calculation is reasonable
            const approxCharWidth = 20; // Match the min-width in CSS
            const approxCharMargin = 2; // Match margin: 0 1px;
            patternLine.style.paddingLeft = `${patternStartInText * (approxCharWidth + approxCharMargin)}px`;
    
            for (let j = 0; j < pattern.length; j++) {
                const charSpan = document.createElement('span');
                charSpan.className = 'string-char pattern-char'; // Base classes
                charSpan.textContent = pattern[j];
                charSpan.id = `pattern-char-${j}`; // Unique ID for pattern char
    
                // --- THIS IS THE KEY PART ---
                if (patternHighlights && patternHighlights[j]) {
                    // Apply the highlight class passed in patternHighlights
                    charSpan.classList.add(patternHighlights[j]); // e.g., 'comparing-char', 'match', 'mismatch'
                }
                // --- END KEY PART ---
    
                patternLine.appendChild(charSpan);
            }
            container.appendChild(patternLine);
        } else if (patternStartInText === -1) { // Initial render or before start
             const patternLine = document.createElement('div');
             patternLine.className = 'string-pattern-line';
             for (let j = 0; j < pattern.length; j++) {
                 const charSpan = document.createElement('span');
                 charSpan.className = 'string-char pattern-char';
                 charSpan.textContent = pattern[j];
                 patternLine.appendChild(charSpan);
             }
             const pLabel = document.createElement('p');
             pLabel.style.textAlign = 'left';
             pLabel.style.fontSize = '0.9em';
             pLabel.innerHTML = `Pattern to search: `;
             pLabel.appendChild(patternLine);
             container.appendChild(pLabel);
        }


        vizArea.appendChild(container);
    },


    start: async function*() {
        const text = visualizations.naiveStringSearch.text;
        const pattern = visualizations.naiveStringSearch.pattern;
        const n = text.length;
        const m = pattern.length;
        let foundIndices = [];
        let textHighlights = {}; // Persistent highlights (like 'found')
    
        if (m === 0 || n === 0 || m > n) {
             updateInfo("String Search", "Pattern is empty, text is empty, or pattern is longer than text. Cannot search.");
             visualizations.naiveStringSearch.renderSearch({}, {}, -2);
             disableControls(false); pauseButton.disabled = true;
             return;
         }
    
        updateInfo("Naive String Search Running", `Searching for "${pattern}" in "${text}"...`);
        visualizations.naiveStringSearch.renderSearch({}, {}, -1); // Initial state
        yield await sleep(getDelay());
    
        // --- Outer loop: Iterate through possible start positions in text ---
        for (let i = 0; i <= n - m; i++) {
            let match = true;
            let currentWindowTextHighlights = { ...textHighlights }; // Copy persistent 'found' highlights
            let currentPatternHighlights = {};
    
            // -- Step 1: Highlight Current Text Window & Align Pattern --
            updateInfo(null, `Checking text window starting at index ${i}.`);
            // Add a 'special' highlight to the text window being checked
            for (let k = 0; k < m; k++) {
                // Only apply 'special' if not already 'found'
                if (currentWindowTextHighlights[i + k] !== 'found') {
                     currentWindowTextHighlights[i + k] = 'special'; // Use 'special' class for window highlight
                }
            }
            visualizations.naiveStringSearch.renderSearch(currentWindowTextHighlights, {}, i); // Render window highlight and aligned pattern
            yield await sleep(getDelay()); // Pause to show the window
    
            // --- Inner loop: Compare pattern characters ---
            for (let j = 0; j < m; j++) {
                // Reset comparison highlights for this step, keep window highlight & previous matches/mismatches in this window
                let stepTextHighlights = { ...currentWindowTextHighlights };
                let stepPatternHighlights = { ...currentPatternHighlights };
    
                // Override the 'special' window highlight with 'comparing-char' for the specific text char
                stepTextHighlights[i + j] = 'comparing-char';
                stepPatternHighlights[j] = 'comparing-char';   // Highlight pattern char being compared
    
                updateInfo(null, `Comparing text[${i + j}] ('${text[i + j]}') with pattern[${j}] ('${pattern[j]}')`);
                visualizations.naiveStringSearch.renderSearch(stepTextHighlights, stepPatternHighlights, i);
                yield await sleep(getDelay()); // Pause to show comparison
    
                // Perform Comparison and Show Result
                if (text[i + j] === pattern[j]) {
                    // Match! Update persistent state for this window
                    currentWindowTextHighlights[i + j] = 'match'; // Override 'special' or 'comparing' with 'match'
                    currentPatternHighlights[j] = 'match';
                    updateInfo(null, `Match: text[${i + j}] == pattern[${j}] ('${text[i + j]}')`);
                    // Render showing the match
                    visualizations.naiveStringSearch.renderSearch(currentWindowTextHighlights, currentPatternHighlights, i);
                    yield await sleep(getDelay() / 1.5);
                } else {
                    // Mismatch!
                    match = false;
                    currentWindowTextHighlights[i + j] = 'mismatch'; // Override 'special' or 'comparing' with 'mismatch'
                    currentPatternHighlights[j] = 'mismatch';
                    updateInfo(null, `Mismatch: text[${i + j}] ('${text[i + j]}') != pattern[${j}] ('${pattern[j]}')`);
                    // Render showing the mismatch
                    visualizations.naiveStringSearch.renderSearch(currentWindowTextHighlights, currentPatternHighlights, i);
                    yield await sleep(getDelay() * 1.2);
                    break; // Exit inner loop (j)
                }
            } // --- End Inner loop ---
    
            // Handle Full Match Found
            if (match) {
                foundIndices.push(i);
                updateInfo(null, `Pattern found starting at index ${i}!`);
                // Apply 'found' highlight persistently, potentially overriding 'match' from this window
                for (let k = 0; k < m; k++) {
                    textHighlights[i + k] = 'found'; // Use the main textHighlights for persistence
                }
                // Re-render showing the 'found' highlight
                visualizations.naiveStringSearch.renderSearch(textHighlights, {}, i); // Show text highlighted, pattern still aligned
                yield await sleep(getDelay() * 2.5);
            } else {
                // If no match for this window, just pause briefly before shifting the window
                 yield await sleep(getDelay() / 2);
            }
    
            // Before next iteration of outer loop, clear window-specific highlights ('special', 'match', 'mismatch')
            // leaving only persistent 'found' highlights
             visualizations.naiveStringSearch.renderSearch(textHighlights, {}, -2); // Render only text with 'found', hide pattern
             yield await sleep(getDelay() / 3); // Brief pause before next window alignment
    
    
        } // --- End Outer loop ---
    
        // Final Result
        removeAllHighlights('.stringsearch-visualization-container', 'comparing-char', 'match', 'mismatch', 'special'); // Clean up temps
        if (foundIndices.length > 0) {
            updateInfo("Naive String Search Complete", `Pattern found at indices: ${foundIndices.join(', ')}.`);
            visualizations.naiveStringSearch.renderSearch(textHighlights, {}, -2);
        } else {
            updateInfo("Naive String Search Complete", "Pattern not found in the text.");
            visualizations.naiveStringSearch.renderSearch({}, {}, -2);
        }
    
        disableControls(false);
        pauseButton.disabled = true;
    },
};