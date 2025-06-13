# Curify Admin Portal

A web-based admin dashboard for managing translation jobs with video processing capabilities.

## Features

- **Job Management**: View, filter, and manage translation jobs
- **Job Comparison**: Compare multiple jobs side-by-side with video playback
- **Notes System**: Add and manage notes for each job
- **Statistics Dashboard**: View job statistics and analytics
- **Video Processing**: Handle original and translated video files
- **Real-time Updates**: Live status updates for jobs

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server
- **Python 3.7+**: Core language

### Frontend
- **HTML5/CSS3/JavaScript**: Core web technologies
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: No framework dependencies

## Project Structure

```
Curify Admin Portal/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   └── __init__.py
│   └── static/              # Static files (videos, etc.)
├── frontend/
│   ├── index.html           # Main HTML file
│   ├── css/
│   │   └── styles.css       # Custom styles
│   └── js/
│       ├── main.js          # Main JavaScript
│       ├── api.js           # API communication
│       ├── jobList.js       # Job list functionality
│       └── stats.js         # Statistics functionality
├── venv/                    # Python virtual environment
├── .gitignore
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Curify Admin Portal"
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install fastapi uvicorn python-multipart
   ```

4. **Start the backend server**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
   
   The backend will be available at `http://localhost:8000`

### Frontend Setup

You have two options to run the frontend:

#### Option 1: Using Python HTTP Server (Recommended)
```bash
cd frontend
python -m http.server 3000
```

#### Option 2: Using Node.js (if you have npm installed)
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Start the backend server** (see Backend Setup above)
2. **Start the frontend server** (see Frontend Setup above)
3. **Open your browser** and navigate to `http://localhost:3000`

### Key Features

- **Job List**: View all translation jobs with filtering and sorting options
- **Job Comparison**: Select multiple jobs using checkboxes and click "Compare Selected" to view side-by-side comparison
- **Notes**: Click on any job to add, edit, or delete notes
- **Statistics**: View job statistics on the main dashboard

## API Endpoints

### Jobs
- `GET /jobs` - Get all jobs
- `GET /jobs/{job_id}` - Get specific job details
- `POST /jobs/{job_id}/compare` - Compare multiple jobs

### Notes
- `GET /jobs/{job_id}/notes` - Get notes for a job
- `POST /jobs/{job_id}/notes` - Add a note to a job
- `PUT /jobs/{job_id}/notes/{note_id}` - Update a note
- `DELETE /jobs/{job_id}/notes/{note_id}` - Delete a note

### Statistics
- `GET /stats` - Get job statistics

## Configuration

### CORS Settings
The backend is configured to allow requests from:
- `http://localhost:3000` (Frontend development server)
- `http://localhost:8000` (Backend server)

To add production domains, modify the `origins` list in `backend/app/main.py`.

### Rate Limiting
- Note operations are rate-limited to prevent abuse
- Maximum 100 requests per minute per IP

## Development

### Adding New Features
1. Backend changes go in `backend/app/main.py`
2. Frontend changes go in the respective `frontend/js/` files
3. Styling changes go in `frontend/css/styles.css`

### Testing
- Backend: The API includes built-in FastAPI documentation at `http://localhost:8000/docs`
- Frontend: Open browser developer tools for debugging

## Security Features

- **Input Validation**: All user inputs are validated
- **HTML Sanitization**: Notes are sanitized to prevent XSS
- **Rate Limiting**: API endpoints are rate-limited
- **CORS Protection**: Configured for specific origins only

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
