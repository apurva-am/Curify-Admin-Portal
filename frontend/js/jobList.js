let allJobs = []; // Store all jobs globally
let selectedJobs = new Set(); // Store selected job IDs

async function loadJobs() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/jobs`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allJobs = await response.json();
        renderJobs(allJobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

function renderJobs(jobs) {
    const jobList = document.getElementById('jobList');

    // Create table structure
    const table = `
        <div class="bg-white rounded-lg p-4">
            <table class="min-w-full">
                <thead>
                    <tr>
                        <th class="text-left p-2">Select</th>
                        <th class="text-left p-2">Job ID</th>
                        <th class="text-left p-2">User</th>
                        <th class="text-left p-2">Status</th>
                        <th class="text-left p-2">Language</th>
                        <th class="text-left p-2">Created At</th>
                        <th class="text-left p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${jobs.map(job => `
                        <tr class="border-b">
                            <td class="p-2">
                                <input 
                                    type="checkbox" 
                                    id="select-${job.job_id}"
                                    onchange="toggleJobSelection('${job.job_id}')"
                                    ${selectedJobs.has(job.job_id) ? 'checked' : ''}
                                    class="form-checkbox h-4 w-4"
                                >
                            </td>
                            <td class="p-2">${job.job_id}</td>
                            <td class="p-2">${job.user}</td>
                            <td class="p-2">
                                <span class="px-2 py-1 text-xs rounded-full ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
            job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
        }">
                                    ${job.status}
                                </span>
                            </td>
                            <td class="p-2">${job.runtime_config.language}</td>
                            <td class="p-2">${new Date(job.created_at).toLocaleString()}</td>
                            <td class="p-2">
                                <button onclick="viewJob('${job.job_id}')" 
                                        class="bg-blue-500 text-white px-4 py-1 rounded">
                                    View
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    jobList.innerHTML = table;
}

function handleSearch() {
    applyFilters();
}

function handleFilters() {
    applyFilters();
}

function handleSort() {
    applyFilters();
}

function applyFilters() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const languageFilter = document.getElementById('languageFilter').value;
    const dateSort = document.getElementById('dateSort').value;

    // Apply all filters
    let filteredJobs = allJobs.filter(job => {
        const matchesSearch =
            job.job_id.toLowerCase().includes(searchQuery) ||
            job.user.toLowerCase().includes(searchQuery) ||
            job.status.toLowerCase().includes(searchQuery);

        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        const matchesLanguage = languageFilter === 'all' || job.runtime_config.language === languageFilter;

        return matchesSearch && matchesStatus && matchesLanguage;
    });

    // Apply sorting
    filteredJobs.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    renderJobs(filteredJobs);
}

function toggleAllJobs(checkbox) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
        if (cb.id.startsWith('select-')) {
            const jobId = cb.id.replace('select-', '');
            if (checkbox.checked) {
                selectedJobs.add(jobId);
            } else {
                selectedJobs.delete(jobId);
            }
        }
    });
    updateCompareButton();
}

function toggleJobSelection(jobId) {
    const checkbox = document.getElementById(`select-${jobId}`);
    if (checkbox.checked) {
        if (selectedJobs.size >= 2) {
            checkbox.checked = false;
            alert('You can only compare two jobs at a time');
            return;
        }
        selectedJobs.add(jobId);
    } else {
        selectedJobs.delete(jobId);
    }
    updateCompareButton();
}

function updateCompareButton() {
    const compareButton = document.getElementById('compareButton');
    compareButton.disabled = selectedJobs.size !== 2;
    compareButton.classList.toggle('opacity-50', selectedJobs.size !== 2);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', loadJobs);