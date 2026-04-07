@echo off
echo ==========================================
echo       Starting VoiceKhata Server
echo ==========================================


echo [1/3] Checking environment and installing dependencies...
if not exist "backend\venv" (
    echo Creating virtual environment...
    py -m venv backend\venv
)
call backend\venv\Scripts\activate
pip install -r backend\requirements.txt --quiet --disable-pip-version-check
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install dependencies. Check your python/pip installation.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/3] NLP Models loaded (Ensuring Spacy models).
python -m spacy download en_core_web_sm --quiet

echo [3/3] Starting Data Engine and API Services...
echo Available locally at: http://localhost:8000
echo.
uvicorn backend.main:app --reload --port 8000
