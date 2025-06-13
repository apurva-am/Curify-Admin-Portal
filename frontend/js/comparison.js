let selectedJobs = new Set();
const maxComparableJobs = 2;

function toggleJobSelection(jobId) {
    const checkbox = document.getElementById(`select-${jobId}`);
    const compareButton = document.getElementById('compareButton');

    if (checkbox.checked) {
        if (selectedJobs.size >= maxComparableJobs) {
            checkbox.checked = false;
            alert('You can only compare two jobs at a time');
            return;
        }
        selectedJobs.add(jobId);
    } else {
        selectedJobs.delete(jobId);
    }

    // Enable/disable compare button
    compareButton.disabled = selectedJobs.size !== 2;
}

async function compareSelectedJobs() {
    if (selectedJobs.size !== 2) return;

    const jobIds = Array.from(selectedJobs);
    const [job1, job2] = await Promise.all(
        jobIds.map(id => fetch(`${API_BASE_URL}/admin/job/${id}`).then(r => r.json()))
    );

    const modal = document.getElementById('comparisonModal');
    const content = document.getElementById('comparisonContent');

    // Helper function to highlight differences
    const highlightDiff = (val1, val2) => {
        return val1 !== val2 ? 'bg-yellow-100' : '';
    };

    // Compare configurations
    const configDiffs = {};
    Object.keys(job1.runtime_config).forEach(key => {
        configDiffs[key] = job1.runtime_config[key] !== job2.runtime_config[key];
    });

    content.innerHTML = `
        <div class="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
            <!-- Job Headers -->
            <div class="text-center p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                <h3 class="text-xl font-bold">Job ${job1.job_id}</h3>
                <p class="text-sm text-gray-600 mt-2">Status: 
                    <span class="px-2 py-1 rounded ${getStatusClass(job1.status)}">${job1.status}</span>
                </p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                <h3 class="text-xl font-bold">Job ${job2.job_id}</h3>
                <p class="text-sm text-gray-600 mt-2">Status: 
                    <span class="px-2 py-1 rounded ${getStatusClass(job2.status)}">${job2.status}</span>
                </p>
            </div>

            <!-- Configuration Comparison -->
            <div class="border rounded-lg p-4 flex flex-col">
                <h4 class="font-semibold mb-2 text-center">Configuration</h4>
                <div class="space-y-2 flex-grow">
                    ${Object.entries(job1.runtime_config).map(([key, value]) => `
                        <div class="grid grid-cols-2 gap-2 ${highlightDiff(value, job2.runtime_config[key])} p-2 rounded">
                            <div class="text-sm text-gray-600 text-right pr-4">${key}:</div>
                            <div class="font-medium">${value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="border rounded-lg p-4 flex flex-col">
                <h4 class="font-semibold mb-2 text-center">Configuration</h4>
                <div class="space-y-2 flex-grow">
                    ${Object.entries(job2.runtime_config).map(([key, value]) => `
                        <div class="grid grid-cols-2 gap-2 ${highlightDiff(value, job1.runtime_config[key])} p-2 rounded">
                            <div class="text-sm text-gray-600 text-right pr-4">${key}:</div>
                            <div class="font-medium">${value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Videos -->
            <div class="border rounded-lg p-4 flex flex-col">
                <h4 class="font-semibold mb-4 text-center">Videos</h4>
                <div class="space-y-6">
                    <div class="space-y-6">
                        <div>
                            <h5 class="text-lg font-medium mb-4 text-center">Original Video</h5>
                            <div class="w-full max-w-lg mx-auto">
                                <video controls class="w-full rounded shadow-sm">
                                    <source src="${job1.video_url}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                        <div>
                            <h5 class="text-lg font-medium mb-4 text-center">Translated Video</h5>
                            <div class="w-full max-w-lg mx-auto">
                                ${job1.translated_video_url ? `
                                    <video controls class="w-full rounded shadow-sm">
                                        <source src="${job1.translated_video_url}" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                ` : `
                                    <div class="bg-gray-50 rounded-lg p-4 text-center">
                                        <p class="text-gray-500">Translation in progress...</p>
                                        <p class="text-sm text-gray-400 mt-1">Status: ${job1.status}</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="border rounded-lg p-4 flex flex-col">
                <h4 class="font-semibold mb-4 text-center">Videos</h4>
                <div class="space-y-6">
                    <div class="space-y-6">
                        <div>
                            <h5 class="text-lg font-medium mb-4 text-center">Original Video</h5>
                            <div class="w-full max-w-lg mx-auto">
                                <video controls class="w-full rounded shadow-sm">
                                    <source src="${job2.video_url}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                        <div>
                            <h5 class="text-lg font-medium mb-4 text-center">Translated Video</h5>
                            <div class="w-full max-w-lg mx-auto">
                                ${job2.translated_video_url ? `
                                    <video controls class="w-full rounded shadow-sm">
                                        <source src="${job2.translated_video_url}" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                ` : `
                                    <div class="bg-gray-50 rounded-lg p-4 text-center">
                                        <p class="text-gray-500">Translation in progress...</p>
                                        <p class="text-sm text-gray-400 mt-1">Status: ${job2.status}</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transcripts -->
            <div class="border rounded-lg p-4">
                <h4 class="font-semibold mb-2">Transcripts</h4>
                <div class="space-y-4">
                    <div>
                        <p class="text-sm text-gray-600 mb-1">Original:</p>
                        <div class="bg-white p-2 rounded border">
                            ${job1.transcripts.original}
                        </div>
                    </div>
                    ${job1.transcripts.translated ? `
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Translated:</p>
                            <div class="bg-white p-2 rounded border">
                                ${job1.transcripts.translated}
                            </div>
                        </div>
                    ` : '<p class="text-gray-500">Translation in progress...</p>'}
                </div>
            </div>
            <div class="border rounded-lg p-4">
                <h4 class="font-semibold mb-2">Transcripts</h4>
                <div class="space-y-4">
                    <div>
                        <p class="text-sm text-gray-600 mb-1">Original:</p>
                        <div class="bg-white p-2 rounded border">
                            ${job2.transcripts.original}
                        </div>
                    </div>
                    ${job2.transcripts.translated ? `
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Translated:</p>
                            <div class="bg-white p-2 rounded border">
                                ${job2.transcripts.translated}
                            </div>
                        </div>
                    ` : '<p class="text-gray-500">Translation in progress...</p>'}
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function closeComparisonModal() {
    const modal = document.getElementById('comparisonModal');
    modal.classList.remove('active');
    // Clear selections
    selectedJobs.clear();
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('compareButton').disabled = true;
}

// Helper function to get status class (needs to be accessible in comparison view)
function getStatusClass(status) {
    const classes = {
        'completed': 'bg-green-100 text-green-800',
        'in_progress': 'bg-yellow-100 text-yellow-800',
        'failed': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}
