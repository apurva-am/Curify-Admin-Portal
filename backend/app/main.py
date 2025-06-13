from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from typing import Dict, List
from pydantic import BaseModel, validator
import os
from collections import Counter, defaultdict
import time

class Note(BaseModel):
    content: str

    @validator('content')
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError('Note content cannot be empty')
        if len(v.strip()) > 1000:  # Limit note length
            raise ValueError('Note content too long (max 1000 characters)')
        return v.strip()

app = FastAPI(title="Curify Admin Portal")

# Enable CORS with specific origins
origins = [
    "http://localhost:3000",  # Development frontend
    "http://localhost:8000",  # Development backend
    # Add your production domains here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Mock data with pre-existing videos
MOCK_JOBS = [
    {
        "job_id": "abc123",
        "user": "john_doe",
        "status": "completed",
        "created_at": "2024-01-15T04:30:00Z",
        "video_url": "/static/videos/sample1.mp4",
        "translated_video_url": "/static/videos/sample1_translated.mp4",
        "transcripts": {"original": "Hello world", "translated": "Hola mundo"},
        "runtime_config": {"language": "es", "speed": 1.0, "voice_id": "xyz"}
    },
    {
        "job_id": "def456",
        "user": "jane_smith",
        "status": "in_progress",
        "created_at": "2024-01-16T03:15:00Z",
        "video_url": "/static/videos/sample2.mp4",
        "translated_video_url": None,
        "transcripts": {"original": "Good morning", "translated": None},
        "runtime_config": {"language": "fr", "speed": 1.2, "voice_id": "abc"}
    },
    {
        "job_id": "ghi789",
        "user": "bob_wilson",
        "status": "failed",
        "created_at": "2024-01-17T05:00:00Z",
        "video_url": "/static/videos/sample3.mp4",
        "translated_video_url": None,
        "transcripts": {"original": "Testing", "translated": None},
        "runtime_config": {"language": "de", "speed": 0.9, "voice_id": "def"}
    }
]

# Validate and mount static directory for serving sample videos
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)
app.mount("/static", StaticFiles(directory=STATIC_DIR, check_dir=True), name="static")

# Store notes in memory
JOB_NOTES: Dict[str, List[dict]] = {}

# Rate limiting configuration
RATE_LIMIT_DURATION = timedelta(minutes=1)  # 1 minute window
MAX_REQUESTS = 100  # Maximum requests per window
request_history: Dict[str, List[float]] = defaultdict(list)

def is_rate_limited(client_ip: str) -> bool:
    now = time.time()
    # Remove old requests
    request_history[client_ip] = [
        req_time for req_time in request_history[client_ip]
        if now - req_time < RATE_LIMIT_DURATION.total_seconds()
    ]
    # Check if too many requests
    if len(request_history[client_ip]) >= MAX_REQUESTS:
        return True
    # Add current request
    request_history[client_ip].append(now)
    return False

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    if is_rate_limited(client_ip):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."}
        )
    return await call_next(request)

@app.get("/admin/jobs")
def get_jobs():
    return JSONResponse(content=MOCK_JOBS)

@app.get("/admin/job/{job_id}")
def get_job(job_id: str):
    if not job_id:
        raise HTTPException(status_code=400, detail="Job ID is required")
    
    job = next((job for job in MOCK_JOBS if job["job_id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.get("/admin/job/{job_id}/notes")
async def get_job_notes(job_id: str, request: Request):
    """Get all notes for a specific job"""
    if not job_id:
        raise HTTPException(status_code=400, detail="Job ID is required")
    
    # Rate limiting check
    if is_rate_limited(request.client.host):
        raise HTTPException(status_code=429, detail="Too many requests")
    
    # Verify job exists
    job = next((job for job in MOCK_JOBS if job["job_id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    try:
        if job_id not in JOB_NOTES:
            JOB_NOTES[job_id] = []
        return JOB_NOTES[job_id]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/admin/job/{job_id}/notes")
async def add_job_note(job_id: str, note: Note, request: Request):
    """Add a new note to a job"""
    if not job_id:
        raise HTTPException(status_code=400, detail="Job ID is required")
    
    # Rate limiting check
    if is_rate_limited(request.client.host):
        raise HTTPException(status_code=429, detail="Too many requests")
    
    # Verify job exists
    job = next((job for job in MOCK_JOBS if job["job_id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    try:
        if job_id not in JOB_NOTES:
            JOB_NOTES[job_id] = []
        
        # Check if too many notes for this job
        if len(JOB_NOTES[job_id]) >= 100:  # Limit number of notes per job
            raise HTTPException(
                status_code=400,
                detail="Maximum number of notes reached for this job"
            )
        
        new_note = {
            "id": f"note_{len(JOB_NOTES[job_id]) + 1}",
            "content": note.content,
            "timestamp": datetime.now().isoformat(),
            "user": "admin"  # In a real app, this would come from authentication
        }
        
        JOB_NOTES[job_id].append(new_note)
        return new_note
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/admin/job-stats")
def get_job_stats():
    """Get statistics about all jobs"""
    try:
        total_jobs = len(MOCK_JOBS)
        
        # Status distribution
        status_counts = Counter(job["status"] for job in MOCK_JOBS)
        
        # Language distribution
        language_counts = Counter(job["runtime_config"]["language"] for job in MOCK_JOBS)
        
        # Calculate average processing times (mock data)
        completed_jobs = [job for job in MOCK_JOBS if job["status"] == "completed"]
        avg_processing_time = 120  # mock value in seconds
        
        return {
            "total_jobs": total_jobs,
            "status_distribution": dict(status_counts),
            "language_distribution": dict(language_counts),
            "performance_metrics": {
                "avg_processing_time": avg_processing_time,
                "completed_jobs_count": len(completed_jobs),
                "success_rate": round((len(completed_jobs) / total_jobs) * 100, 2) if total_jobs > 0 else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating job statistics: {str(e)}")