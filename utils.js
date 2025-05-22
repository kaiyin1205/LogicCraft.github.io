// --- Utility Functions ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function disableControls(running) {
    const vizCanStart = currentViz && visualizations[currentViz]?.start;
    const isStructureWithButtons = currentViz && visualizations[currentViz]?.addControls && !visualizations[currentViz]?.start;

    startButton.disabled = running || !vizCanStart || isStructureWithButtons;
    // Pause button state is now managed more directly elsewhere

    resetButton.disabled = running && !isPaused; // MODIFIED: Can reset if (running AND paused) OR if not running at all.

    sizeSlider.disabled = running || !isSizeRelevant(currentViz);

    // Speed slider's state is now primarily managed by startAnimation/pauseResumeAnimation
    // This function just ensures it's enabled when 'running' is false.
    if (!running) { // ADDED
        speedSlider.disabled = false;
    }

    structureControlsContainer.querySelectorAll('button, input').forEach(el => {
        if (el.id !== 'speed-slider') { // ADDED: Ensure speed slider isn't caught here
            el.disabled = running;
        }
    });
}

function isSizeRelevant(vizName) {
    return [
        'bubbleSort', 'selectionSort', 'insertionSort', 'cocktailShakerSort', 'shellSort',
        'mergeSort', 'quickSort', 'heapSort', 'radixSort',
        'minHeap', 'maxHeap', 'hashTable', 'towerOfHanoi'
    ].includes(vizName);
}

function updateInfo(title, description) {
    if (title !== null) vizTitle.textContent = title;
    if (description !== null) vizDescription.innerHTML = description;
}

function setActiveButton(vizName) {
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.viz === vizName) {
            btn.classList.add('active');
        }
    });
}

// --- START OF FILE js/utils.js ---

// ... (các hàm sleep, getRandomInt, disableControls, isSizeRelevant, updateInfo, setActiveButton đã có ở đây) ...

/**
 * Generates an array of indices that are considered sorted based on context.
 * Used primarily for highlighting in sorting visualizations.
 * @param {number} totalLength - The total number of elements in the array.
 * @param {number} countOrStart - For fromEnd=true, it's the count of sorted elements from the end.
 *                                For fromEnd=false, it's the count/index up to which elements are sorted from the start.
 * @param {boolean} [fromEnd=true] - If true, indices are calculated from the end (Bubble Sort).
 *                                  If false, indices are calculated from the start (Selection, Insertion Sort).
 * @returns {number[]} An array of sorted indices.
 */
function getSortedIndices(totalLength, countOrStart, fromEnd = true) {
    const indices = [];
    if (countOrStart <= 0) return indices; // No indices if count is zero or negative

    if (fromEnd) {
        // Calculate indices from the end of the array
        const startIndex = totalLength - countOrStart;
        for (let k = startIndex; k < totalLength; k++) {
            if (k >= 0) { // Ensure index is not negative
               indices.push(k);
            }
        }
    } else {
        // Calculate indices from the start of the array
        for (let k = 0; k < countOrStart; k++) {
             if (k < totalLength) { // Ensure index is within bounds
                 indices.push(k);
             }
        }
    }
    return indices;
}


