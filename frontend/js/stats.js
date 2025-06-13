async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/job-stats`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();
        renderStats(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function renderStats(stats) {
    const statsContainer = document.getElementById('statsContainer');

    // Create status distribution chart data
    const statusData = {
        labels: Object.keys(stats.status_distribution),
        datasets: [{
            label: 'Jobs by Status',
            data: Object.values(stats.status_distribution),
            backgroundColor: [
                'rgb(34, 197, 94)',  // green for completed
                'rgb(234, 179, 8)',  // yellow for in_progress
                'rgb(239, 68, 68)'   // red for failed
            ]
        }]
    };

    // Create language distribution chart data
    const languageData = {
        labels: Object.keys(stats.language_distribution),
        datasets: [{
            label: 'Jobs by Language',
            data: Object.values(stats.language_distribution),
            backgroundColor: [
                'rgb(59, 130, 246)',
                'rgb(168, 85, 247)',
                'rgb(236, 72, 153)'
            ]
        }]
    };

    statsContainer.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div class="bg-white rounded shadow p-4">
                <h3 class="text-sm font-medium text-gray-500">Total Jobs</h3>
                <p class="text-lg font-semibold text-blue-600">${stats.total_jobs}</p>
            </div>
            <div class="bg-white rounded shadow p-4">
                <h3 class="text-sm font-medium text-gray-500">Success Rate</h3>
                <p class="text-lg font-semibold text-green-600">${stats.performance_metrics.success_rate.toFixed(1)}%</p>
            </div>
            <div class="bg-white rounded shadow p-4">
                <h3 class="text-sm font-medium text-gray-500">Completed Jobs</h3>
                <p class="text-lg font-semibold text-purple-600">${stats.performance_metrics.completed_jobs_count}</p>
            </div>
            <div class="bg-white rounded shadow p-4">
                <h3 class="text-sm font-medium text-gray-500">Avg. Processing Time</h3>
                <p class="text-lg font-semibold text-orange-600">${stats.performance_metrics.avg_processing_time}s</p>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-white rounded shadow p-4">
                <h3 class="text-sm font-medium text-gray-500 mb-2 text-center">Status Distribution</h3>
                <div class="h-64 flex items-center justify-center">
                    <div class="w-56 h-56">
                        <canvas id="statusChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded shadow p-4">
                <h3 class="text-sm font-medium text-gray-500 mb-2 text-center">Language Distribution</h3>
                <div class="h-64 flex items-center justify-center">
                    <div class="w-56 h-56">
                        <canvas id="languageChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize charts with updated options
    new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: statusData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        },
                        boxWidth: 12,
                        padding: 15
                    }
                }
            },
            layout: {
                padding: {
                    bottom: 25
                }
            }
        }
    });

    new Chart(document.getElementById('languageChart'), {
        type: 'doughnut',
        data: languageData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        },
                        boxWidth: 12,
                        padding: 15
                    }
                }
            },
            layout: {
                padding: {
                    bottom: 25
                }
            }
        }
    });
}

// Load stats when the page loads
document.addEventListener('DOMContentLoaded', loadStats);
