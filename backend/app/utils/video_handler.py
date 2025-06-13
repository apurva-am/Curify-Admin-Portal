import os
from typing import Optional
import shutil
from fastapi import UploadFile
from pathlib import Path

class VideoHandler:
    def __init__(self, upload_dir: str):
        self.upload_dir = upload_dir
        Path(upload_dir).mkdir(parents=True, exist_ok=True)
    
    async def save_video(self, file: UploadFile, job_id: str, is_translated: bool = False) -> str:
        """Save uploaded video and return the file path"""
        prefix = "translated" if is_translated else "original"
        filename = f"{prefix}_{job_id}.mp4"
        file_path = os.path.join(self.upload_dir, filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            return f"/static/videos/{filename}"
        except Exception as e:
            raise Exception(f"Failed to save video: {str(e)}")
    
    def get_video_path(self, job_id: str, is_translated: bool = False) -> Optional[str]:
        """Get the path for a video file"""
        prefix = "translated" if is_translated else "original"
        filename = f"{prefix}_{job_id}.mp4"
        file_path = os.path.join(self.upload_dir, filename)
        
        if os.path.exists(file_path):
            return f"/static/videos/{filename}"
        return None
