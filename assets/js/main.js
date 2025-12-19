/**
 * main.js
 * Controller Logic: DOM Manipulation, Event Listeners, Repository Pattern
 */

// Global State
// --- STATE MANAGEMENT ---
let students = []; // Array of Student objects
let currentUser = null;

// --- DOM ELEMENTS ---
const loginForm = document.getElementById('loginForm');
const studentTableBody = document.getElementById('studentTableBody');
const emptyState = document.getElementById('emptyState');
const complexityLog = document.getElementById('complexityLog');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();

    // Check for persistent toast
    const pendingToast = sessionStorage.getItem('pendingToast');
    if (pendingToast) {
        showToast(pendingToast);
        sessionStorage.removeItem('pendingToast');
    }

    // Check if we are on dashboard or input page
    if (document.getElementById('studentTableBody')) {
        renderTable();
        updateStats();
    }

    // Original Auth Check - Simple Simulation (retained for other pages)
    const path = window.location.pathname;
    const isDashboard = path.includes('dashboard.html');
    const isInputPage = path.includes('input.html');

    if (isDashboard || isInputPage) {
        if (!sessionStorage.getItem('isLoggedIn')) {
            window.location.href = 'index.html';
        }
    } else {
        if (sessionStorage.getItem('isLoggedIn')) {
            window.location.href = 'dashboard.html';
        }
    }
});

// --- CORE FUNCTIONS (Global for onclick access) ---

window.editStudent = function (id) {
    console.log("Edit requested for ID:", id); // Debugging
    // Use loose equality (==) to match string "1001" with number 1001
    const student = students.find(s => s.id == id);
    if (!student) {
        console.error("Student not found for ID:", id);
        return;
    }

    // Save data to modify to localStorage to pass to input page
    localStorage.setItem('edit_student_id', student.id);

    // Redirect to input page
    window.location.href = 'input.html';
};

