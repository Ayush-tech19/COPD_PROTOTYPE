# COPD Care Platform — Prototype

A simple MVP for COPD care with a **FastAPI backend** for risk prediction and a **HTML/CSS/JavaScript frontend** for the dashboard, prediction form, and doctor search.

### Home page link
viewproject[https://ayush-tech19.github.io/COPD_PROTOTYPE/frontend/index.html]

## 📁 Folder Structure

```text
copd-platform/
├── backend/
│   ├── main.py
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── predict.html
    ├── doctor.html
    ├── css/style.css
    └── js/
        ├── predict.js
        └── doctor.js
```

## 🚀 Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend: `http://127.0.0.1:8000`
API Docs: `http://127.0.0.1:8000/docs`

## 🌐 Frontend

Open `frontend/index.html` directly in a browser or use **VS Code Live Server**.

In `frontend/js/predict.js`, update `API_BASE_URL` when deploying the backend:

```javascript
const API_BASE_URL = "http://127.0.0.1:8000";
```

## 🩺 Doctor Search

* **Leaflet.js** for maps
* **OpenStreetMap** for map tiles
* **Nominatim** for location search
* Currently uses sample doctor data from `frontend/js/doctor.js`
* Can later be connected to a real backend/database

## 🤖 COPD Prediction

The prototype currently uses a **rule-based weighted scoring system** in `backend/main.py`.

It takes **13 parameters** and returns:

* Risk Score: `0–100`
* Risk Level: `Low / Moderate / High`

A trained **scikit-learn/Joblib model** can later replace `calculate_risk()` without changing the frontend API contract.

## 💬 WhatsApp

Each page includes a floating WhatsApp button. Replace the placeholder link in:

```text
index.html
predict.html
doctor.html
```

with your actual WhatsApp/Twilio link.

## ⚠️ Disclaimer

This is a **prototype/screening tool, not a medical diagnostic system**. The current risk model is not clinically validated. Real-world deployment requires a clinically validated model, proper medical evaluation, and appropriate disclaimers.

