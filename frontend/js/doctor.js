// -----------------------------------------
// Doctor Search Page Logic
// Map: Leaflet.js + OpenStreetMap tiles
// Geocoding: Nominatim (OSM) — free, no API key needed
// Doctor data: STATIC sample list (prototype).
//   -> Baad me isko real backend API / database se replace kar sakte ho.
// -----------------------------------------

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Static sample doctors (India-wide spread, for prototype/demo)
const DOCTORS = [
  { name: "Dr. R. Sharma — Pulmonologist", clinic: "City Chest Care Clinic", city: "Kota, Rajasthan", lat: 25.2138, lng: 75.8648, phone: "+91 90000 00001" },
  { name: "Dr. A. Verma — Chest Specialist", clinic: "Lung Health Center", city: "Jaipur, Rajasthan", lat: 26.9124, lng: 75.7873, phone: "+91 90000 00002" },
  { name: "Dr. S. Gupta — Pulmonologist", clinic: "Breathe Easy Hospital", city: "Delhi", lat: 28.6139, lng: 77.2090, phone: "+91 90000 00003" },
  { name: "Dr. N. Iyer — Respiratory Medicine", clinic: "Apollo Chest Clinic", city: "Mumbai, Maharashtra", lat: 19.0760, lng: 72.8777, phone: "+91 90000 00004" },
  { name: "Dr. K. Reddy — Pulmonologist", clinic: "Sunrise Lung Care", city: "Hyderabad, Telangana", lat: 17.3850, lng: 78.4867, phone: "+91 90000 00005" },
  { name: "Dr. P. Nair — Chest Physician", clinic: "Green Valley Hospital", city: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946, phone: "+91 90000 00006" },
];

let map;
let markers = [];

function initMap() {
  // Default center: India
  map = L.map("map").setView([22.9734, 78.6569], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  plotDoctors(DOCTORS);
}

function clearMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
}

function plotDoctors(list) {
  clearMarkers();
  list.forEach((doc) => {
    const marker = L.marker([doc.lat, doc.lng])
      .addTo(map)
      .bindPopup(`<b>${doc.name}</b><br>${doc.clinic}<br>${doc.city}`);
    markers.push(marker);
  });
  renderDoctorList(list);
}

function renderDoctorList(list) {
  const container = document.getElementById("doctorList");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p>Koi doctor nahi mila is area ke aas-paas.</p>";
    return;
  }

  list.forEach((doc) => {
    const div = document.createElement("div");
    div.className = "doctor-item";
    div.innerHTML = `
      <div>
        <h3>${doc.name}</h3>
        <p>${doc.clinic} — ${doc.city}</p>
      </div>
      <div>${doc.distance !== undefined ? doc.distance.toFixed(1) + " km away" : ""}</div>
    `;
    container.appendChild(div);
  });
}

// Haversine distance in km
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function searchLocation() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  const searchBtn = document.getElementById("searchBtn");
  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";

  try {
    const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    const results = await res.json();

    if (!results || results.length === 0) {
      alert("Location nahi mili, thoda specific likh ke try karo.");
      return;
    }

    const { lat, lon, display_name } = results[0];
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lon);

    map.setView([userLat, userLng], 11);

    // Add a marker for searched location
    L.marker([userLat, userLng], {
      title: "Your search location",
    })
      .addTo(map)
      .bindPopup(`<b>Searched:</b> ${display_name}`)
      .openPopup();

    // Sort static doctors by distance from searched location
    const sorted = DOCTORS.map((d) => ({
      ...d,
      distance: distanceKm(userLat, userLng, d.lat, d.lng),
    })).sort((a, b) => a.distance - b.distance);

    plotDoctors(sorted);
  } catch (err) {
    alert("Search me error aayi: " + err.message);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
  }
}

document.getElementById("searchBtn").addEventListener("click", searchLocation);
document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchLocation();
});

initMap();
