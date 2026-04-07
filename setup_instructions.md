# Running the Smart NLP Expense Intelligence System

This application includes a Python FastAPI backend and a React (Vite) frontend.

## Prerequisites

1. **Python 3.9+**
2. **Node.js 18+**
3. **Tesseract-OCR** (Crucial for Receipt Image Analysis)

### Installing Tesseract on Windows
1. Download the Tesseract installer: [Tesseract at UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
2. Run the executable and install (Default paths usually `C:\Program Files\Tesseract-OCR`)
3. Open your backend `nlp/ocr.py` file, and uncomment and configure the `pytesseract.pytesseract.tesseract_cmd` path if PyTesseract throws a "Not in PATH" error.

## 1. Starting the Backend

Open a terminal in the root project folder:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

*(Note: Installing Spacy and Transformers for the first time may take a few minutes as it downloads the ML models)*

**Seed Database (Optional but recommended):**
```bash
python seed.py
```

**Run Server:**
```bash
uvicorn main:app --reload
```
The backend API will run on `http://localhost:8000`.

## 2. Starting the Frontend

Open a **new** terminal in the root project folder:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

## Test Credentials

* **Admin:** `admin@vit.edu` (pw: `password`)
* **Faculty:** `faculty@vit.edu` (pw: `password`)
* **Accountant:** `accountant@vit.edu` (pw: `password`)