// --- Định nghĩa Visualization cho Queue ---
if (typeof visualizations === 'undefined') {
    console.error("queue.js: Đối tượng 'visualizations' không tìm thấy. Đảm bảo dom-setup.js đã được load trước.");
} else {
    visualizations.queue = {
        title: "Queue (FIFO)",
        description: "First-In, First-Out. <code>enqueue(value)</code> thêm vào cuối, <code>dequeue()</code> xóa khỏi đầu.",
        /**
         * Khởi tạo Queue. Reset mảng dữ liệu và vẽ lại giao diện.
         */
        init: async () => {
            structureInstance = []; // Sử dụng mảng đơn giản, reset nó
            renderQueue(structureInstance);
            updateInfo(visualizations.queue.title, visualizations.queue.description + "<br>Queue initialized. Use controls to enqueue/dequeue.");
            visualizations.queue.addControls(); // Thêm các nút điều khiển đặc thù cho Queue
            disableControls(false); // Bật các nút điều khiển chung
            startButton.disabled = true; // Vô hiệu hóa nút Start chung
            sizeSlider.style.display = 'none'; // Ẩn thanh trượt kích thước
            sizeLabel.style.display = 'none';
        },
        /**
         * Thêm các nút điều khiển (Enqueue/Dequeue) vào khu vực controls.
         * Hàm này gọi hàm addStackQueueControls toàn cục từ utils.js.
         */
        addControls: () => {
             // Đảm bảo hàm này tồn tại trong utils.js
            if (typeof addStackQueueControls === 'function') {
                addStackQueueControls('queue');
            } else {
                console.error("addStackQueueControls function is not defined. Make sure utils.js is loaded correctly.");
            }
        },
        /**
         * Không sử dụng hàm start chung, vì các thao tác được kích hoạt bởi nút riêng.
         */
        start: null,

        /**
         * Generator function cho thao tác Enqueue.
         * @param {*} value - Giá trị cần thêm vào queue.
         */
        enqueue: async function*(value) {
            // Đảm bảo structureInstance là một mảng
            if (!structureInstance || !Array.isArray(structureInstance)) {
                console.warn("Queue.enqueue: structureInstance không phải là mảng hoặc null/undefined. Khởi tạo lại.");
                structureInstance = [];
            }
            updateInfo("Queue Enqueue", `Enqueueing <strong>${value}</strong>...`);
            structureInstance.push(value); // Thêm vào cuối mảng (rear)
            renderQueue(structureInstance); // Vẽ lại giao diện trước

            // Delay ngắn trước khi highlight
            yield await sleep(getDelay() / 3);

            // Highlight phần tử *cuối cùng* vừa được thêm (rear mới)
            const element = vizArea.querySelector('.queue-container .queue-element:last-child');
            if (element) {
                // Sử dụng hàm highlightElement toàn cục
                highlightElement(element, 'special', getDelay() * 1.5);
            }
            yield await sleep(getDelay()); // Giữ highlight

            updateInfo("Queue Enqueue", `Element <strong>${value}</strong> enqueued.`);
            disableControls(false); // Bật lại các nút controls sau khi thao tác xong
            startButton.disabled = true;
            pauseButton.disabled = true;
        },

        /**
         * Generator function cho thao tác Dequeue.
         */
        dequeue: async function*() {
            // Kiểm tra xem structureInstance có phải là mảng và có rỗng không
             if (!structureInstance || !Array.isArray(structureInstance) || structureInstance.length === 0) {
                 updateInfo("Queue Dequeue", "Queue is empty. Cannot dequeue.");
                 yield await sleep(getDelay());
                 disableControls(false);
                 startButton.disabled = true;
                 pauseButton.disabled = true;
                 return; // Kết thúc generator nếu queue rỗng
             }

            const value = structureInstance[0]; // Lấy phần tử đầu (front)
            updateInfo("Queue Dequeue", `Dequeuing <strong>${value}</strong>...`);

            // Highlight phần tử *đầu tiên* (front) đang được xóa
            const element = vizArea.querySelector('.queue-container .queue-element:first-child');
            if (element) {
                 // Sử dụng hàm highlightElement toàn cục
                highlightElement(element, 'swapping', getDelay() * 1.5);
            }
            yield await sleep(getDelay()); // Giữ highlight trong lúc "xóa"

            structureInstance.shift(); // Xóa phần tử đầu mảng (front)
            renderQueue(structureInstance); // Vẽ lại giao diện không còn phần tử đã xóa
            updateInfo("Queue Dequeue", `Element <strong>${value}</strong> dequeued.`);
            yield await sleep(getDelay()/2); // Tạm dừng ngắn sau khi vẽ lại

            disableControls(false); // Bật lại controls
            startButton.disabled = true;
            pauseButton.disabled = true;
        }
    };
}


// --- START: Thêm vào utils.js hoặc file controls.js mới ---

/**
 * Thêm các nút điều khiển (thêm/xóa) cho Stack hoặc Queue.
 * @param {string} type - Loại cấu trúc ('stack' hoặc 'queue').
 */
function addStackQueueControls(type) {
    // Đảm bảo structureControlsContainer tồn tại
    if (!structureControlsContainer) {
        console.error("addStackQueueControls: structureControlsContainer not found in DOM.");
        return;
    }
    structureControlsContainer.innerHTML = ''; // Xóa controls cũ

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `${type}-value-input`;
    input.placeholder = "Value";
    input.setAttribute('aria-label', `Value to ${type === 'stack' ? 'push' : 'enqueue'}`);

    const addButton = document.createElement('button');
    addButton.textContent = type === 'stack' ? 'Push' : 'Enqueue';
    // QUAN TRỌNG: Gán hàm xử lý onclick
    addButton.onclick = () => handleStructureAdd(type);

    const removeButton = document.createElement('button');
    removeButton.textContent = type === 'stack' ? 'Pop' : 'Dequeue';
    // QUAN TRỌNG: Gán hàm xử lý onclick
    removeButton.onclick = () => handleStructureRemove(type);

    structureControlsContainer.appendChild(input);
    structureControlsContainer.appendChild(addButton);
    structureControlsContainer.appendChild(removeButton);

    // Listener cho phím Enter trên input
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Ngăn hành vi mặc định (vd: submit form)
            addButton.click(); // Kích hoạt nút thêm
        }
    });
     console.log(`Added controls for ${type}`); // Log để debug
}

