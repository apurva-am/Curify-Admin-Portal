const API_BASE_URL = 'http://localhost:8000';

// Helper function to sanitize HTML content
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

const api = {
    async getJobs() {
        const response = await fetch(`${API_BASE_URL}/admin/jobs`);
        if (!response.ok) throw new Error(`Failed to load jobs: ${response.status}`);
        return await response.json();
    },

    async getJob(jobId) {
        const response = await fetch(`${API_BASE_URL}/admin/job/${jobId}`);
        if (!response.ok) throw new Error(`Failed to load job: ${response.status}`);
        return await response.json();
    },

    async getJobNotes(jobId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/job/${jobId}/notes`);
            if (!response.ok) throw new Error(`Failed to load notes: ${response.status}`);
            const notes = await response.json();
            // Sanitize note content before returning
            return notes.map(note => ({
                ...note,
                content: sanitizeHTML(note.content)
            }));
        } catch (error) {
            console.error('Error loading notes:', error);
            throw error;
        }
    },

    async addJobNote(jobId, { content }) {
        if (!content || !content.trim()) {
            throw new Error('Note content cannot be empty');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/job/${jobId}/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: content.trim() })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Failed to add note: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding note:', error);
            throw error;
        }
    }
};

// Export the api object
export default api;