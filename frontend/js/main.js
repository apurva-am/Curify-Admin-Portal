const jobList = new JobList();

// Load jobs when page loads
document.addEventListener('DOMContentLoaded', () => {
    jobList.loadJobs();
});

function showJobDetail(jobId) {
    // Implementation will come later
    console.log('Showing job detail for:', jobId);
}