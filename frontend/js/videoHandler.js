// frontend/js/videoHandler.js
async function uploadVideo(jobId, file, isTranslated = false) {
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = isTranslated ? 
        `${API_BASE_URL}/admin/job/${jobId}/upload/translated` :
        `${API_BASE_URL}/admin/job/${jobId}/upload/original`;
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Video upload failed');
        }
        
        const data = await response.json();
        return data.video_url;
    } catch (error) {
        console.error('Error uploading video:', error);
        throw error;
    }
}

function addVideoUploadControls(jobId) {
    return `
        <div class="mt-4 space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Upload Original Video</label>
                <input type="file" 
                       accept="video/*" 
                       onchange="handleVideoUpload(event, '${jobId}', false)"
                       class="mt-1 block w-full">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Upload Translated Video</label>
                <input type="file" 
                       accept="video/*" 
                       onchange="handleVideoUpload(event, '${jobId}', true)"
                       class="mt-1 block w-full">
            </div>
        </div>
    `;
}

async function handleVideoUpload(event, jobId, isTranslated) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const videoUrl = await uploadVideo(jobId, file, isTranslated);
        // Refresh job detail view
        await viewJob(jobId);
    } catch (error) {
        alert('Error uploading video: ' + error.message);
    }
}