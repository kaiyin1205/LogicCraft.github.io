// --- Animation Control ---
async function runStep() {
    // Check if we should even be running (e.g., after a reset but before start)
    if (!isRunning || !currentAlgorithm) { // MODIFIED: More robust check
        if (animationTimeoutId) clearTimeout(animationTimeoutId);
        return;
    }

    if (isPaused) { // ADDED: Explicit pause check at the start
        if (animationTimeoutId) clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
        return;
    }

    try {
        const { done } = await currentAlgorithm.next();

        if (done) {
            isRunning = false;
            // isPaused = false; // No change needed for isPaused if it reached here
            console.log("Algorithm finished.");
            if (animationTimeoutId) clearTimeout(animationTimeoutId); // ADDED: Clear timeout
            animationTimeoutId = null;                               // ADDED: Nullify

            if (visualizations[currentViz]?.finish) {
                await visualizations[currentViz].finish();
            } else {
                disableControls(false);
                pauseButton.disabled = true;
                pauseButton.textContent = 'Pause'; // ADDED: Reset button text
            }
            return;
        }
        // If not done, schedule the next step
        animationTimeoutId = setTimeout(runStep, getDelay()); // NO CHANGE in this line's concept, but its timing is now after 'done' check
    } catch (error) {
        console.error("Error during step:", error);
        if (animationTimeoutId) clearTimeout(animationTimeoutId); // ADDED: Clear timeout
        animationTimeoutId = null;                               // ADDED: Nullify
        isRunning = false;
        isPaused = false; // MODIFIED: Ensure reset on error
        disableControls(false);
        pauseButton.textContent = 'Pause'; // ADDED: Reset button text
        pauseButton.disabled = true;      // ADDED: Disable on error
        updateInfo("Error", `Runtime Error: ${error.message}. Please Reset.`);
    }
}

function getDelay() {
    const maxDelay = 1010;
    const minDelay = 10;
    const currentSpeed = typeof animationSpeed === 'string' ? parseInt(animationSpeed) : animationSpeed;
    const validSpeed = isNaN(currentSpeed) ? 400 : currentSpeed;
    return maxDelay - validSpeed;
}

async function startAnimation(algorithmGenerator = null) {
    if (isRunning && !isPaused) { // MODIFIED: Check for not paused
        console.warn("Animation already running.");
        return;
    }
    if (isPaused) { // ADDED: Handle case where it's paused
        console.log("Animation is paused. Please resume or reset.");
        return;
    }

    // ... (algorithm selection logic remains similar) ...
    currentAlgorithm = algorithmGenerator || visualizations[currentViz]?.start?.();
    if (!currentAlgorithm || typeof currentAlgorithm.next !== 'function') { // ADDED: More robust check
        console.error("Failed to get a valid algorithm iterator for start.");
        currentAlgorithm = null;
        disableControls(false); // ADDED: Re-enable if start fails
        return;
    }


    console.log(`Starting animation for ${currentViz || 'structure operation'}...`);
    isRunning = true;
    isPaused = false;         // ADDED: Ensure isPaused is false
    disableControls(true);
    speedSlider.disabled = false; // <<<< ADDED THIS LINE
    pauseButton.textContent = 'Pause';
    pauseButton.disabled = false;

    if (animationTimeoutId) { // ADDED: Clear previous timeout
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
    }
    await runStep();
}

function pauseResumeAnimation() {
    if (!isRunning && !currentAlgorithm) { // MODIFIED: More robust check
        console.log("Nothing to pause/resume. Animation not started or already finished.");
        pauseButton.disabled = true;
        return;
    }

    isPaused = !isPaused; // Toggle state

    if (isPaused) {
        if (animationTimeoutId) { // ADDED: Ensure timeout is cleared
            clearTimeout(animationTimeoutId);
            animationTimeoutId = null;
        }
        pauseButton.textContent = 'Resume';
        // disableControls(true); // This would disable speed slider too, so handle specifics:
        startButton.disabled = true; // Keep start disabled
        resetButton.disabled = false;    // MODIFIED: Enable reset
        speedSlider.disabled = false;  // ADDED: Ensure speed slider is enabled
        // Pause button itself is active
        console.log("Animation Paused.");
    } else { // Resuming
        if (!isRunning) isRunning = true; // ADDED: Ensure isRunning if resuming
        pauseButton.textContent = 'Pause';
        disableControls(true);          // MODIFIED: Call generic disable
        speedSlider.disabled = false;     // MODIFIED: Then specifically enable speed slider
        pauseButton.disabled = false;   // MODIFIED: Ensure pause button is enabled
        console.log("Animation Resumed.");
        runStep();
    }
}