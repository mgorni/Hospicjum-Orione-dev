// ======================
// Routing / SPA loader
// ======================

document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const yearNode = document.getElementById("year");
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  const routes = {
    home: "/partials/home.html",
    "o-nas": "/partials/o-nas.html",
    aktualnosci: "/partials/aktualnosci.html",
    "jak-pomagac": "/partials/jak-pomagac.html",
    "o-patronie": "/partials/o-patronie.html",
    kontakt: "/partials/kontakt.html",
    wplaty: "/partials/wplaty.html",
  };

  async function loadPage(page) {
    const url = routes[page] || routes.home;

    try {
      content.innerHTML = '<div class="loading">Ładowanie…</div>';

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      const html = await response.text();

      content.innerHTML = html;
      window.location.hash = page;
      updateActiveLinks(page);
    } catch (e) {
      content.innerHTML = "<p>Błąd ładowania strony.</p>";
      console.error(e);
    }
  }

  function updateActiveLinks(activePage) {
    document.querySelectorAll(".navlink").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === activePage);
    });

    document.querySelectorAll("[data-group]").forEach((group) => {
      const hasActiveChild = !!group.querySelector(`.submenu-link[data-page="${activePage}"]`);
      group.classList.toggle("is-active", hasActiveChild);
    });
  }

  document.querySelectorAll(".navlink[data-page]").forEach((a) => {
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      const page = a.dataset.page;
      loadPage(page);
      if (typeof window.closeAllMenus === "function") window.closeAllMenus();
    });
  });

  const initialPage = window.location.hash.replace("#", "") || "home";
  loadPage(initialPage);
});

// ======================
// Intent menu behavior
// ======================

document.addEventListener("DOMContentLoaded", () => {
  const menuPanel = document.querySelector("[data-menu-panel]");
  const mainMenu = document.querySelector("[data-main-menu]");
  const groups = Array.from(document.querySelectorAll("[data-group]"));
  const triggers = Array.from(document.querySelectorAll("[data-intent-trigger]"));

  if (!menuPanel || !mainMenu || !groups.length) return;

  let openGroup = null;

  function setCoreRow(rowIndex) {
    const safeRow = Number.isFinite(Number(rowIndex)) ? Number(rowIndex) : 0;
    menuPanel.style.setProperty("--core-row", String(safeRow));
  }

  function engageMenu(engaged) {
    const isMobile = window.matchMedia("(max-width: 860px)").matches;
    if (isMobile) {
      menuPanel.classList.add("is-engaged");
      return;
    }

    if (engaged) {
      menuPanel.classList.add("is-engaged");
    } else if (!openGroup) {
      menuPanel.classList.remove("is-engaged");
    }
  }

  function closeAllMenus() {
    groups.forEach((group) => {
      group.classList.remove("is-open");
      const button = group.querySelector("[data-intent-trigger]");
      if (button) button.setAttribute("aria-expanded", "false");
    });
    openGroup = null;
  }

  function openMenu(group) {
    closeAllMenus();
    group.classList.add("is-open");
    const button = group.querySelector("[data-intent-trigger]");
    if (button) button.setAttribute("aria-expanded", "true");
    openGroup = group;
    engageMenu(true);
  }

  groups.forEach((group, index) => {
    const trigger = group.querySelector("[data-intent-trigger]");
    if (!trigger) return;

    const rowIndex = Number(group.dataset.coreRow || index || 0);

    group.addEventListener("mouseenter", () => {
      setCoreRow(rowIndex);
      engageMenu(true);
    });

    group.addEventListener("focusin", () => {
      setCoreRow(rowIndex);
      engageMenu(true);
    });

    trigger.addEventListener("mouseenter", () => {
      setCoreRow(rowIndex);
      engageMenu(true);
    });

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const alreadyOpen = group.classList.contains("is-open");
      setCoreRow(rowIndex);
      engageMenu(true);

      if (alreadyOpen) {
        closeAllMenus();
      } else {
        openMenu(group);
      }
    });
  });

  menuPanel.addEventListener("mouseenter", () => engageMenu(true));

  menuPanel.addEventListener("mouseleave", () => {
    if (openGroup) return;
    setCoreRow(0);
    engageMenu(false);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-menu-panel]")) {
      closeAllMenus();
      setCoreRow(0);
      engageMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllMenus();
      setCoreRow(0);
      engageMenu(false);
    }
  });


  window.addEventListener("resize", () => {
    if (window.matchMedia("(max-width: 860px)").matches) {
      menuPanel.classList.add("is-engaged");
    } else if (!openGroup) {
      menuPanel.classList.remove("is-engaged");
    }
  });

  window.closeAllMenus = closeAllMenus;
  setCoreRow(0);
  engageMenu(false);
});
