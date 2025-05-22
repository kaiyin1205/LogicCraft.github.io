if (typeof visualizations === 'undefined') {
    console.error("hanoi.js: 'visualizations' object not found. Ensure dom-setup.js is loaded first.");
}

visualizations.towerOfHanoi = {
    title: "Tower of Hanoi",
    description: "A puzzle with <code>three rods</code> and <code>ascending-sized disks</code>. Goal: Move the entire stack to another rod using <code>single-disk moves</code> and <code>no larger-on-smaller</code> placement.",
    sizeRelevant: true,
    minDisks: 2, 
    maxDisks: 7, 

    init: async function(numDisksParam) { 
        let numDisks = numDisksParam; 

        if (numDisks < this.minDisks) numDisks = this.minDisks;
        if (numDisks > this.maxDisks) {
            numDisks = this.maxDisks;
            console.warn(`Hanoi: Number of disks limited to ${this.maxDisks} for performance.`);
        }

        this.currentSize = numDisks; 

        hanoiState = {
            rods: [[], [], []],
            numDisks: numDisks, 
            moves: [],
            moveCount: 0
        };

        for (let i = numDisks; i >= 1; i--) {
            hanoiState.rods[0].push(i);
        }

        this.renderHanoi(); 
        updateInfo(this.title, this.description + `<br>Initialized with ${numDisks} disks.`);
        disableControls(false);
        startButton.disabled = false;

        sizeSlider.style.display = 'inline-block'; 
        sizeLabel.style.display = 'inline-block';

        this.updateComplexityDisplay();
    },

    updateComplexityDisplay: function() {
        let complexityDisplay = document.getElementById('hanoi-complexity-display');
        if (!complexityDisplay) {
            complexityDisplay = document.createElement('div');
            complexityDisplay.id = 'hanoi-complexity-display';
            complexityDisplay.className = 'hanoi-complexity';

            const structureControlsContainer = document.getElementById('structure-controls'); // 或根據你HTML實際ID
            if (structureControlsContainer) {
                structureControlsContainer.appendChild(complexityDisplay);
            } else {
            vizArea.appendChild(complexityDisplay); // fallback
            }

        }

        const n = this.currentSize || hanoiState?.numDisks || 3;
        const complexity = Math.pow(2, n) - 1;
        const currentMoves = hanoiState?.moveCount || 0;
        complexityDisplay.innerHTML = `
            &nbsp;&nbsp;&nbsp;Time Complexity Formula: T(${n}) = 2<sup>${n}</sup> - 1 = ${complexity}
            <br>&nbsp;&nbsp;&nbsp;Current Moves: ${currentMoves} / ${complexity}
        `;
    },

    renderHanoi: () => { 
        vizArea.innerHTML = ''; 
        const container = document.createElement('div');
        container.className = 'hanoi-visualization-container hanoi-container';

        const rodNames = ['A', 'B', 'C'];

        hanoiState.rods.forEach((rodDisks, rodIndex) => {
            const rodWrapper = document.createElement('div');
            rodWrapper.className = 'hanoi-rod-wrapper';

            const rodEl = document.createElement('div');
            rodEl.className = 'hanoi-rod';
            rodEl.id = `rod-${rodIndex}`;

            const rodBase = document.createElement('div');
            rodBase.className = 'hanoi-base';
            rodEl.appendChild(rodBase);

            rodDisks.forEach((diskSize, diskIndexInRod) => {
                const diskEl = document.createElement('div');
                diskEl.className = 'hanoi-disk';
                diskEl.dataset.size = diskSize;
                diskEl.id = `disk-${diskSize}`;
                diskEl.textContent = diskSize;

                const diskHeight = 20; 
                const diskMargin = 2;  
                diskEl.style.bottom = `${diskIndexInRod * (diskHeight + diskMargin)}px`;
                rodEl.appendChild(diskEl);
            });
            
            rodWrapper.appendChild(rodEl);

            const rodNameEl = document.createElement('div');
            rodNameEl.className = 'hanoi-rod-name';
            rodNameEl.textContent = rodNames[rodIndex];
            rodWrapper.appendChild(rodNameEl);

            container.appendChild(rodWrapper);
        });
        vizArea.appendChild(container);
    },

    _generateMoves: function(n, source, auxiliary, target) { 
        if (n > 0) {
            this._generateMoves(n - 1, source, target, auxiliary);
            hanoiState.moves.push({ disk: n, from: source, to: target });
            this._generateMoves(n - 1, auxiliary, source, target);
        }
    },

    start: async function*() {
        hanoiState.moves = [];
        hanoiState.moveCount = 0;
        this._generateMoves(hanoiState.numDisks, 0, 1, 2);

        updateInfo(this.title, `Moving ${hanoiState.numDisks} disks...`);
        this.updateComplexityDisplay();

        const diskHeight = 20; 
        const diskMargin = 2;  

        for (const move of hanoiState.moves) {
            const { disk: diskValueToMove, from: fromRodIndex, to: toRodIndex } = move;
            const poppedDiskValue = hanoiState.rods[fromRodIndex].pop();

            if (poppedDiskValue !== diskValueToMove) {
                console.error(`Data mismatch: Expected to pop disk ${diskValueToMove}, but popped ${poppedDiskValue} from rod ${fromRodIndex}`);
                updateInfo("Hanoi Error", "Internal error during disk move. Please reset.");
                return; 
            }

            hanoiState.moveCount++;
            this.updateComplexityDisplay();

            const diskElement = document.getElementById(`disk-${diskValueToMove}`);
            if (!diskElement) {
                console.error("Disk element not found for move:", move);
                continue;
            }

            const sourceRodElement = document.getElementById(`rod-${fromRodIndex}`);
            const targetRodElement = document.getElementById(`rod-${toRodIndex}`);

            if (!sourceRodElement || !targetRodElement) {
                console.error("Source or target rod element not found for move:", move);
                continue;
            }

            const sourceRodWrapper = sourceRodElement.parentElement;
            const targetRodWrapper = targetRodElement.parentElement;

            const liftOffset = 30;
            if (diskElement.parentElement !== sourceRodElement) {
                 sourceRodElement.appendChild(diskElement);
            }
            diskElement.style.bottom = `${sourceRodElement.offsetHeight + liftOffset}px`;
            highlightElement(diskElement, 'swapping', getDelay() * 3);
            updateInfo(null, `Lifting disk ${diskValueToMove} from Rod ${String.fromCharCode(65 + fromRodIndex)}`);
            yield await sleep(getDelay());

            const sourceRodRect = sourceRodWrapper.getBoundingClientRect();
            const targetRodRect = targetRodWrapper.getBoundingClientRect();
            
            const horizontalShift = (targetRodRect.left + targetRodRect.width / 2) - 
                                    (sourceRodRect.left + sourceRodRect.width / 2);

            diskElement.style.transform = `translateX(calc(-50% + ${horizontalShift}px))`;
            updateInfo(null, `Moving disk ${diskValueToMove} to above Rod ${String.fromCharCode(65 + toRodIndex)}`);
            yield await sleep(getDelay());
            
            targetRodElement.appendChild(diskElement);
            diskElement.style.transform = 'translateX(-50%)';

            hanoiState.rods[toRodIndex].push(diskValueToMove);
            const targetDiskStackHeight = (hanoiState.rods[toRodIndex].length - 1) * (diskHeight + diskMargin);
            diskElement.style.bottom = `${targetDiskStackHeight}px`;

            updateInfo(null, `Placing disk ${diskValueToMove} onto Rod ${String.fromCharCode(65 + toRodIndex)}`);
            yield await sleep(getDelay());

            setElementClass(diskElement, 'swapping', false);
        }

        updateInfo(this.title, `All ${hanoiState.numDisks} disks moved successfully in ${hanoiState.moveCount} moves.`);
    },

    finish: async function() { 
        updateInfo(this.title, "Tower of Hanoi finished."); 
        this.updateComplexityDisplay();
        disableControls(false);
        if (pauseButton) {
            pauseButton.disabled = true;
            pauseButton.textContent = 'Pause';
        }
    }
};