const FIELD_ORDER = [
  "o3_sub_index",
  "pm10_twenty_four_hourly",
  "pm10_sub_index",
  "co_sub_index",
  "pm25_twenty_four_hourly",
  "so2_sub_index",
  "co_eight_hour_max",
  "no2_one_hour_max",
  "so2_twenty_four_hourly",
  "pm25_sub_index",
  "psi_twenty_four_hourly"
];

loadPSIData.lastTimestamp = null;

async function loadPSIData() {
  const statusDiv = document.getElementById("status");
  const apiTsDiv = document.getElementById("apiTimestamp");
  const refreshDiv = document.getElementById("refreshTime");
  const table = document.getElementById("psi-table");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  statusDiv.innerText = "API Status: Loading...";
  statusDiv.className = "";
  apiTsDiv.innerText = "Data timestamp: —";
  refreshDiv.innerText = "Refreshed at: —";
  thead.innerHTML = "";
  tbody.innerHTML = "";

  try {
    const resp = await fetch('https://api.data.gov.sg/v1/environment/psi');
    if (!resp.ok) {
      throw new Error("HTTP status " + resp.status);
    }
    const data = await resp.json();
    console.log("PSI API response:", data);

    if (!data.items || data.items.length === 0) {
      throw new Error("No items found");
    }

    const item = data.items[0];
    const readings = item.readings;
    const updated = item.update_timestamp;

    if (updated) {
      apiTsDiv.innerText = `Data timestamp: ${new Date(updated).toLocaleString()}`;
    } else {
      apiTsDiv.innerText = "Data timestamp: (none)";
    }

    const now = new Date();
    refreshDiv.innerText = `Refreshed at: ${now.toLocaleString()}`;

    statusDiv.innerText = "API Status: Success";
    statusDiv.classList.add("status-ok");

    if (loadPSIData.lastTimestamp) {
      if (loadPSIData.lastTimestamp === updated) {
        statusDiv.innerText += " — No new data";
      } else {
        statusDiv.innerText += " — Data updated";
      }
    }
    loadPSIData.lastTimestamp = updated;

    const regions = Object.keys(readings.psi_twenty_four_hourly);
    let headerHtml = `<tr><th>Reading Type</th>`;
    regions.forEach(region => {
      headerHtml += `<th>${region}</th>`;
    });
    headerHtml += `</tr>`;
    thead.innerHTML = headerHtml;

    let bodyHtml = "";
    FIELD_ORDER.forEach(type => {
      if (readings[type]) {
        let row = `<tr><td>${type}</td>`;
        regions.forEach(region => {
          const val = readings[type][region];
          row += `<td>${val !== undefined ? val : ''}</td>`;
        });
        row += `</tr>`;
        bodyHtml += row;
      }
    });
    tbody.innerHTML = bodyHtml;
  } catch (err) {
    console.error("Error:", err);
    statusDiv.innerText = "API Status: Failed";
    statusDiv.classList.add("status-fail");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshBtn").addEventListener("click", loadPSIData);
  loadPSIData();
});