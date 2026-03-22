// ======================
// Intent menu
// ======================

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("intentPanel");
  const overlay = panel?.querySelector(".intent-overlay") || null;
  const intro = document.getElementById("intentIntro");
  const sharedCore = document.getElementById("sharedCore");
  const triggers = Array.from(document.querySelectorAll(".intent-trigger"));
  const groups = Array.from(document.querySelectorAll(".intent-group"));
  const supportTrigger = document.querySelector(".intent-trigger--support");
  const introSlot = intro?.querySelector("[data-core-slot]") || null;

  if (!panel || !overlay || !intro || !sharedCore) return;

  let coreMoveRaf = 0;

  function getSlot(target) {
    if (!target) return null;
    if (target.matches?.("[data-core-slot]")) return target;
    return target.querySelector?.("[data-core-slot]") || null;
  }

  function moveSharedCoreTo(target) {
    if (window.innerWidth <= 860) return;

    const slot = getSlot(target);
    if (!slot) return;

    cancelAnimationFrame(coreMoveRaf);

    coreMoveRaf = requestAnimationFrame(() => {
      const slotRect = slot.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();

      const x = slotRect.left - overlayRect.left;
      const y = slotRect.top - overlayRect.top;

      sharedCore.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      sharedCore.style.opacity = "1";
    });
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

  function openPanel() {
    panel.classList.add("is-open");
    intro.setAttribute("aria-expanded", "true");

    requestAnimationFrame(() => {
      moveSharedCoreTo(supportTrigger || introSlot);
    });
  }

  function closePanel() {
    if (window.innerWidth <= 860) return;

    panel.classList.remove("is-open");
    intro.setAttribute("aria-expanded", "false");
    closeAllIntentMenus();

    requestAnimationFrame(() => {
      moveSharedCoreTo(introSlot);
    });
  }

  function openIntent(trigger) {
    const group = trigger.closest(".intent-group");
    if (!group) return;

    const alreadyOpen = group.classList.contains("is-open");
    closeAllIntentMenus();

    if (!alreadyOpen) {
      group.classList.add("is-open");
      trigger.classList.add("is-active");
      trigger.setAttribute("aria-expanded", "true");
    }

    requestAnimationFrame(() => {
      moveSharedCoreTo(trigger);
    });
  }

  // initial state
  if (window.innerWidth <= 860) {
    panel.classList.add("is-open");
    intro.setAttribute("aria-expanded", "true");
    sharedCore.style.opacity = "0";
  } else {
    sharedCore.style.opacity = "1";
    requestAnimationFrame(() => {
      moveSharedCoreTo(introSlot);
    });
  }

  // panel hover
  panel.addEventListener("mouseenter", () => {
    if (window.innerWidth > 860) openPanel();
  });

  panel.addEventListener("mouseleave", () => {
    if (window.innerWidth > 860) closePanel();
  });

  // intro click
  intro.addEventListener("click", (event) => {
    event.preventDefault();

    if (window.innerWidth <= 860) {
      const isOpen = panel.classList.toggle("is-open");
      intro.setAttribute("aria-expanded", isOpen ? "true" : "false");
      return;
    }

    openPanel();
  });

  intro.addEventListener("focus", () => {
    if (window.innerWidth > 860) {
      moveSharedCoreTo(introSlot);
    }
  });

  // triggers
  triggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", () => {
      if (window.innerWidth > 860 && !panel.classList.contains("is-open")) {
        openPanel();
      }
      if (window.innerWidth > 860) {
        moveSharedCoreTo(trigger);
      }
    });

    trigger.addEventListener("focus", () => {
      if (window.innerWidth > 860) {
        openPanel();
        moveSharedCoreTo(trigger);
      }
    });

    trigger.addEventListener("click", (event) => {
      event.preventDefault();

      if (window.innerWidth > 860 && !panel.classList.contains("is-open")) {
        openPanel();
      }

      openIntent(trigger);
    });
  });

  // outside click
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".intent-menu")) {
      if (window.innerWidth <= 860) {
        panel.classList.remove("is-open");
        intro.setAttribute("aria-expanded", "false");
      } else {
        closePanel();
      }
    }
  });

  // escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (window.innerWidth <= 860) {
        panel.classList.remove("is-open");
        intro.setAttribute("aria-expanded", "false");
      } else {
        closePanel();
      }
    }
  });

  // resize
  window.addEventListener("resize", () => {
    closeAllIntentMenus();

    if (window.innerWidth <= 860) {
      panel.classList.add("is-open");
      intro.setAttribute("aria-expanded", "true");
      sharedCore.style.opacity = "0";
    } else {
      panel.classList.remove("is-open");
      intro.setAttribute("aria-expanded", "false");
      sharedCore.style.opacity = "1";

      requestAnimationFrame(() => {
        moveSharedCoreTo(introSlot);
      });
    }
  });
});
