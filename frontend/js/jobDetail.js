class JobDetail {
    constructor() {
        this.detailElement = document.getElementById('jobDetail');
        this.currentJobId = null;
    }

    async loadJob(jobId) {
        try {
            const job = await api.getJob(jobId);
            this.currentJobId = jobId;
            this.render(job);
        } catch (error) {
            console.error('Error loading job:', error);
        }
    }

    render(job) {
        const detail = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Job: ${job.job_id}</h2>
                    <span class="px-4 py-2 rounded ${this.getStatusClass(job.status)}">
                        ${job.status}
                    </span>
                </div>

                <!-- Video Players -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <h3 class="font-semibold">Original Video</h3>
                        <video controls class="w-full">
                            <source src="${job.video_url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div class="space-y-2">
                        <h3 class="font-semibold">Translated Video</h3>
                        <video controls class="w-full">
                            <source src="${job.translated_video_url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>

                <!-- Transcripts -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <h3 class="font-semibold">Original Transcript</h3>
                        <div class="p-4 bg-gray-50 rounded">
                            ${job.transcripts.original}
                        </div>
                    </div>
                    <div class="space-y-2">
                        <h3 class="font-semibold">Translated Transcript</h3>
                        <div class="p-4 bg-gray-50 rounded">
                            ${job.transcripts.translated || 'Translation in progress...'}
                        </div>
                    </div>
                </div>

                <!-- Runtime Config -->
                <div class="space-y-2">
                    <h3 class="font-semibold">Runtime Configuration</h3>
                    <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                        <div>
                            <span class="font-medium">Language:</span> 
                            ${job.runtime_config.language}
                        </div>
                        <div>
                            <span class="font-medium">Speed:</span> 
                            ${job.runtime_config.speed}x
                        </div>
                        <div>
                            <span class="font-medium">Voice ID:</span> 
                            ${job.runtime_config.voice_id}
                        </div>
                    </div>
                </div>

                <!-- Notes Section -->
                <div class="space-y-2">
                    <h3 class="font-semibold">Notes</h3>
                    <div id="notesList" class="space-y-2"></div>
                    <div class="flex gap-2">
                        <input type="text" id="noteInput" 
                               class="flex-1 border rounded px-3 py-2"
                               placeholder="Add a note...">
                        <button onclick="addNote()"
                                class="bg-blue-500 text-white px-4 py-2 rounded">
                            Add Note
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.detailElement.innerHTML = detail;
        this.detailElement.classList.remove('hidden');
        this.loadNotes(job.job_id);
    }

    getStatusClass(status) {
        const classes = {
            completed: 'bg-green-100 text-green-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    async loadNotes(jobId) {
        try {
            const notes = await api.getJobNotes(jobId);
            const notesList = document.getElementById('notesList');
            notesList.innerHTML = notes.map(note => `
                <div class="p-3 bg-gray-50 rounded">
                    <div class="text-sm text-gray-600">
                        ${new Date(note.timestamp).toLocaleString()} - ${note.user}
                    </div>
                    <div>${note.content}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    }
}

// Initialize
const jobDetail = new JobDetail();

// Add to api.js
async function addNote() {
    const noteInput = document.getElementById('noteInput');
    const content = noteInput.value.trim();

    if (!content) return;

    try {
        await api.addJobNote(jobDetail.currentJobId, { content });
        noteInput.value = '';
        await jobDetail.loadNotes(jobDetail.currentJobId);
    } catch (error) {
        console.error('Error adding note:', error);
    }
}

async function viewJob(jobId) {
    try {
        const modal = document.getElementById('jobDetailModal');
        const content = document.getElementById('jobDetailContent');
        modal.classList.add('active');
        currentJobId = jobId;

        // Fetch both job details and notes
        const [jobResponse, notesResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/job/${jobId}`),
            fetch(`${API_BASE_URL}/admin/job/${jobId}/notes`)
        ]);

        if (!jobResponse.ok || !notesResponse.ok) {
            throw new Error(`HTTP error! status: ${jobResponse.status}`);
        }

        const job = await jobResponse.json();
        const notes = await notesResponse.json();

        content.innerHTML = `
            <div class="space-y-6">
                <!-- Close button -->
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold">Job Details: ${job.job_id}</h2>
                    <button onclick="closeJobDetail()" class="text-gray-500 hover:text-gray-700">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Job Info -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Status</h3>
                        <p class="mt-1 text-sm text-gray-900">${job.status}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">User</h3>
                        <p class="mt-1 text-sm text-gray-900">${job.user}</p>
                    </div>
                </div>

                <!-- Videos -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500 mb-2">Original Video</h3>
                        <video controls class="w-full">
                            <source src="${job.video_url}" type="video/mp4">
                        </video>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500 mb-2">Translated Video</h3>
                        <video controls class="w-full">
                            <source src="${job.translated_video_url}" type="video/mp4">
                        </video>
                    </div>
                </div>

                <!-- Transcripts -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500 mb-2">Original Transcript</h3>
                        <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded">${job.transcripts.original}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500 mb-2">Translated Transcript</h3>
                        <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded">${job.transcripts.translated || 'Not available'}</p>
                    </div>
                </div>

                <!-- Runtime Config -->
                <div>
                    <h3 class="text-sm font-medium text-gray-500 mb-2">Runtime Configuration</h3>
                    <pre class="text-sm text-gray-900 bg-gray-50 p-3 rounded">${JSON.stringify(job.runtime_config, null, 2)}</pre>
                </div>

                <!-- Notes Section -->
                <div class="border-t pt-4">
                    <h3 class="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    
                    <!-- Existing Notes -->
                    <div class="space-y-2 mb-4" id="notesList">
                        ${notes.map(note => `
                            <div class="bg-gray-50 p-3 rounded">
                                <p class="text-sm text-gray-900">${note.content}</p>
                                <p class="text-xs text-gray-500 mt-1">${new Date(note.timestamp).toLocaleString()}</p>
                            </div>
                        `).join('') || '<p class="text-sm text-gray-500">No notes yet</p>'}
                    </div>

                    <!-- Add Note Form -->
                    <div class="mt-4">
                        <textarea 
                            id="newNote" 
                            class="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500" 
                            rows="2" 
                            placeholder="Add a note..."></textarea>
                        <button 
                            onclick="addNote('${job.job_id}')" 
                            class="mt-2 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            Add Note
                        </button>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading job details:', error);
    }
}

let currentJobId = null;  // Track current job ID

async function loadNotes(jobId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/job/${jobId}/notes`);
        if (!response.ok) {
            throw new Error('Failed to load notes');
        }
        const notes = await response.json();

        const notesList = document.getElementById('notesList');
        if (notes.length === 0) {
            notesList.innerHTML = '<div class="text-gray-500">No notes yet</div>';
            return;
        }

        notesList.innerHTML = notes.map(note => `
            <div class="bg-gray-50 p-3 rounded">
                <div class="text-sm text-gray-500">
                    ${new Date(note.timestamp).toLocaleString()} - ${note.user}
                </div>
                <div class="mt-1">
                    ${note.content}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading notes:', error);
        document.getElementById('notesList').innerHTML =
            '<div class="text-red-500">Error loading notes</div>';
    }
}

async function addNote(jobId) {
    const noteInput = document.getElementById('newNote');
    const content = noteInput.value.trim();

    if (!content) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/job/${jobId}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Clear input and refresh notes
        noteInput.value = '';
        const notesResponse = await fetch(`${API_BASE_URL}/admin/job/${jobId}/notes`);
        const notes = await notesResponse.json();

        // Update notes list
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = notes.map(note => `
            <div class="bg-gray-50 p-3 rounded">
                <p class="text-sm text-gray-900">${note.content}</p>
                <p class="text-xs text-gray-500 mt-1">${new Date(note.timestamp).toLocaleString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error adding note:', error);
    }
}

function closeJobDetail() {
    const modal = document.getElementById('jobDetailModal');
    modal.classList.remove('active');
}
