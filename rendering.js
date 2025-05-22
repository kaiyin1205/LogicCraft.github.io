// --- START OF FILE js/rendering.js ---

// --- Highlighting Elements ---

/**
 * Adds a temporary highlight class to an element.
 * @param {HTMLElement} element - The DOM element to highlight.
 * @param {string} className - The CSS class name to add for highlighting.
 * @param {number} duration - How long the highlight should last in ms. Defaults to animation speed.
 */
function highlightElement(element, className, duration = getDelay() / 1.5) {
    if (!element) return;
    element.classList.add(className);
    if (duration > 0) {
        // Use a timeout specific to this element to remove the class
        setTimeout(() => {
            // Check if element still exists and has the class before removing
            if (element && element.parentNode && element.classList.contains(className)) {
                element.classList.remove(className);
            }
        }, duration);
    }
}

/**
 * Sets or removes a persistent highlight class on an element.
 * @param {HTMLElement} element - The DOM element.
 * @param {string} className - The CSS class name.
 * @param {boolean} active - True to add the class, false to remove it.
 */
function setElementClass(element, className, active = true) {
    if (!element) return;
    element.classList.toggle(className, active);
}

/**
 * Removes specified highlight classes from elements within a container.
 * @param {string} containerSelector - CSS selector for the container (e.g., '#visualization-area').
 * @param {...string} classes - Optional list of specific classes to remove. If empty, removes default highlight classes.
 */
function removeAllHighlights(containerSelector = '#visualization-area', ...classes) {
    const defaultClasses = ['comparing', 'swapping', 'special', 'traversing', 'target', 'processing', 'pivot', 'match', 'mismatch', 'comparing-char', 'found', 'visited', 'sorted']; // Added 'sorted' and 'visited'
    const allClasses = classes.length > 0 ? classes : defaultClasses;

    try {
        // Select elements that can have these highlights
        const elements = document.querySelectorAll(`${containerSelector} .viz-element, ${containerSelector} .string-char, ${containerSelector} .node, ${containerSelector} .bar, ${containerSelector} .ll-node, ${containerSelector} .stack-element, ${containerSelector} .queue-element, ${containerSelector} .hashtable-item`);
        elements.forEach(el => {
            el.classList.remove(...allClasses);
        });

        // Also reset edge highlights if applicable
        const edges = document.querySelectorAll(`${containerSelector} .edge`);
        edges.forEach(edge => edge.classList.remove('edge-traversed', 'edge-path'));

    } catch (error) {
        console.error("Error removing highlights:", error);
    }
}


// --- Basic Visual Renders ---

/**
 * Renders bars in the visualization area based on the provided data array.
 * Handles creation, styling, and applying highlight classes to bars.
 * @param {number[]} array - The array of numbers to render as bars.
 * @param {object} highlights - An object indicating which indices to highlight and how.
 *                              Example: { comparing: [0, 1], swapping: [], sorted: [5, 6], special: [3], pivot: [4] }
 */
function renderBars(array, highlights = {}) {
    // Ensure vizArea is accessible (defined in dom-setup.js)
    if (!vizArea) {
        console.error("renderBars: vizArea element not found or not accessible!");
        return;
    }
    if (!Array.isArray(array)) {
         console.error("renderBars: Input 'array' is not a valid array!");
         vizArea.innerHTML = `<p style="color: var(--primary);">Invalid data for rendering bars.</p>`;
         return;
    }


    vizArea.innerHTML = ''; // Clear previous bars efficiently

    // Handle empty array case
     if (array.length === 0) {
         vizArea.innerHTML = '<p style="color: var(--text-secondary);">No data to display.</p>';
         return;
     }

     
    const maxValue = Math.max(...array, 1); // Find max value (at least 1 to avoid division by zero)
    const containerHeight = vizArea.clientHeight - 30; // Use clientHeight which reflects actual display height, leave 30px padding bottom
    const containerWidth = vizArea.clientWidth - 20;   // Leave 10px padding left/right total


    // --- Dynamic Bar Width and Gap Calculation ---
    let barWidth, gap;
    const minGap = 1;
    const maxGap = 5;
    const minBarWidth = 3;

    // Calculate width based on number of elements
    const availableWidthPerBar = containerWidth / array.length;

    if (availableWidthPerBar < (minBarWidth + minGap)) {
        // If too crowded, prioritize minimum bar width and minimal gap
        barWidth = minBarWidth;
        gap = minGap;
         console.warn("renderBars: Bars may be too crowded. Reducing gap.");
    } else {
         // Calculate gap as a percentage of available width, clamped
         gap = Math.max(minGap, Math.min(maxGap, availableWidthPerBar * 0.2)); // ~20% for gap, clamped
         barWidth = availableWidthPerBar - gap;
    }
    // --- End Calculation ---


    // Create a container for flex alignment (optional but helpful)
    const barContainer = document.createElement('div');
    barContainer.style.display = 'flex';
    barContainer.style.alignItems = 'flex-end'; // Align bars to the bottom
    barContainer.style.justifyContent = 'center'; // Center the group of bars
    barContainer.style.width = '100%';
    barContainer.style.height = '100%';
    barContainer.style.gap = `${gap}px`; // Use flex gap for spacing


    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar', 'viz-element'); // Base classes
        bar.dataset.value = value; // Store value
        bar.dataset.id = `bar-${index}`; // Unique ID


        // Calculate proportional height (ensure minimum height for visibility)
        const barHeight = Math.max(5, (value / maxValue) * containerHeight);
        bar.style.height = `${barHeight}px`;
        bar.style.width = `${barWidth}px`;
        // bar.style.margin = `0 ${gap / 2}px`; // No longer needed if using flex gap

        // Add value text (optional - style with .bar-value in CSS if needed)
         if (barWidth > 15) { // Only show value if bar is wide enough
             const valueText = document.createElement('span');
             valueText.classList.add('bar-value'); // Add this class for styling
             valueText.textContent = value;
             bar.appendChild(valueText);
             // Adjust CSS for .bar-value to position it correctly (e.g., absolute bottom)
         }

        // --- Apply Highlights ---
        // Check if each highlight type exists and if the current index is included
        if (highlights.comparing?.includes(index)) bar.classList.add('comparing');
        if (highlights.swapping?.includes(index)) bar.classList.add('swapping');
        if (highlights.sorted?.includes(index)) bar.classList.add('sorted');
        if (highlights.special?.includes(index)) bar.classList.add('special');
        if (highlights.pivot?.includes(index)) bar.classList.add('pivot');
        if (highlights.target?.includes(index)) bar.classList.add('target');
        if (highlights.visited?.includes(index)) bar.classList.add('visited');
        // Add checks for other highlight types (match, mismatch, etc.) if used by sorting/searching

        barContainer.appendChild(bar); // Append bar to the container
    });

    vizArea.appendChild(barContainer); // Append the container to the main visualization area
}

