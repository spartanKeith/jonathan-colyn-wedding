/* =========================================================
  JONATHAN & COLYN WEDDING WEBSITE
  File: js/script.js
  Purpose: All website interactions only.
========================================================= */

/* =========================================================
  00. CONFIG
========================================================= */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBCetK4lCxTckthtPa_b2lPW1PK24i_rNFgGHhlOR84wG0FOSzPIpit1SGLeyOINjr8Q/exec";
const WEDDING_DATE = new Date("2026-08-21T15:00:00+08:00");
const TEST_MODE = !APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR");

/* =========================================================
  01. SMALL HELPERS
========================================================= */
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $all(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function setButtonLoading(button, isLoading, loadingText, defaultText) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : defaultText;
}

/* =========================================================
  02. INVITATION GATE
========================================================= */
/* 3D Flip Card Invitation Gate */
document.body.classList.add("no-scroll");

const gate = document.getElementById("gate");
const openInviteBtn = document.getElementById("openInviteBtn");

if (gate && openInviteBtn) {
  openInviteBtn.addEventListener("click", () => {
    if (gate.classList.contains("opening")) return;

    gate.classList.add("opening");
    openInviteBtn.disabled = true;

    if (typeof playWeddingMusic === "function") {
      playWeddingMusic();
    }

    /*
      Flow:
      1. Card opens
      2. Wedding card stays visible for 2 seconds
      3. Gate fades out
      4. Scrolls to home
    */

    setTimeout(() => {
      gate.classList.add("exiting");
    }, 2800);

    setTimeout(() => {
      gate.classList.add("hidden");
      document.body.classList.remove("no-scroll");

      const homeSection = document.getElementById("home");

      if (homeSection) {
        homeSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    }, 3400);
  });
}

/* =========================================================
  03. MOBILE NAVIGATION
========================================================= */
const menuBtn = $("#menuBtn");
const nav = $("#nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  $all("a", nav).forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/* =========================================================
  04. COUNTDOWN
========================================================= */
function updateCountdown() {
  const daysEl = $("#days");
  const hoursEl = $("#hours");
  const minutesEl = $("#minutes");
  const secondsEl = $("#seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const now = new Date();
  const diff = Math.max(WEDDING_DATE - now, 0);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");

  setCountdownProgress(daysEl, Math.min((days / 365) * 360, 360));
  setCountdownProgress(hoursEl, (hours / 24) * 360);
  setCountdownProgress(minutesEl, (minutes / 60) * 360);
  setCountdownProgress(secondsEl, (seconds / 60) * 360);
}

function setCountdownProgress(numberElement, degrees) {
  const circle = numberElement.closest("div");
  if (circle) circle.style.setProperty("--progress", `${degrees}deg`);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* =========================================================
  05. SCROLL REVEAL ANIMATION
========================================================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.14 });

$all(".reveal").forEach(element => revealObserver.observe(element));

/* =========================================================
  06. FAQ ACCORDION
========================================================= */
$all(".faq-item").forEach(button => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    if (!answer) return;

    const isOpen = answer.classList.contains("open");

    $all(".faq-answer.open").forEach(openAnswer => openAnswer.classList.remove("open"));
    $all(".faq-item strong").forEach(icon => { icon.textContent = "+"; });

    if (!isOpen) {
      answer.classList.add("open");
      const icon = $("strong", button);
      if (icon) icon.textContent = "−";
    }
  });
});

/* =========================================================
  07. RSVP FORM
========================================================= */
const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

if (form && statusEl && submitBtn) {
  const attendanceRadios = form.querySelectorAll('input[name="attendance"]');
  const guest1 = document.getElementById("guest1");
  const mealRadios = form.querySelectorAll('input[name="mealPreference"]');

  function updateGuestFields() {
    const selectedAttendance = form.querySelector('input[name="attendance"]:checked')?.value;

    if (selectedAttendance === "Regretfully Declines") {
      if (guest1) {
        guest1.value = "";
        guest1.disabled = true;
        guest1.required = false;
      }

      mealRadios.forEach(radio => {
        radio.checked = false;
        radio.disabled = true;
      });

      form.classList.add("disabled-guest-fields");

    } else if (selectedAttendance === "Joyfully Accepts") {
      if (guest1) {
        guest1.disabled = false;
        guest1.required = true;
      }

      mealRadios.forEach(radio => {
        radio.disabled = false;
      });

      form.classList.remove("disabled-guest-fields");

    } else {
      if (guest1) {
        guest1.disabled = false;
        guest1.required = false;
      }

      mealRadios.forEach(radio => {
        radio.disabled = false;
      });

      form.classList.remove("disabled-guest-fields");
    }
  }

  function showRsvpSuccessMessage() {
    const selectedAttendance =
      form.querySelector('input[name="attendance"]:checked')?.value || "";

    const existingMessage = document.querySelector(".rsvp-success-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    const successMessage = document.createElement("div");
    successMessage.className = "rsvp-form rsvp-success-message reveal visible";
    successMessage.setAttribute("role", "status");
    successMessage.setAttribute("aria-live", "polite");

    successMessage.innerHTML = `
      <p class="eyebrow">RSVP Submitted</p>
      <h2>Thank you for your response.</h2>
      <p>
        ${
          selectedAttendance === "Regretfully Declines"
            ? "We have received your RSVP. Thank you for letting us know."
            : "We have received your RSVP and we are excited to celebrate with you."
        }
      </p>
    `;

    form.insertAdjacentElement("afterend", successMessage);

    form.hidden = true;
    form.setAttribute("aria-hidden", "true");

    successMessage.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  attendanceRadios.forEach(radio => {
    radio.addEventListener("change", updateGuestFields);
  });

  updateGuestFields();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submittedAtInput = document.getElementById("submittedAt");

    if (submittedAtInput) {
      submittedAtInput.value = new Date().toISOString();
    }

    const formData = new FormData(form);

    const selectedAttendance =
      form.querySelector('input[name="attendance"]:checked')?.value || "";

    const selectedMeal =
      form.querySelector('input[name="mealPreference"]:checked')?.value || "";

    formData.set("fullName", document.getElementById("fullName")?.value || "");
    formData.set("mobileNumber", document.getElementById("mobileNumber")?.value || "");
    formData.set("email", document.getElementById("email")?.value || "");
    formData.set("attendance", selectedAttendance);
    formData.set("reservedSeats", "1");
    formData.set("guest1", guest1?.value || "");
    formData.set("mealPreference", selectedMeal);
    formData.set("message", document.getElementById("message")?.value || "");
    formData.set("submittedAt", submittedAtInput?.value || new Date().toISOString());

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    statusEl.textContent = "";

    try {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
        const payload = Object.fromEntries(formData.entries());
        console.table(payload);
        localStorage.setItem("lastWeddingRSVP", JSON.stringify(payload));

        form.reset();
        updateGuestFields();
        showRsvpSuccessMessage();
        return;
      }

      const body = new URLSearchParams();

      formData.forEach((value, key) => {
        body.append(key, value);
      });

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: body.toString()
      });

      form.reset();
      updateGuestFields();
      showRsvpSuccessMessage();

    } catch (error) {
      console.error("RSVP submit error:", error);
      statusEl.textContent =
        "Sorry, something went wrong. Please try again or contact the coordinator.";

    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit RSVP";
    }
  });
}

