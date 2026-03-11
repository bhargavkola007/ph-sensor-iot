// ================= API =================
const API_ROOT = "https://polyhouse-qqiy.onrender.com/sensors";

// ================= ELEMENTS =================
const tbody = document.querySelector("#dataTable tbody");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const pageSizeSelect = document.getElementById("pageSize");
const searchBox = document.getElementById("searchBox");

let allData = [];
let page = 1;
let size = parseInt(pageSizeSelect.value);


// ================= LOAD DATA =================
async function loadData() {
  try {

    const res = await fetch(`${API_ROOT}/data`);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    allData = await res.json();

    renderTable();

  } catch (err) {
    console.error("Error fetching data:", err);
    alert("Unable to load sensor data");
  }
}


// ================= EXPORT CSV =================
function exportToCSV() {

  if (!allData.length) {
    alert("No data available to export!");
    return;
  }

  const headers = [
    "S.No",
    "pH Level",
    "Turbidity (NTU)",
    "Soil Moisture (%)",
    "Timestamp"
  ];

  const rows = allData.map((d, i) => [
    i + 1,
    d.ph ?? "-",
    d.turbidity ?? "-",
    d.soil_moisture ?? "-",
    d.timestamp ?? "-"
  ]);

  const csvContent = [headers, ...rows]
    .map(e => e.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `agro_sensor_data_${new Date().toISOString().slice(0,10)}.csv`
  );

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


// ================= RENDER TABLE =================
function renderTable() {

  size = parseInt(pageSizeSelect.value);

  const search = searchBox.value.trim().toLowerCase();

  let filtered = allData.filter(d =>
    d.ph?.toString().includes(search) ||
    d.turbidity?.toString().includes(search) ||
    d.soil_moisture?.toString().includes(search) ||
    d.timestamp?.toLowerCase().includes(search)
  );

  const totalPages = Math.ceil(filtered.length / size);

  page = Math.max(1, Math.min(page, totalPages));

  const start = (page - 1) * size;

  const pageData = filtered.slice(start, start + size);

  tbody.innerHTML = pageData.map((d, i) => `
      <tr>
        <td>${start + i + 1}</td>
        <td>${d.ph ?? "-"}</td>
        <td>${d.turbidity ?? "-"}</td>
        <td>${d.soil_moisture ?? "-"}</td>
        <td>${d.timestamp ?? "-"}</td>
      </tr>
  `).join("");

  pageInfo.textContent =
    `Page ${page} of ${totalPages || 1} (${filtered.length} records)`;

  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;
}


// ================= EVENTS =================
pageSizeSelect.addEventListener("change", () => {
  page = 1;
  renderTable();
});

searchBox.addEventListener("input", () => {
  page = 1;
  renderTable();
});

prevBtn.addEventListener("click", () => {
  if (page > 1) {
    page--;
    renderTable();
  }
});

nextBtn.addEventListener("click", () => {
  page++;
  renderTable();
});

document
  .getElementById("exportBtn")
  .addEventListener("click", exportToCSV);


// ================= INIT =================
loadData();