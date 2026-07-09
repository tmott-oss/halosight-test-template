const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const modal = document.querySelector("[data-modal]");
const openModalButtons = document.querySelectorAll("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const contactForm = document.querySelector("[data-contact-form]");
const newsletterForm = document.querySelector("[data-newsletter-form]");
const editorToggle = document.querySelector("[data-editor-toggle]");
const editorSave = document.querySelector("[data-editor-save]");
const editorExport = document.querySelector("[data-editor-export]");
const editorReset = document.querySelector("[data-editor-reset]");
const editorStatus = document.querySelector("[data-editor-status]");
const imagePicker = document.querySelector("[data-image-picker]");
const storageKey = "halosight-template-edits-v1";

let activeImageTarget = null;
let editorActive = false;

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

const editableSelector = [
  "main h1",
  "main h2",
  "main h3",
  "main p",
  "main strong",
  "main small",
  "main li",
  "main a.button",
  "main .feature-grid a",
  "main .resource-card a",
  "main .icon-tile",
  "main .feature-icon",
  "main .stack-node",
  "main .plan-label",
  "main .price",
  "footer h2",
  "footer p",
  "footer a"
].join(", ");

const excludedEditableSelector = [
  ".editor-toolbar *",
  ".modal *",
  "form *",
  "button",
  "input",
  "textarea",
  "[data-image-field] *",
  ".site-nav *"
].join(", ");

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeNav() {
  nav?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

function openModal() {
  if (editorActive) return;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector("input")?.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function fieldIdFor(element, index) {
  if (!element.dataset.editorId) {
    element.dataset.editorId = `field-${index}`;
  }
  return element.dataset.editorId;
}

function imageIdFor(element, index) {
  if (!element.dataset.imageId) {
    element.dataset.imageId = `image-${index}`;
  }
  return element.dataset.imageId;
}

function getEditableFields() {
  return [...document.querySelectorAll(editableSelector)]
    .filter((element) => !element.closest(excludedEditableSelector))
    .filter((element) => element.textContent.trim().length > 0);
}

function prepareEditableFields() {
  getEditableFields().forEach((element, index) => {
    fieldIdFor(element, index);
    element.classList.add("editor-field");
    element.setAttribute("spellcheck", "true");
  });

  document.querySelectorAll("img[data-edit-image]").forEach((image, index) => {
    imageIdFor(image, index);
  });
}

function setEditorMode(active) {
  editorActive = active;
  document.body.classList.toggle("editor-active", active);
  editorToggle.textContent = active ? "Done" : "Edit";
  editorStatus.textContent = active ? "Click text or image fields" : "View mode";

  getEditableFields().forEach((element) => {
    element.contentEditable = active ? "true" : "false";
    if (active) {
      element.setAttribute("aria-label", "Editable text field");
    } else {
      element.removeAttribute("aria-label");
      element.blur();
    }
  });
}

function serializeEdits() {
  const text = {};
  getEditableFields().forEach((element, index) => {
    text[fieldIdFor(element, index)] = element.innerHTML;
  });

  const images = {};
  document.querySelectorAll("img[data-edit-image]").forEach((image, index) => {
    const id = imageIdFor(image, index);
    images[id] = {
      src: image.getAttribute("src") || "",
      alt: image.getAttribute("alt") || "",
      hasImage: Boolean(image.getAttribute("src"))
    };
  });

  return { text, images };
}

function saveEdits(showStatus = true) {
  localStorage.setItem(storageKey, JSON.stringify(serializeEdits()));
  if (showStatus) {
    editorStatus.textContent = "Saved in this browser";
  }
}

function applyEdits() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;

  try {
    const edits = JSON.parse(raw);
    getEditableFields().forEach((element, index) => {
      const id = fieldIdFor(element, index);
      if (edits.text?.[id]) {
        element.innerHTML = edits.text[id];
      }
    });

    document.querySelectorAll("img[data-edit-image]").forEach((image, index) => {
      const id = imageIdFor(image, index);
      const saved = edits.images?.[id];
      if (!saved) return;
      if (saved.src) image.setAttribute("src", saved.src);
      image.setAttribute("alt", saved.alt || image.alt || "Editable image");
      updateImageFieldState(image);
    });
  } catch (error) {
    console.warn("Unable to restore saved template edits.", error);
  }
}

function resetEdits() {
  if (!window.confirm("Reset this browser's saved edits and reload the original template?")) return;
  localStorage.removeItem(storageKey);
  window.location.reload();
}

function cleanCloneForExport() {
  const clone = document.documentElement.cloneNode(true);
  clone.querySelector(".editor-toolbar")?.remove();
  clone.querySelector("[data-image-picker]")?.remove();
  clone.querySelectorAll("[contenteditable]").forEach((element) => {
    element.removeAttribute("contenteditable");
    element.removeAttribute("spellcheck");
    element.removeAttribute("aria-label");
  });
  clone.querySelectorAll(".editor-field").forEach((element) => {
    element.classList.remove("editor-field");
  });
  clone.querySelectorAll("[data-editor-id]").forEach((element) => {
    element.removeAttribute("data-editor-id");
  });
  clone.querySelectorAll("[data-image-id]").forEach((element) => {
    element.removeAttribute("data-image-id");
  });
  clone.querySelectorAll("[data-image-replace]").forEach((element) => {
    element.remove();
  });
  clone.querySelector("body")?.classList.remove("editor-active");
  clone.querySelector("body")?.classList.remove("modal-open");
  return `<!doctype html>\n${clone.outerHTML}`;
}

function exportHtml() {
  saveEdits(false);
  const blob = new Blob([cleanCloneForExport()], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "halosight-edited-template.html";
  link.click();
  URL.revokeObjectURL(url);
  editorStatus.textContent = "Exported edited HTML";
}

function updateImageFieldState(image) {
  const imageField = image.closest("[data-image-field]");
  if (imageField) {
    imageField.classList.toggle("has-image", Boolean(image.getAttribute("src")));
  }
}

function chooseImageFor(target) {
  activeImageTarget = target;
  imagePicker.value = "";
  imagePicker.click();
}

function replaceImageFromFile(file) {
  if (!file || !activeImageTarget) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    activeImageTarget.setAttribute("src", reader.result);
    activeImageTarget.setAttribute("alt", file.name.replace(/\.[^.]+$/, ""));
    updateImageFieldState(activeImageTarget);
    saveEdits();
  });
  reader.readAsDataURL(file);
}

window.addEventListener("scroll", setHeaderState);
setHeaderState();
prepareEditableFields();
applyEdits();
setEditorMode(false);

navToggle?.addEventListener("click", () => {
  const willOpen = !nav.classList.contains("is-open");
  nav.classList.toggle("is-open", willOpen);
  navToggle.setAttribute("aria-expanded", String(willOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeNav();
});

document.querySelector("[data-steps]")?.addEventListener("click", (event) => {
  if (editorActive) return;
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

document.addEventListener("click", (event) => {
  const replaceButton = event.target.closest("[data-image-replace]");
  if (replaceButton) {
    const image = replaceButton.closest("[data-image-field]")?.querySelector("img[data-edit-image]");
    if (image) chooseImageFor(image);
    return;
  }

  const editableImage = event.target.closest("img[data-edit-image]");
  if (editorActive && editableImage) {
    event.preventDefault();
    chooseImageFor(editableImage);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveEdits();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.closest(".editor-field")) {
    editorStatus.textContent = "Unsaved changes";
  }
});

editorToggle?.addEventListener("click", () => {
  setEditorMode(!editorActive);
  if (!editorActive) saveEdits();
});

editorSave?.addEventListener("click", () => saveEdits());
editorExport?.addEventListener("click", exportHtml);
editorReset?.addEventListener("click", resetEdits);

imagePicker?.addEventListener("change", (event) => {
  replaceImageFromFile(event.target.files?.[0]);
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
