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
      closeAllIntentMenus();
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
      const page = a.dataset.page;
      loadPage(page);
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
  const options = document.getElementById("intentOptions");
  const sharedCore = document.getElementById("sharedCore");
  const triggers = Array.from(document.querySelectorAll(".intent-trigger"));
  const allTargets = Array.from(document.querySelectorAll("[data-core-target], .intent-core-slot-intro"));

  function slotFromTarget(target) {
    if (!target) return null;
    if (target.classList.contains("intent-core-slot-intro")) return target;
    return target.querySelector(".intent-core-slot");
  }

  function moveSharedCoreTo(target) {
    if (window.innerWidth <= 860 || !panel || !sharedCore) return;
    const slot = slotFromTarget(target);
    if (!slot) return;

    const slotRect = slot.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const x = slotRect.left - panelRect.left;
    const y = slotRect.top - panelRect.top;

    sharedCore.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    sharedCore.style.opacity = "1";
  }

  function openPanel() {
    if (!panel) return;
    panel.classList.add("is-open");
    if (intro) intro.setAttribute("aria-expanded", "true");
    moveSharedCoreTo(document.querySelector(".intent-core-slot-intro"));
  }

  function closePanel() {
    if (!panel || window.innerWidth <= 860) return;
    panel.classList.remove("is-open");
    if (intro) intro.setAttribute("aria-expanded", "false");
    closeAllIntentMenus();
    moveSharedCoreTo(document.querySelector(".intent-core-slot-intro"));
  }

  window.closeAllIntentMenus = function closeAllIntentMenus() {
    document.querySelectorAll(".intent-group").forEach((group) => {
      group.classList.remove("is-open");
      const button = group.querySelector(".intent-trigger");
      if (button) {
        button.classList.remove("is-active");
        button.setAttribute("aria-expanded", "false");
      }
    });
  };

  function openIntent(trigger) {
    const group = trigger.closest(".intent-group");
    const alreadyOpen = group.classList.contains("is-open");

    closeAllIntentMenus();

    if (!alreadyOpen) {
      group.classList.add("is-open");
      trigger.classList.add("is-active");
      trigger.setAttribute("aria-expanded", "true");
    }
  }

  if (panel) {
    moveSharedCoreTo(document.querySelector(".intent-core-slot-intro"));

    panel.addEventListener("mouseenter", () => {
      if (window.innerWidth > 860) openPanel();
    });

    panel.addEventListener("mouseleave", () => {
      if (window.innerWidth > 860) closePanel();
    });
  }

  if (intro) {
    intro.addEventListener("click", (event) => {
      event.preventDefault();
      if (window.innerWidth <= 860) {
        panel.classList.toggle("is-open");
        intro.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
      } else {
        openPanel();
      }
    });

    intro.addEventListener("focus", () => moveSharedCoreTo(document.querySelector(".intent-core-slot-intro")));
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", () => moveSharedCoreTo(trigger));
    trigger.addEventListener("focus", () => moveSharedCoreTo(trigger));

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (!panel.classList.contains("is-open")) openPanel();
      moveSharedCoreTo(trigger);
      openIntent(trigger);
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".intent-menu")) {
      closePanel();
      if (window.innerWidth <= 860 && panel) {
        panel.classList.remove("is-open");
        if (intro) intro.setAttribute("aria-expanded", "false");
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePanel();
      if (window.innerWidth <= 860 && panel) {
        panel.classList.remove("is-open");
        if (intro) intro.setAttribute("aria-expanded", "false");
      }
    }
  });

  window.addEventListener("resize", () => {
    closeAllIntentMenus();
    moveSharedCoreTo(document.querySelector(".intent-core-slot-intro"));
    if (window.innerWidth <= 860) {
      panel.classList.add("is-open");
      intro?.setAttribute("aria-expanded", "true");
    } else {
      panel.classList.remove("is-open");
      intro?.setAttribute("aria-expanded", "false");
    }
  });

  if (window.innerWidth <= 860) {
    panel.classList.add("is-open");
    intro?.setAttribute("aria-expanded", "true");
  }
});
