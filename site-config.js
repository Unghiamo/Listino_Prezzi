window.SITE_CONFIG = {
  umamiEnabled: true,
  umamiWebsiteId: "d5955fa0-bba7-43d1-929b-6f62bb11d097",
  // toggle rapido: "listino" oppure "home"
  defaultLandingPage: "home",
  theme: {
    // "auto" segue le date, "manual" usa selectedTheme, "off" usa il tema normale.
    mode: "auto",
    // Pulsante per provare i temi in sviluppo; impostare false prima del push production.
    showThemePreviewButton: false,
    selectedTheme: "halloween",
    // Date annuali nel formato MM-DD; la data finale è inclusa.
    schedule: [
      { theme: "halloween", start: "10-01", end: "11-15" },
      { theme: "newyear", start: "12-31", end: "01-05" },
      { theme: "christmas", start: "12-01", end: "12-30" }
    ]
  }
};
