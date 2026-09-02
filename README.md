# COPD Care Platform — Prototype

Simple MVP: FastAPI backend (prediction) + plain HTML/CSS/JS frontend
(dashboard, prediction form, doctor search on OpenStreetMap).

## Folder Structure
```
copd-platform/
├── backend/
│   ├── main.py           # FastAPI app with /predict endpoint
│   └── requirements.txt
└── frontend/
    ├── index.html         # Dashboard (2 feature cards)
    ├── predict.html        # 13-parameter COPD prediction form
    ├── doctor.html          # OSM map + doctor search
    ├── css/style.css
    └── js/
        ├── predict.js
        └── doctor.js
```

## 1. Backend chalane ke liye (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend chalu ho jayega: http://127.0.0.1:8000
API docs (auto-generated): http://127.0.0.1:8000/docs

## 2. Frontend chalane ke liye
`frontend/` folder ke andar `index.html` ko directly browser me kholo,
ya VSCode Live Server extension use karo. Koi build step nahi chahiye —
pure HTML/CSS/JS hai.

**Important:** `frontend/js/predict.js` file me `API_BASE_URL` variable
check kar lena — abhi `http://127.0.0.1:8000` set hai (local backend).
Jab backend deploy karoge (Render/Railway/VPS), yahan wo URL daal dena.

## 3. WhatsApp Button
Har page par bottom-right corner me static WhatsApp floating button hai.
Ye currently `https://wa.me/910000000000?text=...` link use kar raha hai.

Apna Twilio WhatsApp number/link daalne ke liye, teeno HTML files
(`index.html`, `predict.html`, `doctor.html`) me ye line dhundo:
```html
<a href="https://wa.me/910000000000?text=..." class="whatsapp-float" ...>
```
Aur apna actual Twilio WhatsApp link/number wahan replace kar dena.

## 4. Doctor Search
- Map: Leaflet.js + OpenStreetMap tiles (free, no API key)
- Location search: Nominatim geocoding API (free, no API key)
- Doctor data: abhi static sample list hai (`frontend/js/doctor.js` me
  `DOCTORS` array) — baad me isko real backend API/database se connect
  kar sakte ho jab real doctor data ho.

## 5. COPD Prediction Model
Abhi `backend/main.py` me `calculate_risk()` ek rule-based weighted
scoring function hai — 13 parameters ko clinically-reasonable weights
dekar risk score (0-100) aur risk level (Low/Moderate/High) nikalta hai.

Jab tumhare paas trained ML model (sklearn/joblib) ho, sirf
`calculate_risk()` function ko replace karna hoga — baaki sab same
rahega (API contract same hi rahega, frontend me koi change nahi
chahiye hoga).

## Disclaimer
Ye ek prototype/screening tool hai, medical diagnosis nahi. Real
deployment se pehle clinically validated model aur proper disclaimers
add karna zaroori hai.
