// -----------------------------------------
// COPD Prediction Page Logic
// -----------------------------------------

// IMPORTANT: Apna backend URL yahan set karo.
// Local testing: http://127.0.0.1:8000
// Deployed: apna server ka URL daal dena.
const API_BASE_URL = "http://127.0.0.1:8000";

const form = document.getElementById("predictForm");
const submitBtn = document.getElementById("submitBtn");
const resultBox = document.getElementById("resultBox");
const errorBox = document.getElementById("errorBox");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorBox.classList.remove("show");
  resultBox.classList.remove("show");

  const payload = {
    age: Number(document.getElementById("age").value),
    gender: document.getElementById("gender").value,
    smoking_status: document.getElementById("smoking_status").value,
    pack_years: Number(document.getElementById("pack_years").value),
    biomass_fuel_exposure: document.getElementById("biomass_fuel_exposure").checked,
    occupational_dust_exposure: document.getElementById("occupational_dust_exposure").checked,
    fev1_percent: Number(document.getElementById("fev1_percent").value),
    fev1_fvc_ratio: Number(document.getElementById("fev1_fvc_ratio").value),
    chronic_cough: document.getElementById("chronic_cough").checked,
    sputum_production: document.getElementById("sputum_production").checked,
    wheezing: document.getElementById("wheezing").checked,
    mmrc_dyspnea_scale: Number(document.getElementById("mmrc_dyspnea_scale").value),
    respiratory_infections_last_year: Number(document.getElementById("respiratory_infections_last_year").value),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Predicting...";

  try {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.detail ? JSON.stringify(errData.detail) : "Prediction failed");
    }

    const data = await res.json();
    showResult(data);
  } catch (err) {
    errorBox.textContent = "Error: " + err.message + " — kya backend chal raha hai (uvicorn)?";
    errorBox.classList.add("show");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Predict Risk";
  }
});

function showResult(data) {
  document.getElementById("resultScore").textContent = `${data.risk_score}%`;

  const levelEl = document.getElementById("resultLevel");
  levelEl.textContent = data.risk_level;
  levelEl.className = "result-level";
  if (data.risk_level === "Low Risk") levelEl.classList.add("level-low");
  else if (data.risk_level === "Moderate Risk") levelEl.classList.add("level-moderate");
  else levelEl.classList.add("level-high");

  const list = document.getElementById("factorsList");
  list.innerHTML = "";
  data.key_factors.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f;
    list.appendChild(li);
  });

  document.getElementById("disclaimerText").textContent = data.disclaimer;
  resultBox.classList.add("show");
  resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