window.deleteStudent = function (id) {
    if (confirm('Apakah anda yakin ingin menghapus data ini?')) {
        // Use loose equality for filter too
        students = students.filter(s => s.id != id);
        saveToStorage();
        renderTable();
        updateStats();

        // Log activity
        const log = document.getElementById('complexityLog');
        if (log) {
            const timestamp = new Date().toLocaleTimeString();
            log.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; animation: fadeUp 0.3s ease; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;">
                     <div><span style="color: var(--secondary); margin-right: 10px; font-size: 0.8em;">[${timestamp}]</span> <span style="color: #ef4444;">Deleted Student ID: ${id}</span></div>
                </div>
            ` + log.innerHTML;
        }
    }
};

// --- DATA PERSISTENCE ---
// (Moved to bottom to unify with File I/O definition)

// --- AUTHENTICATION ---
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;

        if (u === 'admin' && p === 'admin') {
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    });
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// --- FORM HANDLING (Input Page) ---
const studentForm = document.getElementById('studentForm');
if (studentForm) {
    // Check if we are in "Edit Mode"
    const editId = localStorage.getItem('edit_student_id');
    if (editId) {
        // Load data into form
        const data = JSON.parse(localStorage.getItem('studentData') || '[]');
        const target = data.find(s => s.id == editId);
        if (target) {
            document.getElementById('nim').value = target.id;
            document.getElementById('nama').value = target.name;
            document.getElementById('jurusan').value = target.major;
            document.getElementById('ipk').value = target.gpa;

            // Change submit button text
            const btn = studentForm.querySelector('button[type="submit"]');
            if (btn) btn.innerText = "Update Data";

            // Disable NIM editing (PK) - Removed per user request
            // document.getElementById('nim').readOnly = true;
        }
    }

    studentForm.addEventListener('submit', function (e) {
        e.preventDefault();
        try {
            const id = parseInt(document.getElementById('nim').value);
            const name = document.getElementById('nama').value;
            const major = document.getElementById('jurusan').value;
            const gpa = parseFloat(document.getElementById('ipk').value);

            // Validation (Basic)
            if (isNaN(id) || !name || !major || isNaN(gpa)) {
                alert("Mohon lengkapi semua data dengan benar.");
                return;
            }

            const currentEditId = localStorage.getItem('edit_student_id');
            console.log("Submitting. Edit ID:", currentEditId);

            if (currentEditId) {
                // UPDATE EXISTING
                loadFromStorage();

                // Check for NIM collision if NIM has changed
                if (String(id) !== String(currentEditId)) {
                    if (students.some(s => s.id == id)) {
                        throw new Error("NIM baru sudah digunakan oleh mahasiswa lain!");
                    }
                }

                // Ensure we compare strings to avoid type issues
                const index = students.findIndex(s => String(s.id) === String(currentEditId));

                console.log("Update Index Found:", index);

                if (index !== -1) {
                    // Update the student object
                    students[index] = new Student(id, name, major, gpa);
                    saveToStorage(); // Save immediately
                    alert("Data berhasil diperbarui!");
                } else {
                    console.error("Critical: Could not find student to update with ID:", currentEditId);
                    alert("Error: Data tidak ditemukan untuk diupdate.");
                }
                localStorage.removeItem('edit_student_id');
            } else {
                // CREATE NEW
                loadFromStorage();
                if (students.some(s => s.id == id)) {
                    throw new Error("NIM sudah terdaftar!");
                }
                const newStudent = new Student(id, name, major, gpa);
                students.push(newStudent);
                saveToStorage();
                alert("Data berhasil disimpan!");
            }

            resetForm();

            // Use persistent toast for redirect
            sessionStorage.setItem('pendingToast', currentEditId ? "Data berhasil diperbarui!" : "Data berhasil disimpan!");

            console.log("Redirecting to dashboard...");
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error(error);
            showToast("Error: " + error.message, 'error');
        }
    });

    function resetForm() {
        if (studentForm) {
            studentForm.reset(); // Native reset
            // Manually reset specific fields if needed or if they are custom inputs
            // Remove readonly from NIM for next input
            const nimInput = document.getElementById('nim');
            if (nimInput) nimInput.readOnly = false;

            // Reset button state
            const btn = studentForm.querySelector('button[type="submit"]');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-save mr-2"></i> Simpan Data';
            }
        }
        localStorage.removeItem('edit_student_id');
    }
}

// Delete
function deleteStudent(index) {
    if (confirm('Yakin ingin menghapus data ini?')) {
        students.splice(index, 1);
        saveToStorage();
        renderTable();
    }
}

// Edit Trigger
function editStudent(index) {
    const s = students[index];
    document.getElementById('nim').value = s.id;
    document.getElementById('nama').value = s.name;
    document.getElementById('email').value = s.email || ''; // Populate Email
    document.getElementById('jurusan').value = s.major;
    document.getElementById('ipk').value = s.gpa;
    document.getElementById('editIndex').value = index;

    document.getElementById('saveBtn').innerText = "Update Data";
    document.getElementById('cancelBtn').style.display = "block";

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    studentForm.reset();
    document.getElementById('editIndex').value = "-1";
    document.getElementById('saveBtn').innerText = "Simpan Data";
    document.getElementById('cancelBtn').style.display = "none";
}

// --- RENDERING ---
function renderTable(data = students) {
    studentTableBody.innerHTML = '';

    if (data.length === 0) {
        emptyState.style.display = 'flex';
        // Update stats even if empty
        document.getElementById('statTotal').innerText = '0';
        document.getElementById('statAvgGPA').innerText = '0.00';
        return;
    }

    emptyState.style.display = 'none';

    data.forEach((student, index) => {
        // Find original index if we are viewing sorted/filtered data
        // This is tricky for "Edit/Delete" in sorted view. 
        // For simplicity, Edit/Delete only works reliably on default view or we need to find object ref.
        // We will find the actual index in memory 'students' array by ID to ensure safety.
        // Actually, for ID-based operations, we don't need index.

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/50 transition-colors";
        tr.innerHTML = `
            <td class="p-4 font-mono text-sm text-slate-300 border-b border-slate-700/50">${student.id}</td>
            <td class="p-4 border-b border-slate-700/50">
                <div class="font-medium text-white">${student.name}</div>
            </td>
            <td class="p-4 text-sm text-slate-400 border-b border-slate-700/50">${student.major}</td>
            <td class="p-4 border-b border-slate-700/50"><span class="px-2 py-1 text-xs font-bold rounded-full ${getGPAColor(student.gpa)} bg-opacity-10">${student.gpa.toFixed(2)}</span></td>
            <td class="p-4 border-b border-slate-700/50"><span class="px-2 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400">Aktif</span></td>
            <td class="p-4 text-right border-b border-slate-700/50">
                <button onclick="editStudent('${student.id}')" class="text-blue-400 hover:text-white hover:bg-blue-600 p-2 rounded-lg transition-all mr-2" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteStudent('${student.id}')" class="text-red-400 hover:text-white hover:bg-red-600 p-2 rounded-lg transition-all" title="Hapus">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        studentTableBody.appendChild(tr);
    });

    // Update Stats
    document.getElementById('statTotal').innerText = students.length;
    const avg = students.reduce((acc, curr) => acc + curr.gpa, 0) / (students.length || 1);
    document.getElementById('statAvgGPA').innerText = avg.toFixed(2);
}

function getGPAColor(gpa) {
    if (gpa >= 3.5) return 'style="background: rgba(139, 92, 246, 0.2); color: var(--accent);"'; // Cumlaude
    if (gpa >= 3.0) return 'style="background: rgba(34, 197, 94, 0.2); color: var(--success);"'; // Good
    return 'style="background: rgba(239, 68, 68, 0.2); color: var(--error);"'; // Danger
}

