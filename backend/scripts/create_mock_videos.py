import requests
import os
import shutil

def download_sample_videos():
    # Sample video URLs (these are just examples, we'll need real sample videos)
    sample_videos = {
        "original1.mp4": "https://example.com/sample1.mp4",
        "translated1.mp4": "https://example.com/sample2.mp4",
        # Add more sample videos as needed
    }
    
    video_dir = "backend/static/videos"
    os.makedirs(video_dir, exist_ok=True)
    
    for filename, url in sample_videos.items():
        filepath = os.path.join(video_dir, filename)
        if not os.path.exists(filepath):
            try:
                response = requests.get(url)
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                print(f"Downloaded {filename}")
            except Exception as e:
                print(f"Error downloading {filename}: {e}")

def setup_sample_videos():
    # Create directories if they don't exist
    video_dir = os.path.join('backend', 'static', 'videos')
    os.makedirs(video_dir, exist_ok=True)
    
    # Create simple text files as placeholders for videos
    # (In a real application, these would be actual video files)
    sample_videos = [
        'sample1.mp4',
        'sample1_translated.mp4',
        'sample2.mp4',
        'sample2_translated.mp4'
    ]
    
    for video in sample_videos:
        video_path = os.path.join(video_dir, video)
        with open(video_path, 'w') as f:
            f.write('Sample video file')
    
    print("Sample video placeholders created in:", video_dir)

if __name__ == "__main__":
    download_sample_videos()
    setup_sample_videos()
