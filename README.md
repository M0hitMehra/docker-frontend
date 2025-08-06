Gorgeous Notes Frontend
This is the frontend for the Gorgeous Notes application, built with React and Framer Motion. It provides a visually stunning, interactive interface for creating, editing, and managing notes, with features like dark/light mode, grid/list views, and advanced filtering. The frontend communicates with a backend API to persist notes.
Features

Glassmorphism UI with animated transitions and micro-interactions.
Dark/light mode toggle with local storage persistence.
Grid and list view modes for notes.
Search and filter notes by title, content, category, priority, and tags.
Create, edit, and delete notes with custom fields (priority, mood, tags, color).
Real-time notifications for user actions.
Responsive design for mobile and desktop.
Advanced features: stats panel, floating action button, keyboard shortcuts.
Client-side sorting by title, priority, or creation date.

Tech Stack

React
Framer Motion (animations)
CSS (with glassmorphism and custom styles)
JavaScript (ES6+)

Project Structure
client/
├── src/
│   ├── App.jsx         # Main React component
│   ├── index.js        # Entry point
│   ├── App.css         # Optional custom styles
│   └── ...             # Other React components and assets
├── Dockerfile          # Docker configuration
├── package.json        # Dependencies and scripts
├── .env                # Environment variables (optional, not tracked)
└── README.md           # This file

Prerequisites

Node.js (v14 or higher)
Docker (optional, for containerized setup)
Backend API (running at http://localhost:4000 or configured URL)
Git

Setup
1. Clone the Repository
Clone the repository and navigate to the client directory:
git clone https://github.com/your-username/gorgeous-notes.git
cd gorgeous-notes/client

2. Environment Variables (Optional)
If the backend API is hosted at a different URL, create a .env file in the client directory:
REACT_APP_API_URL=http://localhost:4000

Update App.jsx to use this variable for API requests:
const API_URL = process.env.REACT_APP_API_URL || '/api';

By default, the app uses /api to proxy requests to the backend.
3. Install Dependencies
Install the required Node.js dependencies:
npm install

4. Running Locally
Start the React development server:
npm start

The frontend will run on http://localhost:3000. Ensure the backend is running at http://localhost:4000 (or the configured URL).
5. Running with Docker
Ensure Docker is installed. The docker-compose.yml in the parent directory includes the client service. If running standalone, use the Dockerfile in the client directory:
docker build -t gorgeous-notes-client .
docker run -p 8080:80 gorgeous-notes-client

Alternatively, use the docker-compose.yml from the parent directory:
services:
  client:
    build: ./client
    container_name: react_app
    ports:
      - 8080:80
    depends_on:
      - server

Run with:
docker-compose up --build

The frontend will be accessible at http://localhost:8080.
Usage

Access the App:

Open http://localhost:8080 in your browser.
The app fetches notes from the backend API.


Create a Note:

Fill in the title, content, and optional fields (category, priority, mood, tags, color).
Click "Create Note" (or "Update Note" when editing).


Edit a Note:

Click a note to populate the form with its details.
Modify fields and click "Update Note".


Delete a Note:

Click the delete button (🗑️) on a note.
Confirm deletion in the modal.


Search and Filter:

Use the search bar to find notes by title, content, or tags.
Filter by category or priority using the dropdowns or buttons.
Sort by latest, title, or priority.


Toggle Views and Modes:

Switch between grid and list view.
Toggle dark/light mode.
View stats (total notes, categories, high-priority notes, filtered count).



Troubleshooting

API Connection Issues:

Ensure the backend is running at http://localhost:4000 (or the configured URL).
Check the browser console for network errors (e.g., 404, CORS).
Verify the API_URL in App.jsx or .env matches the backend.


Styling Issues:

Ensure App.css (if used) or inline styles are correctly applied.
Check for missing dependencies (e.g., Framer Motion).


Docker Issues:

Rebuild containers: docker-compose up --build.
Check logs: docker logs react_app.
Ensure port 8080 is not in use.



Contributing

Fork the repository.
Create a feature branch: git checkout -b feature-name.
Commit changes: git commit -m "Add feature".
Push to the branch: git push origin feature-name.
Open a pull request.

License
This project is licensed under the MIT License.