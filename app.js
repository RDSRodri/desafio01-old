function loadguides() {
  fetch("data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Arquivo JSON não encontrado");
      }
      return response.json();
    })
    .then((data) => {
      displayGuides(data.guides);
      populateInsuranceFilter(data.guides);
    })
    .catch((error) => console.error("Erro ao carregar o arquivo JSON:", error));
}

function displayGuides(guides) {
  const tbody = document.getElementById("guidesTableBody");
  tbody.innerHTML = "";

  if (guides.length === 0) {
    const row = document.createElement("tr");
    const noDataCell = document.createElement("td");
    noDataCell.textContent = "Nenhuma guia encontrada";
    noDataCell.colSpan = 6;
    noDataCell.style.textAlign = "center";
    row.appendChild(noDataCell);
    tbody.appendChild(row);
    return;
  }

  guides.forEach((guide) => {
    const row = document.createElement("tr");

    const numberCell = document.createElement("td");
    numberCell.textContent = guide.number;
    row.appendChild(numberCell);

    const dateCell = document.createElement("td");
    const date = new Date(guide.start_date);
    dateCell.textContent = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    row.appendChild(dateCell);

    const imageCell = document.createElement("td");
    const img = document.createElement("img");
    img.src =
      guide.patient.thumb_url || "https://via.placeholder.com/150x150.jpg";
    img.alt = guide.patient.name;
    img.width = 50;
    img.height = 50;
    imageCell.appendChild(img);
    row.appendChild(imageCell);

    const patientCell = document.createElement("td");
    patientCell.textContent = guide.patient.name;
    row.appendChild(patientCell);

    const insuranceCell = document.createElement("td");
    if (guide.health_insurance.is_deleted) {
      insuranceCell.textContent = guide.health_insurance.name;
      insuranceCell.classList.add("deleted");
      insuranceCell.title = "Convênio Apagado";
    } else {
      insuranceCell.textContent = guide.health_insurance.name;
    }
    row.appendChild(insuranceCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(guide.price);
    row.appendChild(priceCell);

    tbody.appendChild(row);
  });
}

function populateInsuranceFilter(guides) {
  const insuranceSelect = document.getElementById("insuranceFilter");
  const uniqueInsurances = [
    ...new Set(guides.map((guide) => guide.health_insurance.name)),
  ];

  uniqueInsurances.forEach((insurance) => {
    const option = document.createElement("option");
    option.value = insurance;
    option.textContent = insurance;
    insuranceSelect.appendChild(option);
  });
}

function filterGuides() {
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const selectedInsurance = document.getElementById("insuranceFilter").value;

  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      const filteredGuides = data.guides.filter((guide) => {
        const matchesInsurance = selectedInsurance
          ? guide.health_insurance.name === selectedInsurance
          : true;
        const matchesText =
          guide.patient.name.toLowerCase().includes(searchText) ||
          guide.number.includes(searchText);
        return matchesInsurance && matchesText;
      });
      displayGuides(filteredGuides);
    })
    .catch((error) => console.error("Erro ao carregar o arquivo JSON:", error));
}

document.getElementById("searchInput").addEventListener("input", filterGuides);
document
  .getElementById("insuranceFilter")
  .addEventListener("change", filterGuides);

window.onload = loadguides;
