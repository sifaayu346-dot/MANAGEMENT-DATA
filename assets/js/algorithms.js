/**
 * algorithms.js
 * Manual implementation of Sorting & Searching Algorithms.
 * Includes visual complexity estimation.
 */

const Algorithms = {

    // --- SEARCHING ---

    // Linear Search (Sequential)
    // O(n) Time Complexity
    linearSearch: (arr, key, query) => {
        const start = performance.now();
        const results = [];
        const q = query.toLowerCase();

        for (let i = 0; i < arr.length; i++) {
            // Search by specific Key
            let val = key === 'ipk' || key === 'id' ? arr[i][key].toString() : arr[i][key].toLowerCase();

            if (val.includes(q)) {
                results.push(arr[i]);
            }
        }

        const end = performance.now();
        // Return object structure matching others
        const found = results.length > 0;
        return {
            data: results, // Return array of matches
            found: found,
            time: (end - start).toFixed(4),
            complexity: 'O(n)'
        };
    },

    // Binary Search Dispatcher
    binarySearch: (arr, key, query) => {
        if (key === 'id') {
            return Algorithms.binarySearchById(arr, query);
        } else if (key === 'name') {
            return Algorithms.binarySearchByName(arr, query);
        } else {
            console.warn("Binary search only supports ID or Name. Fallback to Linear.");
            return Algorithms.linearSearch(arr, key, query);
        }
    },

    // Binary Search (Sorted by ID)
    binarySearchById: (arr, targetId) => {
        // Pre-sort strictly for binary search
        let sortedArr = [...arr].sort((a, b) => parseInt(a.id) - parseInt(b.id));

        const start = performance.now();
        let left = 0;
        let right = sortedArr.length - 1;
        let result = null;
        let found = false;

        // Binary Search Logic
        const target = parseInt(targetId);

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const currentId = parseInt(sortedArr[mid].id);

            if (currentId === target) {
                result = sortedArr[mid];
                found = true;
                break;
            } else if (currentId < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        const end = performance.now();
        return {
            data: result || [], // Return single object or empty if not found, checking main.js expectation
            // main.js expects: if (result.found) ... displayData = Array.isArray(result.data) ? ...
            // Let's standardise to return item or null, handled by main.js
            // Actually main.js code: const displayData = Array.isArray(result.data) ? result.data : [result.data];
            // So returning the object directly is fine if found.

            data: found ? result : [],
            found: found,
            time: (end - start).toFixed(4),
            complexity: 'O(log n)'
        };
    },

    // Binary Search (Sorted by Name)
    binarySearchByName: (arr, targetName) => {
        // Pre-sort by Name
        let sortedArr = [...arr].sort((a, b) => a.name.localeCompare(b.name));

        const start = performance.now();
        let left = 0;
        let right = sortedArr.length - 1;
        let result = null;
        let found = false;
        const target = targetName.toLowerCase();

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const currentName = sortedArr[mid].name.toLowerCase();

            // Prefix Matching Logic
            // Check this FIRST because if it matches prefix, we found it.
            if (currentName.startsWith(target)) {
                result = sortedArr[mid];
                found = true;
                break;
            } else if (currentName < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        const end = performance.now();
        return {
            data: found ? result : [],
            found: found,
            time: (end - start).toFixed(4),
            complexity: 'O(log n) + Sort'
        };
    },

    // --- SORTING ---

    // --- SORTING ---

    // Helper: Compare Values
    compare: (a, b, order) => {
        if (order === 'desc') return a < b; // Descending: Swap if A < B (move smaller to end/right) ?? No, usually Bubble moves largest to right.
        // Wait, standard Bubble Sort: if (arr[j] > arr[j+1]) swap. This moves MAX to right (Ascending).
        // If Descending (MAX at left), we want to swap if (arr[j] < arr[j+1]).

        // Let's standardize: Return TRUE if we should SWAP.
        // ASC (Low->High): Swap if Left > Right
        // DESC (High->Low): Swap if Left < Right
        if (order === 'desc') return a < b;
        return a > b;
    },

    // 1. Bubble Sort
    bubbleSort: (arr, key, order = 'asc') => {
        let data = [...arr];
        const start = performance.now();
        let n = data.length;
        let swapped;

        do {
            swapped = false;
            for (let i = 0; i < n - 1; i++) {
                let valA = key === 'gpa' || key === 'id' ? parseFloat(data[i][key]) : data[i][key].toLowerCase();
                let valB = key === 'gpa' || key === 'id' ? parseFloat(data[i + 1][key]) : data[i + 1][key].toLowerCase();

                if (Algorithms.compare(valA, valB, order)) {
                    let temp = data[i];
                    data[i] = data[i + 1];
                    data[i + 1] = temp;
                    swapped = true;
                }
            }
            n--;
        } while (swapped);

        const end = performance.now();
        return { data, time: (end - start).toFixed(4), complexity: 'O(n²)' };
    },

    // 2. Selection Sort
    selectionSort: (arr, key, order = 'asc') => {
        let data = [...arr];
        const start = performance.now();
        let n = data.length;

        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                let valCheck = key === 'gpa' || key === 'id' ? parseFloat(data[j][key]) : data[j][key].toLowerCase();
                let valMin = key === 'gpa' || key === 'id' ? parseFloat(data[minIdx][key]) : data[minIdx][key].toLowerCase();

                // Logic: Find "Extreme" value.
                // ASC: Find Standard MIN. Swap if Check < CurrentMin.
                // DESC: Find MAX. Swap if Check > CurrentMin (which is actually Max).
                let condition = (order === 'desc') ? (valCheck > valMin) : (valCheck < valMin);

                if (condition) {
                    minIdx = j;
                }
            }
            if (minIdx !== i) {
                let temp = data[i];
                data[i] = data[minIdx];
                data[minIdx] = temp;
            }
        }

        const end = performance.now();
        return { data, time: (end - start).toFixed(4), complexity: 'O(n²)' };
    },

    // 3. Insertion Sort
    insertionSort: (arr, key, order = 'asc') => {
        let data = [...arr];
        const start = performance.now();
        let n = data.length;

        for (let i = 1; i < n; i++) {
            let current = data[i];
            let j = i - 1;
            let currentVal = key === 'gpa' || key === 'id' ? parseFloat(current[key]) : current[key].toLowerCase();

            while (j >= 0) {
                let checkVal = key === 'gpa' || key === 'id' ? parseFloat(data[j][key]) : data[j][key].toLowerCase();

                // ASC: Shift if Check > Current
                // DESC: Shift if Check < Current
                let condition = (order === 'desc') ? (checkVal < currentVal) : (checkVal > currentVal);

                if (condition) {
                    data[j + 1] = data[j];
                    j--;
                } else {
                    break;
                }
            }
            data[j + 1] = current;
        }

        const end = performance.now();
        return { data, time: (end - start).toFixed(4), complexity: 'O(n²)' };
    },

    // 4. Merge Sort
    mergeSort: (arr, key, order = 'asc') => {
        const start = performance.now();

        const merge = (left, right) => {
            let resultArray = [], leftIndex = 0, rightIndex = 0;

            while (leftIndex < left.length && rightIndex < right.length) {
                let valLeft = key === 'gpa' || key === 'id' ? parseFloat(left[leftIndex][key]) : left[leftIndex][key].toLowerCase();
                let valRight = key === 'gpa' || key === 'id' ? parseFloat(right[rightIndex][key]) : right[rightIndex][key].toLowerCase();

                // Sorting Condition for Merge
                // ASC: Push Left if Left < Right
                // DESC: Push Left if Left > Right
                let condition = (order === 'desc') ? (valLeft > valRight) : (valLeft < valRight);

                if (condition) {
                    resultArray.push(left[leftIndex]);
                    leftIndex++;
                } else {
                    resultArray.push(right[rightIndex]);
                    rightIndex++;
                }
            }
            return resultArray.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
        };

        const sortRecursive = (array) => {
            if (array.length <= 1) return array;
            const middle = Math.floor(array.length / 2);
            const left = array.slice(0, middle);
            const right = array.slice(middle);
            return merge(sortRecursive(left), sortRecursive(right));
        };

        let data = sortRecursive([...arr]);
        const end = performance.now();
        return { data, time: (end - start).toFixed(4), complexity: 'O(n log n)' };
    },

    // 5. Shell Sort
    shellSort: (arr, key, order = 'asc') => {
        let data = [...arr];
        const start = performance.now();
        let n = data.length;

        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i++) {
                let temp = data[i];
                let j;
                let tempVal = key === 'gpa' || key === 'id' ? parseFloat(temp[key]) : temp[key].toLowerCase();

                for (j = i; j >= gap; j -= gap) {
                    let checkVal = key === 'gpa' || key === 'id' ? parseFloat(data[j - gap][key]) : data[j - gap][key].toLowerCase();

                    // Same as Insertion
                    // ASC: Shift if Check > Temp
                    // DESC: Shift if Check < Temp
                    let condition = (order === 'desc') ? (checkVal < tempVal) : (checkVal > tempVal);

                    if (condition) {
                        data[j] = data[j - gap];
                    } else {
                        break;
                    }
                }
                data[j] = temp;
            }
        }

        const end = performance.now();
        return { data, time: (end - start).toFixed(4), complexity: 'O(n(log n)²)' };
    }
};
