// --- START OF FILE js/visualizations/other/sudoku.js ---
if (typeof visualizations === 'undefined') {
    console.error("sudoku.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
}

visualizations.sudokuSolver = {
    title: "Sudoku Solver (Backtracking)",
    description: "Uses backtracking to fill Sudoku cells: <code>fixed</code> (initial numbers), <code>current</code> (cell being tested), <code>placed</code> (valid number placed), <code>backtrack</code> (cell where backtrack occurs).",
    sizeRelevant: false,

    // --- Data ---
    exampleBoards: [
        [ // Board 1 (Original) - A moderately difficult one
            [0, 0, 0, 2, 6, 0, 7, 0, 1],
            [6, 8, 0, 0, 7, 0, 0, 9, 0],
            [1, 9, 0, 0, 0, 4, 5, 0, 0],
            [8, 2, 0, 1, 0, 0, 0, 4, 0],
            [0, 0, 4, 6, 0, 2, 9, 0, 0],
            [0, 5, 0, 0, 0, 3, 0, 2, 8],
            [0, 0, 9, 3, 0, 0, 0, 7, 4],
            [0, 4, 0, 0, 5, 0, 0, 3, 6],
            [7, 0, 3, 0, 1, 8, 0, 0, 0],
        ],
        [ // Board 2 (Easier)
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9],
        ],
        [ // Board 3 (Harder - "World's Hardest Sudoku" by Arto Inkala variant)
            [8, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 3, 6, 0, 0, 0, 0, 0],
            [0, 7, 0, 0, 9, 0, 2, 0, 0],
            [0, 5, 0, 0, 0, 7, 0, 0, 0],
            [0, 0, 0, 0, 4, 5, 7, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 3, 0],
            [0, 0, 1, 0, 0, 0, 0, 6, 8],
            [0, 0, 8, 5, 0, 0, 0, 1, 0],
            [0, 9, 0, 0, 0, 0, 4, 0, 0],
        ]
    ],

    currentBoardIndex: 0,
    initialBoard: [],
    board: [],

    _sudokuStylesApplied: false, // Flag to ensure styles are applied only once
    
    _applySudokuStyles: () => {
        if (visualizations.sudokuSolver._sudokuStylesApplied) {
            return; // Styles already applied
        }

        const styleId = 'sudoku-visualization-styles';
        if (document.getElementById(styleId)) {
            visualizations.sudokuSolver._sudokuStylesApplied = true; // Mark as applied if found (e.g. from previous load)
            return; // Style tag already exists
        }

        const css = `
            #structure-controls #sudoku-board-selector {
                padding: 8px 12px;
                background-color: var(--bg-dark, #16213e); /* Fallback if CSS var not loaded yet */
                border: 1px solid var(--tertiary, #9d65c9);
                color: var(--text-primary, #e0fbfc);
                border-radius: 5px;
                font-size: 0.95em;
                font-weight: 500;
                cursor: pointer;
                transition: border-color 0.2s ease, background-color 0.2s ease;
                outline: none;
                min-width: 120px;
                margin-left: 5px; /* Add some space from the label */
            }

            #structure-controls #sudoku-board-selector:hover {
                border-color: var(--secondary, #53d8fb);
            }

            #structure-controls #sudoku-board-selector:focus {
                border-color: var(--primary, #e94560);
                box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.3); /* Using common primary color RGB for fallback */
            }

            /* Styling for the label next to the select for consistency */
            #structure-controls label[for="sudoku-board-selector"] {
                color: var(--text-secondary, #a7c0cd);
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                margin-right: 3px; /* Reduced margin as select has margin-left */
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.type = 'text/css';
        styleElement.appendChild(document.createTextNode(css));
        document.head.appendChild(styleElement);

        visualizations.sudokuSolver._sudokuStylesApplied = true;
    },


    // --- Initialization ---
    init: async () => {
        // Apply styles if not already done
        visualizations.sudokuSolver._applySudokuStyles(); // <<< CALL THE NEW FUNCTION

        const selectedBoardData = visualizations.sudokuSolver.exampleBoards[visualizations.sudokuSolver.currentBoardIndex];
        visualizations.sudokuSolver.initialBoard = selectedBoardData.map(row => [...row]);
        visualizations.sudokuSolver.board = selectedBoardData.map(row => [...row]);

        visualizations.sudokuSolver.addControls();
        visualizations.sudokuSolver.renderBoard();
        updateInfo(visualizations.sudokuSolver.title, visualizations.sudokuSolver.description);
        disableControls(false);
        startButton.disabled = false;
        sizeSlider.style.display = 'none';
        sizeLabel.style.display = 'none';
    },

    addControls: () => {
        structureControlsContainer.innerHTML = '';

        const label = document.createElement('label');
        label.htmlFor = 'sudoku-board-selector';
        label.textContent = 'Select Board:'; // Removed trailing space, CSS will handle spacing
        // label.style.marginRight = '5px'; // Let CSS handle this

        const select = document.createElement('select');
        select.id = 'sudoku-board-selector';
        select.setAttribute('aria-label', 'Select Sudoku example board');

        visualizations.sudokuSolver.exampleBoards.forEach((_, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Example ${index + 1}`;
            if (index === visualizations.sudokuSolver.currentBoardIndex) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            visualizations.sudokuSolver.currentBoardIndex = parseInt(select.value);
            if (!isRunning) {
                resetVisualization();
            } else {
                updateInfo(null, "Board selection changed. Please Reset the visualization to apply the new board.");
            }
        });

        structureControlsContainer.appendChild(label);
        structureControlsContainer.appendChild(select);
    },

    // --- Rendering ---
    renderBoard: (highlightRow = -1, highlightCol = -1, highlightClass = '') => {
        // Ensure the visualization area reference is valid
        if (!vizArea) {
            console.error("renderBoard: vizArea not found!");
            return;
        }
        vizArea.innerHTML = ''; // Clear previous rendering efficiently

        const table = document.createElement('table');
        // Add classes for CSS styling (ensure CSS targets these)
        table.className = 'sudoku-visualization-container sudoku-board';

        // Get the current state of the board
        const currentBoard = visualizations.sudokuSolver.board;

        // Create table rows and cells
        for (let i = 0; i < 9; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < 9; j++) {
                const td = document.createElement('td');
                // Add base classes and unique ID
                td.className = 'sudoku-cell viz-element';
                td.id = `cell-${i}-${j}`;

                // Get the value from the working board
                const val = currentBoard[i][j];
                // Display the number, or empty string for 0
                td.textContent = val === 0 ? '' : val;

                // Add class if the number was part of the initial puzzle
                if (visualizations.sudokuSolver.initialBoard[i][j] !== 0) {
                    td.classList.add('sudoku-fixed');
                }

                // Apply highlight class if this cell is being highlighted
                if (i === highlightRow && j === highlightCol && highlightClass) {
                    td.classList.add(highlightClass);
                }

                // Add classes for thicker subgrid borders (CSS handles the styling)
                if (i === 2 || i === 5) td.classList.add('border-bottom');
                if (j === 2 || j === 5) td.classList.add('border-right');

                tr.appendChild(td); // Add cell to row
            }
            table.appendChild(tr); // Add row to table
        }
        vizArea.appendChild(table); // Add table to the visualization area
    },

    // --- Helper Functions ---
    _findEmpty: (board) => { // Finds the next empty cell (value 0)
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) {
                    return [r, c]; // Return [row, column]
                }
            }
        }
        return null; // No empty cells found
    },

    _isValid: (board, num, row, col) => { // Checks if placing 'num' at (row, col) is valid
        // Check Row Constraint
        for (let c = 0; c < 9; c++) {
            // If number exists in the row (and it's not the cell we're checking)
            if (board[row][c] === num && c !== col) return false;
        }
        // Check Column Constraint
        for (let r = 0; r < 9; r++) {
            // If number exists in the column (and it's not the cell we're checking)
            if (board[r][col] === num && r !== row) return false;
        }
        // Check 3x3 Subgrid Constraint
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                // If number exists in the subgrid (and it's not the cell we're checking)
                if (board[startRow + r][startCol + c] === num && (startRow + r !== row || startCol + c !== col)) {
                    return false;
                }
            }
        }
        // If all checks pass, the placement is valid
        return true;
    },

    // --- Main Algorithm Execution ---
    start: async function*() {
        const board = visualizations.sudokuSolver.board; // Use the working board
        // Get the generator function for the recursive solver
        let solveGenerator = visualizations.sudokuSolver._solveRecursive(board);

        // Execute the generator step-by-step
        let result = await solveGenerator.next();
        while (!result.done) { // While the generator hasn't finished
            yield; // Yield control back to the animation loop (allows pause/speed change)
            result = await solveGenerator.next(); // Continue to the next step
        }

        // Generator finished, check the final result
        if (result.value) { // 'true' means solved
            updateInfo("Sudoku Solver Complete", "Sudoku solved successfully!");
            visualizations.sudokuSolver.renderBoard(); // Render the final solved board
            // Optional: Add a final "solved" highlight to non-fixed cells
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (visualizations.sudokuSolver.initialBoard[r][c] === 0 && board[r][c] !== 0) {
                        const cellEl = document.getElementById(`cell-${r}-${c}`);
                        if (cellEl) highlightElement(cellEl, 'sorted', getDelay() * 20); // Use 'sorted' class for visual feedback
                    }
                }
            }
        } else { // 'false' means no solution
            updateInfo("Sudoku Solver Complete", "No solution found for this Sudoku.");
             visualizations.sudokuSolver.renderBoard(); // Render the board in its final (unsolved) state
        }

        // Re-enable controls after completion
        disableControls(false);
        pauseButton.disabled = true; // Can't pause a finished algorithm
    },

    // --- Recursive Backtracking Solver (Generator Function) ---
    _solveRecursive: async function*(board) {
        // Find the next empty cell to process
        const find = visualizations.sudokuSolver._findEmpty(board);
        let row, col;

        if (!find) {
            return true; // Base Case: No empty cells left, puzzle is solved!
        } else {
            [row, col] = find; // Get coordinates of the empty cell
        }

        // --- Highlight the current cell being focused on ---
        updateInfo(null, `Trying cell (${row + 1},${col + 1}).`);
        visualizations.sudokuSolver.renderBoard(row, col, 'sudoku-current'); // Highlight with 'current' class
        yield await sleep(getDelay()); // PAUSE 1: Show which cell is being processed

        // --- Try placing numbers 1 through 9 ---
        for (let num = 1; num <= 9; num++) {
            updateInfo(null, `Trying number ${num} for cell (${row + 1},${col + 1})...`);
            // yield await sleep(getDelay() / 4); // Optional tiny pause to see which number is tried

            // Check if the current number is valid according to Sudoku rules
            if (visualizations.sudokuSolver._isValid(board, num, row, col)) {

                // --- Valid Number Found: Place it and Recurse ---
                board[row][col] = num; // Place the valid number in the board data
                updateInfo(null, `Placed valid number ${num} at (${row + 1},${col + 1}).`);
                visualizations.sudokuSolver.renderBoard(row, col, 'sudoku-placed'); // Render with 'placed' highlight
                yield await sleep(getDelay()); // PAUSE 2: Show the successful placement

                // --- Recursive Call ---
                // Call the solver for the next empty cell with the updated board
                let solveNextGenerator = visualizations.sudokuSolver._solveRecursive(board);
                let step = await solveNextGenerator.next();
                // Propagate yields from the deeper recursive calls
                while (!step.done) {
                    yield;
                    step = await solveNextGenerator.next();
                }

                // --- Check Recursive Result ---
                if (step.value) {
                    // If the recursive call returned 'true', a solution was found down that path.
                    // Propagate 'true' up the call stack.
                    return true;
                }

                // --- Backtrack: Recursive call failed ---
                // If the recursive call returned 'false', the placed number 'num' didn't lead to a solution.
                board[row][col] = 0; // Undo the placement (reset cell to 0)
                updateInfo(null, `Backtracking from (${row + 1},${col + 1}). Removing ${num}.`);
                // Render the board showing the backtrack highlight on the now empty cell
                visualizations.sudokuSolver.renderBoard(row, col, 'sudoku-backtrack');
                yield await sleep(getDelay()); // PAUSE 3: Show the backtrack step clearly

                // Let the 'backtrack' highlight remain until the next number is attempted in the loop.
                // No yield/render needed here specifically before the next 'num'.

            } else {
                // --- Invalid Number ---
                // Optionally add a very brief pause or visual cue for invalid tries,
                // but often skipped to keep the animation less cluttered.
                // updateInfo(null, `Number ${num} invalid for cell (${row + 1},${col + 1}).`);
                // yield await sleep(getDelay()/5);
            }
        } // --- End of trying numbers 1-9 for this cell ---

        // --- No number worked for this cell ---
        // If the loop finishes, none of the numbers 1-9 were valid or led to a solution.
        updateInfo(null, `No valid number works for (${row + 1},${col + 1}). Backtracking further up.`);
        // Render the board with this cell empty and *no* specific highlight for it,
        // indicating failure for this cell before returning to the previous call stack frame.
        visualizations.sudokuSolver.renderBoard();
        yield await sleep(getDelay()); // PAUSE 4: Show the cell reverted to empty before propagating failure.
        return false; // Trigger backtrack in the calling function.
    }, // <<< End of _solveRecursive function body

    // --- Finish Function (Optional Cleanup) ---
    finish: async() => {
        // Called automatically by animation control when generator is done,
        // primarily to ensure controls are re-enabled.
        disableControls(false);
        pauseButton.disabled = true;
        // You could add a final "solved" state confirmation here if needed,
        // but the 'start' function already handles rendering the final board.
    }
};
// --- END OF FILE js/visualizations/other/sudoku.js ---