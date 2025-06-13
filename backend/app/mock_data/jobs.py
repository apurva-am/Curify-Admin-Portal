MOCK_JOBS = [
    {
        "job_id": "abc123",
        "user": "testuser",
        "status": "completed",
        "created_at": "2024-01-15T10:30:00Z",
        "video_url": "/mock/original1.mp4",
        "translated_video_url": "/mock/translated1.mp4",
        "transcripts": {
            "original": "Welcome to our product demonstration. Today we'll show you...",
            "translated": "Bienvenidos a nuestra demostración de producto. Hoy les mostraremos..."
        },
        "runtime_config": {
            "language": "es",
            "speed": 1.0,
            "voice_id": "es-female-1"
        },
        "notes": []
    },
    {
        "job_id": "def456",
        "user": "admin",
        "status": "in_progress",
        "created_at": "2024-01-15T11:00:00Z",
        "video_url": "/mock/original2.mp4",
        "translated_video_url": null,
        "transcripts": {
            "original": "Let's explore the new features of our software...",
            "translated": null
        },
        "runtime_config": {
            "language": "fr",
            "speed": 1.2,
            "voice_id": "fr-male-1"
        },
        "notes": []
    }
]