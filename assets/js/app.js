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
      if (window.closeAllIntentMenus) {
        window.closeAllIntentMenus();
      }
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
  const sharedCore = document.getElementById("sharedCore");
  const introSlot = document.querySelector(".intent-core-slot-intro");
  const triggers = Array.from(document.querySelectorAll(".intent-trigger"));

  if (!panel || !intro || !sharedCore || !introSlot) return;

  function isDesktop() {
    return window.innerWidth > 860;
  }

  function getSlotForElement(element) {
    if (!element) return null;
    if (element.classList.contains("intent-core-slot-intro")) return element;
    return element.querySelector(".intent-core-slot");
  }

  function moveSharedCoreTo(element) {
    if (!isDesktop()) return;
    const slot = getSlotForElement(element);
    if (!slot) return;

    const slotRect = slot.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const overlayRect = sharedCore.offsetParent.getBoundingClientRect();
    const x = slotRect.left - overlayRect.left;
    const y = slotRect.top - overlayRect.top;

    sharedCore.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    sharedCore.style.opacity = "1";
  }

  function firstTrigger() {
    return triggers[0] || intro;
  }

  function openPanel() {
    if (!isDesktop()) return;
    panel.classList.add("is-open");
    intro.setAttribute("aria-expanded", "true");
    moveSharedCoreTo(firstTrigger());
  }

  function closePanel() {
    panel.classList.remove("is-open");
    intro.setAttribute("aria-expanded", "false");
    closeAllIntentMenus();
    if (isDesktop()) {
      moveSharedCoreTo(introSlot);
    }
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

  panel.addEventListener("mouseenter", () => {
    if (isDesktop()) openPanel();
  });

  panel.addEventListener("mouseleave", () => {
    if (isDesktop()) closePanel();
  });

  intro.addEventListener("click", (event) => {
    event.preventDefault();
    if (isDesktop()) {
      if (panel.classList.contains("is-open")) {
        closePanel();
      } else {
        openPanel();
      }
      return;
    }

    panel.classList.toggle("is-open");
    intro.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
  });

  intro.addEventListener("focus", () => moveSharedCoreTo(introSlot));

  triggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", () => {
      if (!panel.classList.contains("is-open")) openPanel();
      moveSharedCoreTo(trigger);
    });

    trigger.addEventListener("focus", () => {
      if (!panel.classList.contains("is-open")) openPanel();
      moveSharedCoreTo(trigger);
    });

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (!panel.classList.contains("is-open") && isDesktop()) openPanel();
      moveSharedCoreTo(trigger);
      openIntent(trigger);
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".intent-menu")) {
      closePanel();
      if (!isDesktop()) {
        panel.classList.remove("is-open");
        intro.setAttribute("aria-expanded", "false");
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePanel();
      if (!isDesktop()) {
        panel.classList.remove("is-open");
        intro.setAttribute("aria-expanded", "false");
      }
    }
  });

  window.addEventListener("resize", () => {
    closeAllIntentMenus();
    if (isDesktop()) {
      panel.classList.remove("is-open");
      intro.setAttribute("aria-expanded", "false");
      moveSharedCoreTo(introSlot);
    } else {
      panel.classList.add("is-open");
      intro.setAttribute("aria-expanded", "true");
    }
  });

  if (isDesktop()) {
    moveSharedCoreTo(introSlot);
  } else {
    panel.classList.add("is-open");
    intro.setAttribute("aria-expanded", "true");
  }
});