// --- ALGORITHMS INTEGRATION ---

// --- ALGORITHMS INTEGRATION ---

// Benchmark Config
const BENCHMARK_ITERATIONS = 2000; // Run 2000 times to catch micro-seconds

function handleSort() {
    const rawKey = document.getElementById('sortBy').value;
    const algo = document.getElementById('sortAlgorithm').value;
    const order = document.getElementById('sortOrder').value;

    // Map UI Selection to Object Property
    let key;
    switch (rawKey) {
        case 'id': key = 'id'; break;
        case 'name': key = 'name'; break;
        case 'gpa': key = 'gpa'; break;
        default: key = 'id';
    }

    showLoading("Sedang mengurutkan data...");

    setTimeout(() => {
        let result;

        // 1. Functional Run (to get sorted data)
        const deepCopyForFunctional = JSON.parse(JSON.stringify(students)).map(s => new Student(s.id, s.name, s.major, s.gpa));

        switch (algo) {
            case 'bubble': result = Algorithms.bubbleSort(deepCopyForFunctional, key, order); break;
            case 'selection': result = Algorithms.selectionSort(deepCopyForFunctional, key, order); break;
            case 'insertion': result = Algorithms.insertionSort(deepCopyForFunctional, key, order); break;
            case 'merge': result = Algorithms.mergeSort(deepCopyForFunctional, key, order); break;
            case 'shell': result = Algorithms.shellSort(deepCopyForFunctional, key, order); break;
        }

        // 2. Benchmark Run (Performance Measurement)
        const start = performance.now();
        for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
            const benchData = [...students];
            switch (algo) {
                case 'bubble': Algorithms.bubbleSort(benchData, key, order); break;
                case 'selection': Algorithms.selectionSort(benchData, key, order); break;
                case 'insertion': Algorithms.insertionSort(benchData, key, order); break;
                case 'merge': Algorithms.mergeSort(benchData, key, order); break;
                case 'shell': Algorithms.shellSort(benchData, key, order); break;
            }
        }
        const end = performance.now();
        const avgTime = ((end - start) / BENCHMARK_ITERATIONS).toFixed(5);

        renderTable(result.data);
        logPerformance(`Sorting ${algo.toUpperCase()} (${order.toUpperCase()})`, avgTime, result.complexity);

        hideLoading();
        showToast(`Data berhasil diurutkan (${algo})!`);
    }, 600);
}

function handleSearch() {
    const query = document.getElementById('searchInput').value;
    const type = document.getElementById('searchBy').value;
    const algo = document.getElementById('searchAlgo').value;

    // --- SEARCH VALIDATION ---
    if (!query) {
        showToast("Masukkan kata kunci pencarian!", 'error');
        return;
    }

    if (type === 'name') {
        // Must be string at least 4 characters
        const isString = /^[a-zA-Z\s]*$/.test(query);
        if (query.length < 4 || !isString) {
            showToast("Data harus string minimal 4 karakter", 'error');
            return;
        }
    } else if (type === 'id') {
        // Must be integer at least 4 characters
        const isInteger = /^\d+$/.test(query);
        if (query.length < 4 || !isInteger) {
            showToast("data harus integer minimal 4 angka", 'error');
            return;
        }
    }

    showLoading(`Mencari ${query}...`);

    setTimeout(() => {
        // Map 'name'/'id' to object keys
        const key = type === 'id' ? 'id' : 'name';

        // Pre-sort for Binary Search
        let searchData = [...students];
        if (algo === 'binary') {
            const sortRes = Algorithms.mergeSort(searchData, key, 'asc');
            searchData = sortRes.data;
        }

        let result;

        // 1. Functional Run
        switch (algo) {
            case 'linear': result = Algorithms.linearSearch(students, key, query); break;
            case 'sequential': result = Algorithms.sequentialSearch(students, key, query); break;
            case 'binary': result = Algorithms.binarySearch(searchData, key, query); break;
        }

        // 2. Benchmark Run
        const start = performance.now();
        for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
            switch (algo) {
                case 'linear': Algorithms.linearSearch(students, key, query); break;
                case 'sequential': Algorithms.sequentialSearch(students, key, query); break;
                case 'binary': Algorithms.binarySearch(searchData, key, query); break;
            }
        }
        const end = performance.now();
        const avgTime = ((end - start) / BENCHMARK_ITERATIONS).toFixed(5);

        if (result.found) {
            // Determine result display based on single vs multiple
            const displayData = Array.isArray(result.data) ? result.data : [result.data];
            renderTable(displayData);
            logPerformance(`Search ${algo.toUpperCase()} (Found)`, avgTime, result.complexity);
            showToast(`Ditemukan ${displayData.length} data!`);
        } else {
            document.getElementById('studentTableBody').innerHTML = ''; // Clear table
            document.getElementById('emptyState').style.display = 'block';
            logPerformance(`Search ${algo.toUpperCase()} (Not Found)`, avgTime, result.complexity);
            showToast("Data tidak ditemukan", 'error');
        }
        hideLoading();
    }, 600);
}

