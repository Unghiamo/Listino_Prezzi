const siteConfig = window.SITE_CONFIG || {};
const analyticsState = {
  enabled: Boolean(siteConfig.umamiEnabled),
  websiteId: siteConfig.umamiWebsiteId || "",
  queue: []
};

document.addEventListener("DOMContentLoaded", () => {
  initAnalytics();
  initMobileMenu();
  initModal();
  initCertificateModal();
  initCertificateAutoScroll();
  initContactTracking();
  initListino();
  initEvents();
});

/* ---------------- CONFIG / ANALYTICS ---------------- */
function initAnalytics() {
  if (!analyticsState.enabled || !analyticsState.websiteId) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://cloud.umami.is/script.js";
  script.dataset.websiteId = analyticsState.websiteId;
  script.onload = flushUmamiQueue;

  document.head.appendChild(script);
}

function flushUmamiQueue() {
  if (!window.umami || typeof window.umami.track !== "function") return;

  analyticsState.queue.forEach(item => {
    window.umami.track(item.eventName, item.props);
  });

  analyticsState.queue = [];
}

function trackUmamiEvent(eventName, props) {
  if (!analyticsState.enabled || !analyticsState.websiteId) return;

  if (window.umami && typeof window.umami.track === "function") {
    window.umami.track(eventName, props);
    return;
  }

  if (analyticsState.queue.length < 50) {
    analyticsState.queue.push({ eventName, props });
  }
}

function getCurrentPageName() {
  return document.body?.dataset.page || "unknown";
}

function buildTrackingProps(props = {}) {
  return {
    page: getCurrentPageName(),
    ...props
  };
}

function initContactTracking() {
  document.querySelectorAll("[data-contact-channel]").forEach(link => {
    link.addEventListener("click", () => {
      trackUmamiEvent("contact_click", buildTrackingProps({
        channel: link.dataset.contactChannel || "unknown",
        source: link.dataset.contactSource || "unknown"
      }));
    });
  });
}

function trackEventClick(item) {
  if (!item) return;

  trackUmamiEvent("event_click", buildTrackingProps({
    title: item.title || "",
    item_type: item.type || "",
    channel: item.ctaType || "link",
    source: "event_card"
  }));
}

function trackCertificateOpen(label) {
  const certificateName = (label || "Attestato")
    .replace(/^Ingrandisci attestato\s+/i, "")
    .replace(/^Ingrandisci\s+/i, "")
    .trim();

  trackUmamiEvent("certificate_open", buildTrackingProps({
    certificate: certificateName || "Attestato"
  }));
}

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
    })
    .catch(() => {
      treatments.innerHTML = '<p class="events-empty">Impossibile caricare il listino in questo momento.</p>';
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
    body.appendChild(buildOfferCta(item));
  }

  card.appendChild(body);
  return card;
}

function buildPromoCard(item) {
  const card = document.createElement("article");
  card.className = "offer-card offer-card-promo";

  card.appendChild(buildOfferTop(item.title, item.tag));
  card.appendChild(buildOfferCaption(item.caption));
  card.appendChild(buildOfferMeta(item.price, item.subtitle, false));

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

function buildOfferCta(item) {
  const link = document.createElement("a");
  link.className = "insta-post";
  link.href = item.ctaUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.addEventListener("click", () => trackEventClick(item));

  if (item.ctaType === "instagram") {
    const icon = document.createElement("img");
    icon.src = "icons/icons8-instagram.svg";
    icon.alt = "Instagram";
    link.appendChild(icon);
  }

  const text = document.createElement("span");
  text.textContent = item.ctaLabel;
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
    document.querySelectorAll(".filter-btn").forEach(button => button.classList.remove("active"));
    allBtn.classList.add("active");
    filterCategories("all");
    trackUmamiEvent("listino_filter_click", buildTrackingProps({ filter: "Tutti" }));
  };
  filters.appendChild(allBtn);

  categories.forEach(category => {
    const button = document.createElement("button");
    button.className = "filter-btn";
    button.innerHTML = `<span>${category.label}</span>`;
    button.onclick = () => {
      document.querySelectorAll(".filter-btn").forEach(filterButton => filterButton.classList.remove("active"));
      button.classList.add("active");
      filterCategories(category.id);
      trackUmamiEvent("listino_filter_click", buildTrackingProps({ filter: category.label }));
    };
    filters.appendChild(button);
  });
}

