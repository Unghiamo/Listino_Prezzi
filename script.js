document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initModal();
  initListino();
  initEvents();
});

/* ---------------- MENU MOBILE ---------------- */
function initMobileMenu() {
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("menuOverlay");
  const closeBtn = document.getElementById("menuClose");

  if (!toggle || !menu || !overlay) return;

  const openMenu = () => {
    menu.classList.add("open");
    overlay.classList.add("open");
    document.body.classList.add("menu-open");
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
  };

  const closeMenu = () => {
    menu.classList.remove("open");
    overlay.classList.remove("open");
    document.body.classList.remove("menu-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  };

  toggle.addEventListener("click", () => {
    if (menu.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener("click", closeMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
}

/* ---------------- LISTINO ---------------- */
function initListino() {
  const filters = document.getElementById("filters");
  const treatments = document.getElementById("treatments");
  if (!filters || !treatments) return;

  fetch("treatments.json")
    .then(res => res.json())
    .then(data => {
      buildFilters(data.categories);
      buildTreatments(data.categories);
      filterCategories("all");

      // Dopo aver costruito tutto, attiva il tracking sui filtri e toggle categorie
      initTracking();
    });
}

/* ---------------- EVENTI E PROMO ---------------- */
function initEvents() {
  const eventsGrid = document.getElementById("eventsGrid");
  if (!eventsGrid) return;

  fetch("events.json")
    .then(res => res.json())
    .then(data => {
      renderEvents(data.items || []);
    })
    .catch(() => {
      eventsGrid.innerHTML = '<p class="events-empty">Nessun evento o promozione attiva al momento.</p>';
    });
}

function renderEvents(items) {
  const eventsGrid = document.getElementById("eventsGrid");
  if (!eventsGrid) return;

  const activeItems = items.filter(item => item.active !== false);
  eventsGrid.innerHTML = "";

  if (!activeItems.length) {
    eventsGrid.innerHTML = '<p class="events-empty">Nessun evento o promozione attiva al momento.</p>';
    return;
  }

  activeItems.forEach(item => {
    const card = item.type === "event" ? buildEventCard(item) : buildPromoCard(item);
    eventsGrid.appendChild(card);
  });
}

function buildEventCard(item) {
  const card = document.createElement("article");
  card.className = "offer-card offer-card-feature offer-card-event";

  if (item.image) {
    const image = document.createElement("img");
    image.className = "offer-image";
    image.src = item.image;
    image.alt = item.imageAlt || item.title;
    card.appendChild(image);
  }

  const body = document.createElement("div");
  body.className = "offer-body";

  body.appendChild(buildOfferTop(item.title, item.tag));
  body.appendChild(buildOfferCaption(item.caption));
  body.appendChild(buildOfferMeta(item.price, item.subtitle, true));

  if (item.ctaLabel && item.ctaUrl) {
    body.appendChild(buildOfferCta(item.ctaLabel, item.ctaUrl, item.ctaType));
  }

  card.appendChild(body);
  return card;
}

function buildPromoCard(item) {
  const card = document.createElement("article");
  card.className = "offer-card offer-card-promo";

  const top = buildOfferTop(item.title, item.tag);
  const caption = buildOfferCaption(item.caption);
  const meta = buildOfferMeta(item.price, item.subtitle, false);

  card.appendChild(top);
  card.appendChild(caption);
  card.appendChild(meta);

  return card;
}

function buildOfferTop(title, tag) {
  const top = document.createElement("div");
  top.className = "offer-top";

  const heading = document.createElement("h3");
  heading.textContent = title || "";
  top.appendChild(heading);

  if (tag) {
    const badge = document.createElement("span");
    badge.className = "badge badge-active";
    badge.textContent = tag;
    top.appendChild(badge);
  }

  return top;
}

function buildOfferCaption(caption) {
  const paragraph = document.createElement("p");
  paragraph.textContent = caption || "";
  return paragraph;
}

function buildOfferMeta(price, subtitle, stacked) {
  const meta = document.createElement("div");
  meta.className = stacked ? "offer-meta offer-meta-stack" : "offer-meta";

  if (price) {
    const priceNode = document.createElement("span");
    priceNode.className = "price-tag";
    priceNode.textContent = price;
    meta.appendChild(priceNode);
  }

  if (subtitle) {
    const subtitleNode = document.createElement("span");
    subtitleNode.className = "offer-note";
    subtitleNode.textContent = subtitle;
    meta.appendChild(subtitleNode);
  }

  return meta;
}

function buildOfferCta(label, url, type) {
  const link = document.createElement("a");
  link.className = "insta-post";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.onclick = () => {
    if (type === "instagram") {
      trackUmamiEvent("Click Instagram");
    } else if (type === "whatsapp") {
      trackUmamiEvent("Click WhatsApp");
    }
  };

  if (type === "instagram") {
    const icon = document.createElement("img");
    icon.src = "icons/icons8-instagram.svg";
    icon.alt = "Instagram";
    link.appendChild(icon);
  }

  const text = document.createElement("span");
  text.textContent = label;
  link.appendChild(text);

  return link;
}

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
let modal = null;
let closeModal = null;
let modalOpenTime = null;

function initModal() {
  modal = document.getElementById("treatmentModal");
  closeModal = document.getElementById("closeModal");
  if (!modal || !closeModal) return;

  closeModal.onclick = closeTreatmentModal;
  modal.onclick = event => {
    if (event.target === modal) closeTreatmentModal();
  };

  window.addEventListener("popstate", () => {
    if (modal && modal.classList.contains("open")) {
      closeTreatmentModal();
    }
  });
}

function trackUmamiEvent(eventName, props) {
  if (window.umami && typeof umami.track === "function") {
    umami.track(eventName, props);
  } else {
    // Se Umami non è pronto, riprova tra 50ms
    setTimeout(() => trackUmamiEvent(eventName, props), 50);
  }
}

function openTreatmentModal(t, categoria, sezione) {
  if (!modal) return;
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
  if (!modal) return;
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

/* ---------------- INIZIALIZZA TRACCIAMENTO FILTRI E TOGGLE ---------------- */
function initTracking() {
  // Filtri già tracciati nel buildFilters con trackUmamiEvent

  // Toggle categorie già tracciati nel buildTreatments con header.onclick
}
