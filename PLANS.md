# Deployment Plans (Tokyo Region)

This file contains three detailed plans:

1) Code changes to support public deployment
2) AWS setup steps (Tokyo region)
3) Post-setup debugging and go-live validation

---

## Plan 1: Code Changes (Frontend + Backend)

Goal: Replace hardcoded localhost URLs with environment variables so local and public
deployments both work without code changes.

### Frontend (Vue + Vite)

- File: `frontend/src/App.vue`
  - Replace the hardcoded Socket.IO URL:
    - Before: `const socket = io('http://localhost:3000');`
    - After: `const socket = io(import.meta.env.VITE_SOCKET_URL);`
  - Optional: if `VITE_SOCKET_URL` is empty, show a simple error message.

- Optional: add a sample env file for local development
  - File: `frontend/.env.example`
    - `VITE_SOCKET_URL=http://localhost:3000`

### Backend (Express + Socket.IO)

- File: `backend/server.js`
  - Replace the hardcoded CORS origin:
    - Before: `origin: "http://localhost:5173"`
    - After: `origin: process.env.CORS_ORIGIN`
  - Ensure `app.use(cors())` matches the Socket.IO origin policy.
  - Optional: allow comma-separated origins in `CORS_ORIGIN`.

- Optional: add a sample env file
  - File: `backend/.env.example`
    - `PORT=3000`
    - `CORS_ORIGIN=http://localhost:5173`

### Local/Prod Behavior

- Local: set `VITE_SOCKET_URL` and `CORS_ORIGIN` to localhost values.
- Production: set them to the public Amplify/Elastic Beanstalk URLs.

---

## Plan 2: AWS Setup (Tokyo Region, ap-northeast-1)

Target architecture: Amplify Hosting (frontend) + Elastic Beanstalk (backend).

### Backend: Elastic Beanstalk (Node.js)

1) Create a new EB application in Tokyo (ap-northeast-1).
2) Create a Node.js environment and deploy the `backend` folder.
3) Configure environment variables:
   - `PORT=3000` (or let EB inject it)
   - `CORS_ORIGIN=https://<your-frontend>.amplifyapp.com`
4) Ensure the environment health is Green.
5) Note the backend URL:
   - `https://<your-backend>.ap-northeast-1.elasticbeanstalk.com`

### Frontend: Amplify Hosting

1) Create a new Amplify app in Tokyo.
2) Connect the repo (or upload build artifacts).
3) Build settings:
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Output directory: `dist`
4) Configure environment variables:
   - `VITE_SOCKET_URL=https://<your-backend>.ap-northeast-1.elasticbeanstalk.com`
5) Deploy and note the frontend URL:
   - `https://<your-frontend>.amplifyapp.com`

---

## Plan 3: Post-Setup Debugging and Go-Live Validation

Goal: Verify frontend and backend are connected, WebSocket works, and core features
are stable.

### Connectivity Checks

1) Open the frontend URL and open DevTools Console.
2) Check for Socket.IO connection errors.

### Backend Health

1) Visit `https://<backend>/api/dishes` and confirm JSON response.
2) Check Elastic Beanstalk logs for errors or CORS issues.

### WebSocket Verification

1) Create a room in one browser.
2) Join the room from another browser/device.
3) Confirm the WebSocket connection in Network panel.

### Feature Validation

1) Swipe and confirm matches appear for both users.
2) Confirm match overlay displays correctly.
3) Reset room and confirm state resets for both users.

### Common Issues

- CORS origin mismatch (frontend URL not matching backend config).
- `VITE_SOCKET_URL` not injected (must rebuild frontend after changing).
- EB environment unhealthy (check logs and Node runtime version).