/* ---------------- TRATTAMENTI ---------------- */
function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "";

  if (typeof value === "number") {
    return `${String(value).replace(".", ",")}\u20AC`;
  }

  const text = String(value).trim();
  if (!text) return "";
  if (text.includes("\u20AC")) return text;
  if (text.startsWith("da ") || text.startsWith("+")) return `${text}\u20AC`;
  return `${text}\u20AC`;
}

function formatFromPrice(value) {
  if (value === null || value === undefined || value === "") return "";

  if (typeof value === "number") {
    return `da ${String(value).replace(".", ",")}\u20AC`;
  }

  const text = String(value).trim();
  if (!text) return "";
  if (text.includes("\u20AC")) return text;
  if (text.startsWith("da ")) return `${text}\u20AC`;
  return `da ${text}\u20AC`;
}

function createTreatmentRow(treatment, categoryLabel, sectionTitle, groupTitle = "") {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "treatment";
  item.onclick = () => openTreatmentModal(treatment, {
    category: categoryLabel,
    section: sectionTitle,
    group: groupTitle
  });

  const displayName = treatment.label || treatment.name;
  item.innerHTML = `
    <div class="treatment-header">
      <span class="treatment-name">
        ${displayName}
        <span class="open-icon info-icon">i</span>
      </span>
      <span class="price">${formatPrice(treatment.price)}</span>
    </div>
  `;

  return item;
}

function createTreatmentGroup(group, categoryLabel, sectionTitle) {
  const wrapper = document.createElement("div");
  wrapper.className = "treatment-group";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "treatment-group-toggle";
  toggle.innerHTML = `
    <span class="treatment-group-title">${group.title}</span>
    <span class="treatment-group-right">
      <span class="price">${formatFromPrice(group.fromPrice)}</span>
      <span class="group-toggle">\u203A</span>
    </span>
  `;

  const content = document.createElement("div");
  content.className = "treatment-group-content";

  (group.treatments || []).forEach(treatment => {
    content.appendChild(createTreatmentRow(treatment, categoryLabel, sectionTitle, group.title));
  });

  toggle.addEventListener("click", () => {
    const wasOpen = wrapper.classList.contains("open");
    const parent = wrapper.parentElement;

    if (parent) {
      Array.from(parent.children).forEach(sibling => {
        if (sibling !== wrapper && sibling.classList.contains("treatment-group")) {
          sibling.classList.remove("open");
        }
      });
    }

    wrapper.classList.toggle("open");

    trackUmamiEvent("listino_group_toggle", buildTrackingProps({
      category: categoryLabel,
      section: sectionTitle,
      group: group.title,
      open: !wasOpen
    }));
  });

  wrapper.appendChild(toggle);
  wrapper.appendChild(content);

  return wrapper;
}

