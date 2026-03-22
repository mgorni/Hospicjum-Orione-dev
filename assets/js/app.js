// ======================
// Global helpers
// ======================

window.closeAllIntentMenus = window.closeAllIntentMenus || function () {};

// ======================
// App bootstrap
// ======================

document.addEventListener("DOMContentLoaded", () => {
  // ======================
  // Routing / SPA loader
  // ======================

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

  function updateActiveLinks(activePage) {
    document.querySelectorAll(".navlink").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === activePage);
    });
  }

  async function loadPage(page) {
    if (!content) return;

    const url = routes[page] || routes.home;

    try {
      content.innerHTML = '<div class="loading">Ładowanie…</div>';

      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while loading ${url}`);
      }

      const html = await response.text();
      content.innerHTML = html;

      if (window.location.hash !== `#${page}`) {
        window.location.hash = page;
      }

      updateActiveLinks(page);
      window.closeAllIntentMenus();
    } catch (error) {
      content.innerHTML = "<p>Błąd ładowania strony.</p>";
      console.error(error);
    }
  }

  document.querySelectorAll(".navlink").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const page = link.dataset.page || "home";
      loadPage(page);
    });
  });

  const initialPage = window.location.hash.replace("#", "") || "home";
  loadPage(initialPage);

  // ======================
  // Intent menu
  // ======================

  const panel = document.getElementById("intentPanel");
  const rows = document.getElementById("intentRows");
  const intro = document.getElementById("intentIntro");
  const sharedCore = document.getElementById("sharedCore");
  const triggers = Array.from(document.querySelectorAll(".intent-trigger"));
  const groups = Array.from(document.querySelectorAll(".intent-group"));
  const supportTrigger = document.querySelector(".intent-trigger--support");
  const introSlot = intro?.querySelector("[data-core-slot]") || null;

  if (!panel || !rows || !intro || !sharedCore) {
    return;
  }

  let coreMoveRaf = 0;
  let panelSettleTimer = 0;

  function isMobileMenu() {
    return window.innerWidth <= 860;
  }

  function getSlot(target) {
    if (!target) return null;
    if (target.matches?.("[data-core-slot]")) return target;
    return target.querySelector?.("[data-core-slot]") || null;
  }

  function moveSharedCoreTo(target) {
    if (isMobileMenu() || !rows || !sharedCore) return;

    const slot = getSlot(target);
    if (!slot) return;

    cancelAnimationFrame(coreMoveRaf);

    coreMoveRaf = requestAnimationFrame(() => {
      const slotRect = slot.getBoundingClientRect();
      const rowsRect = rows.getBoundingClientRect();

      const x = slotRect.left - rowsRect.left;
      const y = slotRect.top - rowsRect.top;

      sharedCore.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      sharedCore.style.opacity = "1";
    });
  }

  function getTransitionTimeMs(element) {
    const styles = getComputedStyle(element);

    const durations = styles.transitionDuration.split(",").map((v) => parseFloat(v) || 0);
    const delays = styles.transitionDelay.split(",").map((v) => parseFloat(v) || 0);

    let max = 0;
    const len = Math.max(durations.length, delays.length);

    for (let i = 0; i < len; i += 1) {
      const duration = durations[i] ?? durations[durations.length - 1] ?? 0;
      const delay = delays[i] ?? delays[delays.length - 1] ?? 0;
      max = Math.max(max, duration + delay);
    }

    return max * 1000;
  }

  function afterPanelSettle(callback) {
    if (!panel) return;

    if (isMobileMenu()) {
      requestAnimationFrame(callback);
      return;
    }

    const waitMs = getTransitionTimeMs(panel);

    if (!waitMs) {
      requestAnimationFrame(() => {
        requestAnimationFrame(callback);
      });
      return;
    }

    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      panel.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(panelSettleTimer);

      requestAnimationFrame(() => {
        requestAnimationFrame(callback);
      });
    };

    const onTransitionEnd = (event) => {
      if (event.target === panel && event.propertyName === "max-height") {
        finish();
      }
    };

    panel.addEventListener("transitionend", onTransitionEnd);
    clearTimeout(panelSettleTimer);
    panelSettleTimer = window.setTimeout(finish, waitMs + 60);
  }

  function closeAllIntentMenus() {
    groups.forEach((group) => {
      group.classList.remove("is-open");

      const button = group.querySelector(".intent-trigger");
      if (button) {
        button.classList.remove("is-active");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  window.closeAllIntentMenus = closeAllIntentMenus;

  function ensurePanelOpen() {
    panel.classList.add("is-open");
    intro.setAttribute("aria-expanded", "true");
  }

  function openPanel(target = supportTrigger || introSlot) {
    moveSharedCoreTo(target);
    ensurePanelOpen();
    afterPanelSettle(() => moveSharedCoreTo(target));
  }

  function closePanel() {
    if (isMobileMenu()) return;

    panel.classList.remove("is-open");
    intro.setAttribute("aria-expanded", "false");
    closeAllIntentMenus();

    afterPanelSettle(() => moveSharedCoreTo(introSlot));
  }

  function openIntent(trigger, options = {}) {
    const { immediate = true } = options;

    const group = trigger.closest(".intent-group");
    if (!group) return;

    const alreadyOpen = group.classList.contains("is-open");

    closeAllIntentMenus();

    if (!alreadyOpen) {
      group.classList.add("is-open");
      trigger.classList.add("is-active");
      trigger.setAttribute("aria-expanded", "true");
    }

    if (immediate) {
      moveSharedCoreTo(trigger);
    }

    afterPanelSettle(() => moveSharedCoreTo(trigger));
  }

  function initDesktopState() {
    panel.classList.remove("is-open");
    intro.setAttribute("aria-expanded", "false");
    closeAllIntentMenus();
    sharedCore.style.opacity = "1";

    requestAnimationFrame(() => {
      moveSharedCoreTo(introSlot);
    });
  }

  function initMobileState() {
    panel.classList.add("is-open");
    intro.setAttribute("aria-expanded", "true");
    closeAllIntentMenus();
    sharedCore.style.opacity = "0";
  }

  if (isMobileMenu()) {
    initMobileState();
  } else {
    initDesktopState();
  }

  panel.addEventListener("mouseenter", () => {
    if (!isMobileMenu()) {
      openPanel();
    }
  });

  panel.addEventListener("mouseleave", () => {
    if (!isMobileMenu()) {
      closePanel();
    }
  });

  intro.addEventListener("click", (event) => {
    event.preventDefault();

    if (isMobileMenu()) {
      const isOpen = panel.classList.toggle("is-open");
      intro.setAttribute("aria-expanded", isOpen ? "true" : "false");
      return;
    }

    openPanel();
  });

  intro.addEventListener("focus", () => {
    if (!isMobileMenu()) {
      moveSharedCoreTo(introSlot);
    }
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", () => {
      if (isMobileMenu()) return;

      if (!panel.classList.contains("is-open")) {
        openPanel(trigger);
        return;
      }

      openIntent(trigger, { immediate: true });
    });

    trigger.addEventListener("focus", () => {
      if (isMobileMenu()) return;

      if (!panel.classList.contains("is-open")) {
        openPanel(trigger);
        return;
      }

      openIntent(trigger, { immediate: true });
    });

    trigger.addEventListener("click", (event) => {
      event.preventDefault();

      if (isMobileMenu()) {
        openIntent(trigger, { immediate: false });
        return;
      }

      if (!panel.classList.contains("is-open")) {
        ensurePanelOpen();
      }

      openIntent(trigger, { immediate: true });
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".intent-menu")) return;

    if (isMobileMenu()) {
      panel.classList.remove("is-open");
      intro.setAttribute("aria-expanded", "false");
      closeAllIntentMenus();
      return;
    }

    closePanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (isMobileMenu()) {
      panel.classList.remove("is-open");
      intro.setAttribute("aria-expanded", "false");
      closeAllIntentMenus();
      return;
    }

    closePanel();
  });

  window.addEventListener("resize", () => {
    if (isMobileMenu()) {
      initMobileState();
    } else {
      initDesktopState();
    }
  });
});
