fetch("treatments.json")
  .then(res => res.json())
  .then(data => {
    buildFilters(data.categories);
    buildTreatments(data.categories);
    filterCategories("all");

    // Dopo aver costruito tutto, attiva il tracking sui filtri e toggle categorie
    initTracking();
  });

/* ---------------- FILTRI ---------------- */
function buildFilters(categories) {
  const filters = document.getElementById("filters");
  filters.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "filter-btn active";
  allBtn.innerHTML = "<span>Tutti</span>";
  allBtn.onclick = () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    allBtn.classList.add("active");
    filterCategories("all");
    trackUmamiEvent("Filtro cliccato", { filtro: "Tutti" });
  };
  filters.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.innerHTML = `<span>${cat.label}</span>`;
    btn.onclick = () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filterCategories(cat.id);
      trackUmamiEvent("Filtro cliccato", { filtro: cat.label });
    };
    filters.appendChild(btn);
  });
}

/* ---------------- TRATTAMENTI ---------------- */
function buildTreatments(categories) {
  const container = document.getElementById("treatments");
  container.innerHTML = "";

  categories.forEach(cat => {
    cat.sections.forEach(section => {
      const card = document.createElement("section");
      card.className = "category";
      card.dataset.category = cat.id;

      const header = document.createElement("button");
      header.className = "category-header";
      header.innerHTML = `
        <div class="left">
          <span>${section.title}</span>
          ${section.fromPrice ? `<span class="section-price">(da ${section.fromPrice}€)</span>` : ""}
        </div>
        <span class="toggle">›</span>
      `;

      header.onclick = () => {
        const wasOpen = card.classList.contains("open");
        document.querySelectorAll(".category.open").forEach(open => {
          if (open !== card) open.classList.remove("open");
        });
        card.classList.toggle("open");

        trackUmamiEvent("Categoria toggle", {
          sezione: section.title,
          aperta: !wasOpen
        });
      };

      const content = document.createElement("div");
      content.className = "category-content";

      section.treatments.forEach(t => {
        const div = document.createElement("div");
        div.className = "treatment";
        div.onclick = () => openTreatmentModal(t, cat.label, section.title);

        div.innerHTML = `
          <div class="treatment-header">
            <span class="treatment-name">
              ${t.name}
              <span class="open-icon info-icon">i</span>
            </span>
            <span class="price">${t.price}€</span>
          </div>
        `;

        content.appendChild(div);
      });

      if (section.notes) {
        const notesWrap = document.createElement("div");
        notesWrap.className = "section-note";
        Object.entries(section.notes).forEach(([key, text]) => {
          const p = document.createElement("div");
          p.innerHTML = `${key} ${text.replace(/\n/g, "<br>")}`;
          notesWrap.appendChild(p);
        });
        content.appendChild(notesWrap);
      }

      card.appendChild(header);
      card.appendChild(content);
      container.appendChild(card);
    });
  });
}

function filterCategories(id) {
  document.querySelectorAll(".category").forEach(cat => {
    cat.classList.remove("open");
    cat.style.display = id === "all" || cat.dataset.category === id ? "block" : "none";
  });
}

/* ---------------- MODAL TRATTAMENTO ---------------- */
const modal = document.getElementById("treatmentModal");
const closeModal = document.getElementById("closeModal");
let modalOpenTime = null;

function trackUmamiEvent(eventName, props) {
  if (window.umami && typeof umami.track === "function") {
    umami.track(eventName, props);
  } else {
    // Se Umami non è pronto, riprova tra 50ms
    setTimeout(() => trackUmamiEvent(eventName, props), 50);
  }
}

function openTreatmentModal(t, categoria, sezione) {
  document.getElementById("modalTitle").textContent = t.name;
  document.getElementById("modalMeta").textContent = `${t.price}€ · ${t.duration}`;
  document.getElementById("modalDescription").innerHTML =
    t.description.replace(/\n/g, "<br>");
  document.getElementById("modalImage").src = t.image;
  modal.classList.add("open");
  // Aggiunge uno stato alla history per intercettare il back
  history.pushState({ modal: true }, "");


  console.log("MODAL APERTO", t.name, categoria, sezione);

  // Salva l'orario di apertura
  modalOpenTime = Date.now();

  // Traccia apertura trattamento
  trackUmamiEvent("Trattamento aperto", {
    nome: t.name,
    categoria: categoria,
    sezione: sezione,
    prezzo: t.price
  });
}

// Funzione di chiusura modal con tracking tempo
function closeTreatmentModal() {
  if (modalOpenTime) {
    const durationMs = Date.now() - modalOpenTime;
    const durationSec = Math.round(durationMs / 1000);
    const treatmentName = document.getElementById("modalTitle").textContent;

    trackUmamiEvent("Durata trattamento", {
      nome: treatmentName,
      durata_secondi: durationSec
    });

    modalOpenTime = null;
  }
  modal.classList.remove("open");
  // Evita di accumulare history inutili
  if (history.state && history.state.modal) {
    history.back();
  }

}

closeModal.onclick = closeTreatmentModal;
modal.onclick = e => {
  if (e.target === modal) closeTreatmentModal();
};

window.addEventListener("popstate", () => {
  if (modal.classList.contains("open")) {
    closeTreatmentModal();
  }
});


/* ---------------- INIZIALIZZA TRACCIAMENTO FILTRI E TOGGLE ---------------- */
function initTracking() {
  // Filtri già tracciati nel buildFilters con trackUmamiEvent

  // Toggle categorie già tracciati nel buildTreatments con header.onclick
}