// --- HELPER --
function updateComplexityInfo() {
    const algo = document.getElementById('sortAlgorithm').value;
    const badge = document.getElementById('algoBadge');

    // Manual mapping of complexity for display
    const complexityMap = {
        'bubble': 'O(n²)',
        'selection': 'O(n²)',
        'insertion': 'O(n²)',
        'merge': 'O(n log n)',
        'shell': 'O(n log n)'
    };

    badge.innerText = `Est. Time: ${complexityMap[algo]}`;
}

function logPerformance(action, time, complexity) {
    const log = document.getElementById('complexityLog');
    const timestamp = new Date().toLocaleTimeString();

    // Update Main Stat (Execution Time)
    const statExecTime = document.getElementById('statExecTime');
    if (statExecTime) {
        // Just display exactly what we passed (it's already fixed precision)
        statExecTime.innerText = time + "ms";

        // Add a visual "flash" effect to show it updated
        statExecTime.style.color = '#fff';
        setTimeout(() => {
            statExecTime.style.color = 'var(--accent)';
        }, 300);
    }

    if (log) {
        log.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; animation: fadeUp 0.3s ease; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;">
                <div>
                    <span style="color: var(--secondary); margin-right: 10px; font-size: 0.8em;">[${timestamp}]</span> 
                    <span style="color: #e2e8f0; font-weight: 500;">${action}</span>
                </div>
                <div style="text-align: right; display: flex; gap: 8px;">
                    <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: var(--primary);">Time: ${time}ms</span>
                    <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: var(--secondary);">${complexity}</span>
                </div>
            </div>
        ` + log.innerHTML; // Prepend new logs
    }
}

// --- FILE I/O SIMULATION (JSON) ---

function saveToStorage() {
    // 1. Local Storage (Persistence)
    // Convert Class Instances back to simple Objects then stringify
    const rawData = students.map(s => s.toJSON());
    localStorage.setItem('studentData', JSON.stringify(rawData));
}

function loadFromStorage() {
    const raw = localStorage.getItem('studentData');
    if (raw) {
        const parsed = JSON.parse(raw);
        // Re-hydrate into Student Objects
        students = parsed.map(p => Student.fromJSON(p));
    } else {
        // Seed initial data if empty
        students = [
            new Student("10115001", "Andi Pratama", "Teknik Informatika", 3.75),
            new Student("10115023", "Budi Santoso", "Sistem Informasi", 3.20),
            new Student("10115045", "Citra Dewi", "Desain Komunikasi Visual", 3.90)
        ];
        saveToStorage();
    }
}

function downloadJSON() {
    if (!students || students.length === 0) {
        showToast("Tidak ada data untuk diexport!", 'error');
        return;
    }
    const dataStr = JSON.stringify(students.map(s => s.toJSON()), null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "data_mahasiswa.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

window.uploadJSON = function (input) {
    const file = input.files[0];
    if (!file) return;

    showLoading("Mengimport data...");

    const reader = new FileReader();
    reader.onload = function (e) {
        setTimeout(() => {
            try {
                const json = JSON.parse(e.target.result);
                if (!Array.isArray(json)) throw new Error("Format File JSON tidak valid!");

                // Validate and Merge
                const newStudents = json.map(j => Student.fromJSON(j));
                students = newStudents; // Replace current state
                saveToStorage();
                renderTable();
                showToast("Data berhasil diimport!");
            } catch (err) {
                showToast("Gagal membaca file: " + err.message, 'error');
            } finally {
                hideLoading();
                input.value = ''; // Reset input
            }
        }, 800);
    };
    reader.readAsText(file);
}

// --- UI HELPERS ---

function showLoading(text = "Mohon tunggu sebentar...") {
    const overlay = document.getElementById('loadingOverlay');
    const label = document.getElementById('loadingText');
    if (overlay) {
        if (label) label.innerText = text;
        overlay.classList.remove('hidden');
        overlay.style.opacity = '1';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? 'fa-check' : 'fa-exclamation-triangle';

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="toast-content">
            <div class="text-sm font-semibold">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove after 3s
    setTimeout(() => {
        toast.classList.add('toast-closing');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// View Switcher (Portal Logic)
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    // Show target view
    const target = document.getElementById('view-' + viewName);
    if (target) target.classList.add('active');

    // Update Nav State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Highlight specific nav item if exists
    const navItem = document.getElementById('nav-' + viewName);
    if (navItem) navItem.classList.add('active');
}
