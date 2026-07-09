const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const modal = document.querySelector("[data-modal]");
const openModalButtons = document.querySelectorAll("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const contactForm = document.querySelector("[data-contact-form]");
const newsletterForm = document.querySelector("[data-newsletter-form]");

const stepContent = {
  capture: {
    title: "Capture Customer Interactions",
    body: "Your rep opens the app, hits record, and focuses on the conversation instead of the keyboard."
  },
  extract: {
    title: "We Do The Heavy Lifting",
    body: "Halosight extracts commitments, objections, relationship details, and buying signals from the meeting."
  },
  sync: {
    title: "CRM Gets Updated",
    body: "Meeting summaries, contacts, follow-ups, and account fields are drafted for the right CRM records."
  },
  act: {
    title: "You Look Like A Genius",
    body: "The account team follows up quickly with the details, promises, and context that customers expect."
  }
};

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeNav() {
  nav?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

function openModal() {
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector("input")?.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

window.addEventListener("scroll", setHeaderState);
setHeaderState();

navToggle?.addEventListener("click", () => {
  const willOpen = !nav.classList.contains("is-open");
  nav.classList.toggle("is-open", willOpen);
  navToggle.setAttribute("aria-expanded", String(willOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeNav();
});

document.querySelector("[data-steps]")?.addEventListener("click", (event) => {
  const step = event.target.closest("[data-step]");
  if (!step) return;

  document.querySelectorAll("[data-step]").forEach((button) => button.classList.remove("is-active"));
  step.classList.add("is-active");

  const preview = document.querySelector("[data-step-preview]");
  const content = stepContent[step.dataset.step];
  preview.querySelector("h3").textContent = content.title;
  preview.querySelector("p").textContent = content.body;
});

openModalButtons.forEach((button) => button.addEventListener("click", openModal));
closeModalButtons.forEach((button) => button.addEventListener("click", closeModal));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = contactForm.querySelector("[data-contact-status]");
  status.textContent = "Test request captured locally. Wire this to your CRM or form backend when ready.";
  status.classList.add("is-success");
  contactForm.reset();
});

newsletterForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = newsletterForm.querySelector("[data-newsletter-status]");
  status.textContent = "Subscribed locally for prototype testing.";
  status.classList.add("is-success");
  newsletterForm.reset();
});
