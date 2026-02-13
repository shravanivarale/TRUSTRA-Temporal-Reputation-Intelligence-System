@echo off
echo Starting TRUSTRA Services (No-Docker Mode)...

echo Installing Data Generator Dependencies...
pip install faker

echo Generating Synthetic Data...
python data-simulation/generator.py

echo Starting Services...
start "Backend Server" cmd /k "cd backend && npm install && node server.js"
start "ML Service" cmd /k "cd ml-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"
start "Graph Service" cmd /k "cd graph-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8001"
start "Frontend" cmd /k "cd frontend && npm run dev"

echo All services started!
pause
