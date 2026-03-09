(function () {
  const body = document.body;
  const root = document.documentElement;
  const menuOpen = document.querySelector("[data-menu-open]");
  const menuCloseTargets = document.querySelectorAll("[data-menu-close]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const floatingTop = document.querySelector("[data-floating-top]");
  const scrollTriggers = document.querySelectorAll("[data-scroll-top]");
  const languageButtons = Array.from(document.querySelectorAll("[data-language-switch]"));

  let currentLanguage = body.dataset.lang === "zh" ? "zh" : "en";
  let syncLanguageDependentUI = null;

  function syncTitle() {
    const title = currentLanguage === "zh" ? body.dataset.titleZh : body.dataset.titleEn;
    if (title) {
      document.title = title;
    }
  }

  function syncLanguageButtons() {
    languageButtons.forEach((button) => {
      const isActive = button.dataset.languageSwitch === currentLanguage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function setLanguage(nextLanguage, persist = true) {
    currentLanguage = nextLanguage === "zh" ? "zh" : "en";
    body.dataset.lang = currentLanguage;
    root.lang = currentLanguage === "zh" ? "zh-CN" : "en";
    syncLanguageButtons();
    syncTitle();
    if (typeof syncLanguageDependentUI === "function") {
      syncLanguageDependentUI();
    }

    if (!persist) {
      return;
    }

    try {
      window.localStorage.setItem("preferred-language", currentLanguage);
    } catch (error) {
      // Ignore localStorage failures and keep the default language.
    }
  }

  try {
    const storedLanguage = window.localStorage.getItem("preferred-language");
    if (storedLanguage === "en" || storedLanguage === "zh") {
      currentLanguage = storedLanguage;
    }
  } catch (error) {
    currentLanguage = body.dataset.lang === "zh" ? "zh" : "en";
  }

  setLanguage(currentLanguage, false);

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.languageSwitch);
    });
  });

  function openNav() {
    body.classList.add("nav-open");
    if (mobileNav) {
      mobileNav.removeAttribute("aria-hidden");
    }
  }

  function closeNav() {
    body.classList.remove("nav-open");
    if (mobileNav) {
      mobileNav.setAttribute("aria-hidden", "true");
    }
  }

  if (menuOpen) {
    menuOpen.addEventListener("click", openNav);
  }

  menuCloseTargets.forEach((node) => {
    node.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("nav-open")) {
      closeNav();
    }
  });

  scrollTriggers.forEach((node) => {
    node.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  function syncFloatingTop() {
    if (!floatingTop) {
      return;
    }
    floatingTop.classList.toggle("is-visible", window.scrollY > 520);
  }

  syncFloatingTop();
  window.addEventListener("scroll", syncFloatingTop, { passive: true });

  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxCaption = document.querySelector("[data-lightbox-caption]");
  const lightboxClose = document.querySelector("[data-lightbox-close]");
  const lightboxPrev = document.querySelector("[data-lightbox-prev]");
  const lightboxNext = document.querySelector("[data-lightbox-next]");
  const lightboxTriggers = Array.from(document.querySelectorAll("[data-lightboxable]"));

  let currentGroup = [];
  let currentIndex = -1;

  function syncLightbox() {
    if (!lightbox || currentIndex < 0 || !currentGroup.length) {
      return;
    }

    const item = currentGroup[currentIndex];
    lightboxImage.src = item.dataset.lightboxSrc;
    lightboxImage.alt =
      item.dataset[currentLanguage === "zh" ? "lightboxAltZh" : "lightboxAltEn"] ||
      item.dataset.lightboxAlt ||
      "";
    lightboxCaption.textContent =
      item.dataset[currentLanguage === "zh" ? "lightboxCaptionZh" : "lightboxCaptionEn"] ||
      item.dataset.lightboxCaption ||
      "";

    const multiple = currentGroup.length > 1;
    lightboxPrev.hidden = !multiple;
    lightboxNext.hidden = !multiple;
  }

  syncLanguageDependentUI = syncLightbox;

  function openLightboxFor(trigger) {
    if (!lightbox) {
      return;
    }

    const groupName = trigger.dataset.lightboxGroup || "__default__";
    currentGroup = lightboxTriggers.filter((node) => {
      return (node.dataset.lightboxGroup || "__default__") === groupName;
    });
    currentIndex = currentGroup.indexOf(trigger);
    syncLightbox();
    lightbox.classList.add("is-open");
    body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    if (!lightbox) {
      return;
    }
    lightbox.classList.remove("is-open");
    body.classList.remove("lightbox-open");
    currentGroup = [];
    currentIndex = -1;
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxCaption.textContent = "";
  }

  function stepLightbox(direction) {
    if (!currentGroup.length) {
      return;
    }
    currentIndex = (currentIndex + direction + currentGroup.length) % currentGroup.length;
    syncLightbox();
  }

  lightboxTriggers.forEach((node) => {
    node.addEventListener("click", () => openLightboxFor(node));
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightboxFor(node);
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => stepLightbox(-1));
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => stepLightbox(1));
  }

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!lightbox || !lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      stepLightbox(-1);
    }

    if (event.key === "ArrowRight") {
      stepLightbox(1);
    }
  });
})();
