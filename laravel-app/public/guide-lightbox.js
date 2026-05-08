(function () {
  function initGuideLightbox() {
    var overlay = document.getElementById("guideLightbox");
    var image = document.getElementById("guideLightboxImage");
    var caption = document.getElementById("guideLightboxCaption");
    var closeButton = document.getElementById("guideLightboxClose");
    if (!overlay || !image || !caption || !closeButton) {
      return;
    }

    var zoomables = document.querySelectorAll(".visual-card img, .guide-card img, .step-card img");

    function openLightbox(source) {
      image.src = source.currentSrc || source.src;
      image.alt = source.alt || "";
      caption.textContent = source.dataset.caption || source.alt || "";
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      closeButton.focus();
    }

    function closeLightbox() {
      overlay.hidden = true;
      image.src = "";
      image.alt = "";
      caption.textContent = "";
      document.body.style.overflow = "";
    }

    zoomables.forEach(function (img) {
      img.classList.add("guide-zoomable");
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", (img.alt || "画像") + " を拡大");
      img.addEventListener("click", function () {
        openLightbox(img);
      });
      img.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(img);
        }
      });
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeLightbox();
      }
    });
    closeButton.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !overlay.hidden) {
        closeLightbox();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGuideLightbox);
  } else {
    initGuideLightbox();
  }
}());
