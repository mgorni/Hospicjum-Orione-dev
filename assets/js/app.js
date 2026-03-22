// ======================
// Routing / SPA loader
// ======================

document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");

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
      const html = await response.text();
      content.innerHTML = html;
      window.location.hash = page;
      updateActiveLinks(page);
      window.closeAllIntentMenus?.();
    } catch (e) {
      content.innerHTML = "<p>Błąd ładowania strony.</p>";
      console.error(e);
    }
  }

  function updateActiveLinks(activePage) {
    document.querySelectorAll(".navlink").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === activePage);
    });
  }

  document.querySelectorAll(".navlink").forEach((a) => {
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      loadPage(a.dataset.page);
    });
  });

  const initialPage = window.location.hash.replace("#", "") || "home";
  loadPage(initialPage);
});

// ======================
// Intent menu
// ======================

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("intentPanel");
  const intro = document.getElementById("intentIntro");
  const sharedCore = document.getElementById("sharedCore");
  const triggers = Array.from(document.querySelectorAll(".intent-trigger"));
  const submenus = Array.from(document.querySelectorAll(".intent-submenu"));

  function isMobile() {
    return window.innerWidth <= 860;
  }

  function getSlot(element) {
    return element?.querySelector(".intent-core-slot") || null;
  }

  function moveSharedCoreTo(element) {
    if (isMobile() || !panel || !sharedCore || !element) return;
    const slot = getSlot(element);
    if (!slot) return;

    const slotRect = slot.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const x = Math.round(slotRect.left - panelRect.left);
    const y = Math.round(slotRect.top - panelRect.top);

    sharedCore.style.transform = `translate(${x}px, ${y}px)`;
    sharedCore.style.opacity = "1";
  }

  function setExpanded(button, state) {
    if (button) button.setAttribute("aria-expanded", state ? "true" : "false");
  }

  function closeAllIntentMenus() {
    triggers.forEach((trigger) => {
      trigger.classList.remove("is-active");
      setExpanded(trigger, false);
    });

    submenus.forEach((submenu) => submenu.classList.remove("is-open"));
  }

  window.closeAllIntentMenus = closeAllIntentMenus;

  function openSubmenu(intent) {
    closeAllIntentMenus();

    const trigger = document.querySelector(`.intent-trigger[data-intent="${intent}"]`);
    const submenu = document.querySelector(`.intent-submenu[data-submenu="${intent}"]`);

    if (trigger) {
      trigger.classList.add("is-active");
      setExpanded(trigger, true);
      moveSharedCoreTo(trigger);
    }

    if (submenu) submenu.classList.add("is-open");
  }

  function openPanel() {
    if (!panel || isMobile()) return;
    panel.classList.add("is-open");
    setExpanded(intro, true);
    moveSharedCoreTo(document.querySelector(".intent-row-support"));
  }

  function closePanel() {
    if (!panel || isMobile()) return;
    panel.classList.remove("is-open");
    setExpanded(intro, false);
    closeAllIntentMenus();
    moveSharedCoreTo(intro);
  }

  if (panel && !isMobile()) {
    moveSharedCoreTo(intro);

    panel.addEventListener("mouseenter", () => {
      openPanel();
    });

    panel.addEventListener("mouseleave", () => {
      closePanel();
    });
  }

  intro?.addEventListener("click", (event) => {
    event.preventDefault();
    if (isMobile()) {
      openSubmenu("support");
    } else {
      openPanel();
    }
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", () => {
      if (!isMobile()) {
        openPanel();
        moveSharedCoreTo(trigger);
        openSubmenu(trigger.dataset.intent);
      }
    });

    trigger.addEventListener("focus", () => {
      if (!isMobile()) {
        openPanel();
        moveSharedCoreTo(trigger);
      }
    });

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (!panel) return;
      if (!isMobile()) panel.classList.add("is-open");
      openSubmenu(trigger.dataset.intent);
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".intent-menu")) {
      if (isMobile()) {
        closeAllIntentMenus();
      } else {
        closePanel();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (isMobile()) {
        closeAllIntentMenus();
      } else {
        closePanel();
      }
    }
  });

  window.addEventListener("resize", () => {
    closeAllIntentMenus();
    if (isMobile()) {
      panel?.classList.add("is-open");
    } else {
      panel?.classList.remove("is-open");
      moveSharedCoreTo(intro);
    }
  });

  if (isMobile()) {
    panel?.classList.add("is-open");
  }
});