/* =========================================================
  08. COPY BUTTONS
========================================================= */
const copyHashtag = $("#copyHashtag");

if (copyHashtag) {
  copyHashtag.addEventListener("click", async () => {
    await copyToClipboard("#IanNaAngGodsColyn", copyHashtag, "Copied!", "Copy #IanNaAngGodsColyn");
  });
}

const copyGcash = $("#copyGcash");
const gcashNumber = $("#gcashNumber");
const gcashCopyStatus = $("#gcashCopyStatus");

if (copyGcash && gcashNumber && gcashCopyStatus) {
  copyGcash.addEventListener("click", async () => {
    const numberToCopy = gcashNumber.textContent.trim();

    try {
      await navigator.clipboard.writeText(numberToCopy);
      copyGcash.textContent = "Copied!";
      gcashCopyStatus.textContent = "GCash number copied.";

      setTimeout(() => {
        copyGcash.textContent = "Copy";
        gcashCopyStatus.textContent = "Tap copy to copy the GCash number.";
      }, 1800);
    } catch (error) {
      gcashCopyStatus.textContent = `Please copy manually: ${numberToCopy}`;
    }
  });
}

async function copyToClipboard(text, button, successText, defaultText) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = successText;
    setTimeout(() => { button.textContent = defaultText; }, 1800);
  } catch (error) {
    button.textContent = text;
  }
}

/* =========================================================
  09. MUSIC BUTTON
========================================================= */
const bgMusic = $("#bgMusic");
const musicImageBtn = $("#musicImageBtn");
const musicImageBox = $("#musicImageBox");
const musicStatusIcon = $("#musicStatusIcon");

let isWeddingMusicPlaying = false;

async function playWeddingMusic() {
  if (!bgMusic || !musicImageBox || !musicStatusIcon) return;

  try {
    bgMusic.volume = 0.45;
    await bgMusic.play();

    isWeddingMusicPlaying = true;
    musicImageBox.classList.add("playing");
    musicStatusIcon.textContent = "❚❚";
  } catch (error) {
    console.log("Autoplay blocked or music not ready:", error);
    pauseWeddingMusic();
  }
}

function pauseWeddingMusic() {
  if (!bgMusic || !musicImageBox || !musicStatusIcon) return;

  bgMusic.pause();
  isWeddingMusicPlaying = false;
  musicImageBox.classList.remove("playing");
  musicStatusIcon.textContent = "▶";
}

if (musicImageBtn) {
  musicImageBtn.addEventListener("click", () => {
    if (isWeddingMusicPlaying) {
      pauseWeddingMusic();
    } else {
      playWeddingMusic();
    }
  });
}

/* =========================================================
  10. IMAGE LIGHTBOX
========================================================= */
const imageLightbox = $("#imageLightbox");
const lightboxImage = $("#lightboxImage");
const lightboxTitle = $("#lightboxTitle");
const lightboxClose = $("#lightboxClose");

if (imageLightbox && lightboxImage && lightboxTitle && lightboxClose) {
  function openImageLightbox(img) {
    lightboxImage.src = img.getAttribute("src");
    lightboxImage.alt = img.getAttribute("alt") || "Full view image";
    lightboxTitle.textContent = img.getAttribute("data-title") || lightboxImage.alt;

    imageLightbox.classList.add("open");
    imageLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-no-scroll");
  }

  function closeImageLightbox() {
    imageLightbox.classList.remove("open");
    imageLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-no-scroll");

    setTimeout(() => {
      lightboxImage.src = "";
      lightboxImage.alt = "";
      lightboxTitle.textContent = "";
    }, 150);
  }

  document.addEventListener("click", (event) => {
    const clickedImage = event.target.closest(".full-view-img");

    if (clickedImage) {
      openImageLightbox(clickedImage);
      return;
    }

    if (event.target === imageLightbox) closeImageLightbox();
  });

  lightboxClose.addEventListener("click", closeImageLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && imageLightbox.classList.contains("open")) {
      closeImageLightbox();
    }
  });
}
