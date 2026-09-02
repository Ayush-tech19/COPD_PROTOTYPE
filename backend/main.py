"""
COPD Risk Prediction - FastAPI Backend
----------------------------------------
Simple, MVP-level backend. Ek hi endpoint hai jo 13 parameters leta hai
aur ek rule-based weighted-scoring model se COPD risk nikalta hai.

NOTE: Ye ek prototype scoring model hai, real trained ML model nahi.
Baad me isko sklearn/joblib model se replace karna easy hai —
sirf `calculate_risk()` function ko replace karna hoga.

Run karne ke liye:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal

app = FastAPI(title="COPD Risk Prediction API", version="1.0.0")

# Frontend alag origin se call karega (file:// ya localhost:xxxx),
# isliye CORS sabke liye open rakha hai (prototype ke liye theek hai).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Request Schema: 13 Parameters ----------
class COPDInput(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Patient age in years")
    gender: Literal["male", "female", "other"]
    smoking_status: Literal["never", "former", "current"]
    pack_years: float = Field(..., ge=0, description="Smoking pack-years (0 if never smoked)")
    biomass_fuel_exposure: bool = Field(..., description="Chulha/wood/coal smoke exposure")
    occupational_dust_exposure: bool = Field(..., description="Dust/chemical/fumes at work")
    fev1_percent: float = Field(..., ge=0, le=150, description="FEV1 % predicted (spirometry)")
    fev1_fvc_ratio: float = Field(..., ge=0, le=1, description="FEV1/FVC ratio (e.g. 0.65)")
    chronic_cough: bool
    sputum_production: bool
    wheezing: bool
    mmrc_dyspnea_scale: int = Field(..., ge=0, le=4, description="mMRC breathlessness scale 0-4")
    respiratory_infections_last_year: int = Field(..., ge=0, description="Count of chest infections in last 12 months")


class COPDOutput(BaseModel):
    risk_score: float
    risk_level: str
    key_factors: list[str]
    disclaimer: str


# ---------- Scoring Logic ----------
def calculate_risk(data: COPDInput) -> COPDOutput:
    score = 0.0
    factors = []

    # Age
    if data.age >= 60:
        score += 15
        factors.append("Age 60+")
    elif data.age >= 40:
        score += 8

    # Smoking
    if data.smoking_status == "current":
        score += 20
        factors.append("Current smoker")
    elif data.smoking_status == "former":
        score += 12
        factors.append("Former smoker")

    # Pack years
    if data.pack_years >= 20:
        score += 15
        factors.append(f"High pack-years ({data.pack_years})")
    elif data.pack_years >= 10:
        score += 8

    # Exposures
    if data.biomass_fuel_exposure:
        score += 8
        factors.append("Biomass fuel exposure")
    if data.occupational_dust_exposure:
        score += 7
        factors.append("Occupational dust/fumes exposure")

    # Spirometry - most important clinical markers
    if data.fev1_fvc_ratio < 0.7:
        score += 20
        factors.append(f"FEV1/FVC ratio low ({data.fev1_fvc_ratio})")
    if data.fev1_percent < 50:
        score += 15
        factors.append(f"FEV1% severely reduced ({data.fev1_percent}%)")
    elif data.fev1_percent < 80:
        score += 8

    # Symptoms
    if data.chronic_cough:
        score += 5
        factors.append("Chronic cough")
    if data.sputum_production:
        score += 5
        factors.append("Sputum production")
    if data.wheezing:
        score += 5
        factors.append("Wheezing")

    # mMRC scale
    if data.mmrc_dyspnea_scale >= 3:
        score += 10
        factors.append(f"High mMRC dyspnea scale ({data.mmrc_dyspnea_scale})")
    elif data.mmrc_dyspnea_scale >= 1:
        score += 4

    # Infections
    if data.respiratory_infections_last_year >= 2:
        score += 7
        factors.append("Frequent chest infections")

    score = min(round(score, 1), 100.0)

    if score >= 65:
        level = "High Risk"
    elif score >= 35:
        level = "Moderate Risk"
    else:
        level = "Low Risk"

    return COPDOutput(
        risk_score=score,
        risk_level=level,
        key_factors=factors if factors else ["No significant risk factors detected"],
        disclaimer="Ye ek prototype AI screening tool hai, medical diagnosis nahi. Please consult a pulmonologist.",
    )


@app.get("/")
def root():
    return {"message": "COPD Risk Prediction API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=COPDOutput)
def predict(data: COPDInput):
    return calculate_risk(data)