function buildTreatments(categories) {
  const container = document.getElementById("treatments");
  container.innerHTML = "";

  categories.forEach(category => {
    category.sections.forEach(section => {
      const card = document.createElement("section");
      card.className = "category";
      card.dataset.category = category.id;

      const header = document.createElement("button");
      header.className = "category-header";
      header.innerHTML = `
        <div class="left">
          <span>${section.title}</span>
          ${section.fromPrice ? `<span class="section-price">(${formatFromPrice(section.fromPrice)})</span>` : ""}
        </div>
        <span class="category-toggle">\u203A</span>
      `;

      header.onclick = () => {
        const wasOpen = card.classList.contains("open");
        document.querySelectorAll(".category.open").forEach(openCard => {
          if (openCard !== card) openCard.classList.remove("open");
        });
        card.classList.toggle("open");

        trackUmamiEvent("listino_section_toggle", buildTrackingProps({
          category: category.label,
          section: section.title,
          open: !wasOpen
        }));
      };

      const content = document.createElement("div");
      content.className = "category-content";

      (section.items || []).forEach(item => {
        if (item.type === "group") {
          content.appendChild(createTreatmentGroup(item, category.label, section.title));
          return;
        }

        content.appendChild(createTreatmentRow(item, category.label, section.title));
      });

      if (Array.isArray(section.notes) && section.notes.length) {
        const notesWrap = document.createElement("div");
        notesWrap.className = "section-note";
        section.notes.forEach(noteText => {
          const note = document.createElement("div");
          note.innerHTML = noteText.replace(/\n/g, "<br>");
          notesWrap.appendChild(note);
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
  document.querySelectorAll(".category").forEach(category => {
    category.classList.remove("open");
    category.style.display = id === "all" || category.dataset.category === id ? "block" : "none";
  });
}

/* ---------------- MODAL TRATTAMENTO ---------------- */
let modal = null;
let closeModal = null;
let modalOpenTime = null;
let modalTrackingContext = null;
let treatmentModalScrollY = 0;
let certificateModal = null;
let certificateViewer = null;
let closeCertificateModalButton = null;
let certificateGallery = null;
let certificateAutoScrollId = null;
let certificateAutoScrollResumeTimeout = null;
let certificateAutoScrollDirection = 1;
let certificateAutoScrollPosition = 0;

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

function initCertificateModal() {
  certificateModal = document.getElementById("certificateModal");
  certificateViewer = document.getElementById("certificateViewer");
  closeCertificateModalButton = document.getElementById("closeCertificateModal");

  if (!certificateModal || !certificateViewer || !closeCertificateModalButton) return;

  document.querySelectorAll("[data-certificate-image]").forEach(trigger => {
    trigger.addEventListener("click", () => {
      openCertificateModal(trigger.dataset.certificateImage, trigger.getAttribute("aria-label"));
    });
  });

  closeCertificateModalButton.addEventListener("click", closeCertificateModal);
  certificateModal.addEventListener("click", event => {
    if (event.target === certificateModal) {
      closeCertificateModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && certificateModal.classList.contains("open")) {
      closeCertificateModal();
    }
  });
}

function initCertificateAutoScroll() {
  certificateGallery = document.getElementById("certGallery");
  if (!certificateGallery) return;

  const stopEvents = ["touchstart", "pointerdown", "mouseenter"];
  const resumeEvents = ["touchend", "pointerup", "mouseleave"];

  stopEvents.forEach(eventName => {
    certificateGallery.addEventListener(eventName, stopCertificateAutoScroll, { passive: true });
  });

  resumeEvents.forEach(eventName => {
    certificateGallery.addEventListener(eventName, queueCertificateAutoScrollResume, { passive: true });
  });

  certificateGallery.addEventListener("scroll", syncCertificateAutoScrollPosition, { passive: true });
  window.addEventListener("resize", queueCertificateAutoScrollResume);
  window.addEventListener("load", queueCertificateAutoScrollResume);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopCertificateAutoScroll();
    } else {
      queueCertificateAutoScrollResume();
    }
  });

  queueCertificateAutoScrollResume();
}

function queueCertificateAutoScrollResume() {
  stopCertificateAutoScroll();

  clearTimeout(certificateAutoScrollResumeTimeout);
  certificateAutoScrollResumeTimeout = setTimeout(() => {
    startCertificateAutoScroll();
  }, 1200);
}

function startCertificateAutoScroll() {
  if (!certificateGallery) return;
  if (window.innerWidth >= 768) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const maxScroll = certificateGallery.scrollWidth - certificateGallery.clientWidth;
  if (maxScroll <= 0) return;

  if (certificateAutoScrollId) return;

  certificateAutoScrollPosition = certificateGallery.scrollLeft;
  certificateAutoScrollDirection = certificateGallery.scrollLeft >= maxScroll ? -1 : 1;
  let lastTimestamp = 0;

  const step = timestamp => {
    if (!certificateGallery || !certificateAutoScrollId) return;

    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const maxOffset = certificateGallery.scrollWidth - certificateGallery.clientWidth;
    if (maxOffset <= 0 || window.innerWidth >= 768 || document.body.classList.contains("cert-modal-open")) {
      stopCertificateAutoScroll();
      return;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    const distance = delta * 0.055;
    let nextScroll = certificateAutoScrollPosition + (distance * certificateAutoScrollDirection);

    if (nextScroll <= 0) {
      nextScroll = 0;
      certificateAutoScrollDirection = 1;
    } else if (nextScroll >= maxOffset) {
      nextScroll = maxOffset;
      certificateAutoScrollDirection = -1;
    }

    certificateAutoScrollPosition = nextScroll;
    certificateGallery.scrollLeft = Math.round(certificateAutoScrollPosition);
    certificateAutoScrollId = requestAnimationFrame(step);
  };

  certificateAutoScrollId = requestAnimationFrame(step);
}

function stopCertificateAutoScroll() {
  clearTimeout(certificateAutoScrollResumeTimeout);
  syncCertificateAutoScrollPosition();

  if (certificateAutoScrollId) {
    cancelAnimationFrame(certificateAutoScrollId);
    certificateAutoScrollId = null;
  }
}

function syncCertificateAutoScrollPosition() {
  if (!certificateGallery) return;
  certificateAutoScrollPosition = certificateGallery.scrollLeft;
}

function openCertificateModal(imagePath, label) {
  if (!certificateModal || !certificateViewer || !imagePath) return;

  stopCertificateAutoScroll();
  certificateViewer.src = imagePath;
  certificateViewer.alt = label ? label.replace("Ingrandisci ", "") : "Attestato ingrandito";
  certificateModal.classList.add("open");
  certificateModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("cert-modal-open");
  trackCertificateOpen(label);
}

function closeCertificateModal() {
  if (!certificateModal || !certificateViewer) return;

  certificateModal.classList.remove("open");
  certificateModal.setAttribute("aria-hidden", "true");
  certificateViewer.src = "";
  document.body.classList.remove("cert-modal-open");
  queueCertificateAutoScrollResume();
}

function openTreatmentModal(treatment, context = {}) {
  if (!modal) return;

  document.getElementById("modalTitle").textContent = treatment.name;
  const metaParts = [formatPrice(treatment.price), treatment.duration].filter(Boolean);
  document.getElementById("modalMeta").textContent = metaParts.join(" \u00B7 ");
  document.getElementById("modalDescription").innerHTML = treatment.description.replace(/\n/g, "<br>");
  document.getElementById("modalImage").src = treatment.image;
  document.getElementById("modalImage").alt = treatment.name;
  lockTreatmentModalScroll();
  modal.classList.add("open");
  history.pushState({ modal: true }, "");

  modalOpenTime = Date.now();
  modalTrackingContext = {
    treatment: treatment.name,
    category: context.category || "",
    section: context.section || "",
    group: context.group || "",
    price: String(treatment.price ?? "")
  };

  trackUmamiEvent("treatment_open", buildTrackingProps(modalTrackingContext));
}

function closeTreatmentModal() {
  if (!modal) return;

  if (modalOpenTime) {
    const durationMs = Date.now() - modalOpenTime;
    const durationSec = Math.round(durationMs / 1000);

    trackUmamiEvent("treatment_modal_duration", buildTrackingProps({
      ...(modalTrackingContext || {
        treatment: document.getElementById("modalTitle").textContent
      }),
      duration_seconds: durationSec
    }));

    modalOpenTime = null;
  }

  modal.classList.remove("open");
  unlockTreatmentModalScroll();

  if (history.state && history.state.modal) {
    history.back();
  }

  modalTrackingContext = null;
}

function lockTreatmentModalScroll() {
  treatmentModalScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.classList.add("treatment-modal-open");
  document.body.style.top = `-${treatmentModalScrollY}px`;
}

function unlockTreatmentModalScroll() {
  if (!document.body.classList.contains("treatment-modal-open")) return;

  document.body.classList.remove("treatment-modal-open");
  document.body.style.top = "";
  window.scrollTo(0, treatmentModalScrollY);
}