/**
 * Xử lý sự kiện khi nhấn nút thêm (Push/Enqueue).
 * @param {string} type - Loại cấu trúc ('stack' hoặc 'queue').
 */
async function handleStructureAdd(type) {
    if (isRunning) {
        console.log("Animation running, cannot add element now.");
        return;
    }
    const input = document.getElementById(`${type}-value-input`);
    if (!input) {
        console.error(`Input element '#${type}-value-input' not found.`);
        return;
    }
    const value = input.value.trim();

    if (value === '') {
        updateInfo(null, "Please enter a value to add.");
        input.focus();
        return;
    }

    const viz = visualizations[type];
    // Xác định đúng tên phương thức (push cho stack, enqueue cho queue)
    const addMethodName = type === 'queue' ? 'enqueue' : 'push';
    const addMethodGenerator = viz?.[addMethodName]; // Lấy generator function

    if (addMethodGenerator && typeof addMethodGenerator === 'function') {
        // Đảm bảo structureInstance là một mảng
        if (!structureInstance || !Array.isArray(structureInstance)) {
            console.warn(`${type}.handleStructureAdd: structureInstance is not an array or is null/undefined. Initializing.`);
            structureInstance = [];
             // Render lại trạng thái rỗng ban đầu nếu cần
             if (type === 'queue' && typeof renderQueue === 'function') renderQueue(structureInstance);
             // else if (type === 'stack' && typeof renderStack === 'function') renderStack(structureInstance); // Cần hàm renderStack nếu làm cho stack
        }
        console.log(`Calling ${type}.${addMethodName} with value: ${value}`);
        // Gọi startAnimation với generator trả về từ enqueue/push
        // Truyền giá trị vào generator function
        startAnimation(addMethodGenerator(value));
        input.value = ''; // Xóa input
        input.focus();
    } else {
        console.error(`Generator function '${addMethodName}' not found for visualization type '${type}'.`);
        updateInfo("Error", `Cannot perform ${addMethodName} operation.`);
    }
}

/**
 * Xử lý sự kiện khi nhấn nút xóa (Pop/Dequeue).
 * @param {string} type - Loại cấu trúc ('stack' hoặc 'queue').
 */
async function handleStructureRemove(type) {
    if (isRunning) {
         console.log("Animation running, cannot remove element now.");
        return;
    }

    const viz = visualizations[type];
    // Xác định đúng tên phương thức (pop cho stack, dequeue cho queue)
    const removeMethodName = type === 'queue' ? 'dequeue' : 'pop';
    const removeMethodGenerator = viz?.[removeMethodName]; // Lấy generator function

    if (removeMethodGenerator && typeof removeMethodGenerator === 'function') {
        // Kiểm tra structureInstance trước khi gọi
        if (!structureInstance || !Array.isArray(structureInstance)) {
            updateInfo(null, `${type.charAt(0).toUpperCase() + type.slice(1)} is not initialized.`);
            console.warn(`${type}.handleStructureRemove: structureInstance is not an array or is null/undefined.`);
            return;
        }
         // Không cần kiểm tra rỗng ở đây vì generator dequeue/pop sẽ làm điều đó
        console.log(`Calling ${type}.${removeMethodName}`);
        // Gọi startAnimation với generator trả về từ dequeue/pop
        startAnimation(removeMethodGenerator()); // Không cần tham số cho dequeue/pop
    } else {
        console.error(`Generator function '${removeMethodName}' not found for visualization type '${type}'.`);
        updateInfo("Error", `Cannot perform ${removeMethodName} operation.`);
    }
}

function isSizeRelevant(vizName) {
    return [
        'bubbleSort', 'selectionSort', 'insertionSort', // ... other sorting ...
        'mergeSort', 'quickSort', 'heapSort',
        'minHeap', 'maxHeap', 'hashTable', // ... other data structures ...
        'towerOfHanoi', // ADDED
        'bfs', 'dfs', 'prim' // <<< ADDED THESE
        // Graph algorithms, string search, sudoku typically don't use this global size slider
        // in the same way (or have their own size controls).
    ].includes(vizName);
}
