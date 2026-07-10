const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const modal = document.querySelector("[data-modal]");
const openModalButtons = document.querySelectorAll("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const contactForm = document.querySelector("[data-contact-form]");
const newsletterForm = document.querySelector("[data-newsletter-form]");
const editorToggle = document.querySelector("[data-editor-toggle]");
const editorAddText = document.querySelector("[data-editor-add-text]");
const editorAddImage = document.querySelector("[data-editor-add-image]");
const editorSave = document.querySelector("[data-editor-save]");
const editorSaveRepo = document.querySelector("[data-editor-save-repo]");
const editorExport = document.querySelector("[data-editor-export]");
const editorReset = document.querySelector("[data-editor-reset]");
const editorStatus = document.querySelector("[data-editor-status]");
const imagePicker = document.querySelector("[data-image-picker]");
const storageKey = "halosight-template-edits-v9";

let activeImageTarget = null;
let editorActive = false;
let customItemCounter = 0;
let activeDrag = null;

const toPascalCase = (value) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const createLucideNode = ([tag, attrs = {}, children = []]) => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  children.forEach((child) => node.appendChild(createLucideNode(child)));
  return node;
};

const renderLocalLucideIcons = () => {
  if (!window.lucide?.icons) return;

  document.querySelectorAll("[data-lucide]").forEach((target) => {
    if (target.querySelector("svg")) return;

    const iconName = toPascalCase(target.dataset.lucide || "");
    const icon = window.lucide.icons[iconName];
    if (!icon) return;

    const svg = createLucideNode(["svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, icon]);

    target.appendChild(svg);
  });
};

renderLocalLucideIcons();

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
  "[data-custom-item] *",
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
  prepareDropHosts();

  getEditableFields().forEach((element, index) => {
    fieldIdFor(element, index);
    element.classList.add("editor-field");
    element.setAttribute("spellcheck", "true");
  });

  document.querySelectorAll("img[data-edit-image]").forEach((image, index) => {
    imageIdFor(image, index);
  });
}

function getBaseEditableImages() {
  return [...document.querySelectorAll("img[data-edit-image]")]
    .filter((image) => !image.closest("[data-custom-item]"));
}

function setEditorMode(active) {
  editorActive = active;
  document.body.classList.toggle("editor-active", active);
  if (editorToggle) editorToggle.textContent = active ? "Done" : "Edit";
  if (editorStatus) editorStatus.textContent = active ? "Click text or image fields" : "View mode";

  getEditableFields().forEach((element) => {
    element.contentEditable = active ? "true" : "false";
    if (active) {
      element.setAttribute("aria-label", "Editable text field");
    } else {
      element.removeAttribute("aria-label");
      element.blur();
    }
  });

  document.querySelectorAll(".custom-text-content").forEach((element) => {
    element.contentEditable = active ? "true" : "false";
    element.setAttribute("spellcheck", "true");
  });
}

function serializeEdits() {
  const text = {};
  getEditableFields().forEach((element, index) => {
    text[fieldIdFor(element, index)] = element.innerHTML;
  });

  const images = {};
  getBaseEditableImages().forEach((image, index) => {
    const id = imageIdFor(image, index);
    images[id] = {
      src: image.getAttribute("src") || "",
      alt: image.getAttribute("alt") || "",
      hasImage: Boolean(image.getAttribute("src"))
    };
  });

  return { text, images, customItems: serializeCustomItems() };
}

function saveEdits(showStatus = true) {
  localStorage.setItem(storageKey, JSON.stringify(serializeEdits()));
  if (showStatus) {
    editorStatus.textContent = "Saved in this browser";
  }
}

function prepareDropHosts() {
  const hosts = document.querySelectorAll("main > section, .integration-band, .site-footer");
  hosts.forEach((host, index) => {
    if (!host.dataset.customHost) {
      host.dataset.customHost = `host-${index}`;
    }
  });
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

    renderCustomItems(edits.customItems || []);

    getBaseEditableImages().forEach((image, index) => {
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
  clone.querySelectorAll('script[src="./script.js"], script[src="script.js"]').forEach((element) => {
    element.remove();
  });
  clone.querySelectorAll(".custom-drag-handle").forEach((element) => {
    element.remove();
  });
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
  clone.querySelectorAll("[data-custom-item]").forEach((element) => {
    element.classList.remove("is-selected");
    element.removeAttribute("data-custom-item");
    element.removeAttribute("data-custom-type");
    element.removeAttribute("data-theme");
  });
  clone.querySelectorAll("[data-custom-host]").forEach((element) => {
    element.removeAttribute("data-custom-host");
  });
  clone.querySelectorAll("[data-image-replace]").forEach((element) => {
    element.remove();
  });
  clone.querySelector("body")?.classList.remove("editor-active");
  clone.querySelector("body")?.classList.remove("modal-open");
  return `<!doctype html>\n${clone.outerHTML}`;
}

function cleanCloneForRepoSave() {
  const clone = document.documentElement.cloneNode(true);
  clone.querySelectorAll("[contenteditable]").forEach((element) => {
    element.removeAttribute("contenteditable");
    element.removeAttribute("spellcheck");
    element.removeAttribute("aria-label");
  });
  clone.querySelectorAll(".editor-field").forEach((element) => {
    element.classList.remove("editor-field");
  });
  clone.querySelectorAll(".custom-drag-handle").forEach((element) => {
    element.remove();
  });
  clone.querySelectorAll("[data-lucide] svg").forEach((element) => {
    element.remove();
  });
  clone.querySelectorAll("[data-custom-item]").forEach((element) => {
    element.classList.remove("is-selected");
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

async function saveRepoHtml() {
  saveEdits(false);
  editorStatus.textContent = "Saving to repo...";

  try {
    const response = await fetch("http://127.0.0.1:5175/save-to-repo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ html: cleanCloneForRepoSave() })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || "Repo save failed.");
    }

    editorStatus.textContent = "Saved to repo index.html";
  } catch (error) {
    console.warn("Unable to save edited template to repo.", error);
    editorStatus.textContent = "Start repo save server, then retry";
  }
}

function updateImageFieldState(image) {
  const imageField = image.closest("[data-image-field], .custom-image-box");
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

function isDarkHost(host) {
  return host.classList.contains("section-dark") || host.classList.contains("integration-band") || host.classList.contains("site-footer");
}

function getPlacementHost() {
  const hosts = [...document.querySelectorAll("[data-custom-host]")];
  const viewportCenter = window.innerHeight * 0.42;
  const centeredHost = hosts.find((host) => {
    const rect = host.getBoundingClientRect();
    return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
  });

  return centeredHost || hosts.find((host) => {
    const rect = host.getBoundingClientRect();
    return rect.bottom > 120;
  }) || document.querySelector("[data-custom-host]");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function nextCustomId() {
  customItemCounter += 1;
  return `custom-${Date.now()}-${customItemCounter}`;
}

function buildDragHandle() {
  const handle = document.createElement("button");
  handle.className = "custom-drag-handle";
  handle.type = "button";
  handle.textContent = "Move";
  handle.setAttribute("aria-label", "Move object");
  return handle;
}

function createCustomTextBox(data = {}) {
  const item = document.createElement("div");
  item.className = "custom-layer-item custom-text-box";
  item.dataset.customItem = data.id || nextCustomId();
  item.dataset.customType = "text";
  item.tabIndex = 0;
  if (data.theme) item.dataset.theme = data.theme;

  const content = document.createElement("div");
  content.className = "custom-text-content editor-field";
  content.innerHTML = data.html || "Click to edit this text box.";

  item.append(buildDragHandle(), content);
  applyCustomGeometry(item, data);
  return item;
}

function createCustomImageBox(data = {}) {
  const item = document.createElement("figure");
  item.className = "custom-layer-item custom-image-box";
  item.dataset.customItem = data.id || nextCustomId();
  item.dataset.customType = "image";
  item.tabIndex = 0;

  const handle = buildDragHandle();
  const image = document.createElement("img");
  image.alt = data.alt || "Editable image";
  image.dataset.editImage = "Custom image";
  image.dataset.imageId = `${item.dataset.customItem}-image`;
  if (data.src) image.src = data.src;

  const caption = document.createElement("figcaption");
  caption.textContent = "Image field";

  const replace = document.createElement("button");
  replace.className = "image-field-button";
  replace.type = "button";
  replace.dataset.imageReplace = "";
  replace.textContent = "Replace image";

  item.append(handle, image, caption, replace);
  applyCustomGeometry(item, data);
  updateImageFieldState(image);
  return item;
}

function applyCustomGeometry(item, data) {
  if (data.left != null) item.style.left = `${data.left}px`;
  if (data.top != null) item.style.top = `${data.top}px`;
  if (data.width != null) item.style.width = `${data.width}px`;
  if (data.height != null) item.style.height = `${data.height}px`;
}

function addCustomItem(type, data = {}) {
  const host = data.host
    ? document.querySelector(`[data-custom-host="${data.host}"]`)
    : getPlacementHost();
  if (!host) return null;

  const hostRect = host.getBoundingClientRect();
  const left = data.left ?? clamp(window.innerWidth * 0.5 - hostRect.left - 140, 24, Math.max(24, hostRect.width - 260));
  const top = data.top ?? clamp(window.innerHeight * 0.42 - hostRect.top, 48, Math.max(48, hostRect.height - 160));
  const theme = data.theme || (isDarkHost(host) ? "dark" : "");
  const item = type === "image"
    ? createCustomImageBox({ ...data, left, top })
    : createCustomTextBox({ ...data, left, top, theme });

  host.append(item);
  setEditorMode(true);
  selectCustomItem(item);
  if (!data.restoring) {
    if (type === "text") item.querySelector(".custom-text-content")?.focus();
    editorStatus.textContent = type === "image" ? "Added image field" : "Added text box";
    saveEdits(false);
  }
  return item;
}

function serializeCustomItems() {
  return [...document.querySelectorAll("[data-custom-item]")].map((item) => {
    const rect = item.getBoundingClientRect();
    const image = item.querySelector("img[data-edit-image]");
    return {
      id: item.dataset.customItem,
      type: item.dataset.customType,
      host: item.closest("[data-custom-host]")?.dataset.customHost,
      theme: item.dataset.theme || "",
      left: parseFloat(item.style.left) || 0,
      top: parseFloat(item.style.top) || 0,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      html: item.querySelector(".custom-text-content")?.innerHTML || "",
      src: image?.getAttribute("src") || "",
      alt: image?.getAttribute("alt") || ""
    };
  });
}

function renderCustomItems(items) {
  document.querySelectorAll("[data-custom-item]").forEach((item) => item.remove());
  items.forEach((item) => addCustomItem(item.type, { ...item, restoring: true }));
  setEditorMode(false);
}

function selectCustomItem(item) {
  document.querySelectorAll("[data-custom-item].is-selected").forEach((selected) => {
    selected.classList.remove("is-selected");
  });
  item?.classList.add("is-selected");
  item?.focus({ preventScroll: true });
}

function nudgeSelectedCustomItem(event) {
  if (!editorActive) return;
  if (event.target?.isContentEditable) return;
  const keyMap = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0]
  };
  const direction = keyMap[event.key];
  if (!direction) return;

  const item = document.querySelector("[data-custom-item].is-selected");
  const host = item?.closest("[data-custom-host]");
  if (!item || !host) return;

  event.preventDefault();
  const step = event.shiftKey ? 10 : 2;
  const hostRect = host.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const currentLeft = parseFloat(item.style.left) || 0;
  const currentTop = parseFloat(item.style.top) || 0;
  const nextLeft = clamp(currentLeft + direction[0] * step, 0, Math.max(0, hostRect.width - itemRect.width));
  const nextTop = clamp(currentTop + direction[1] * step, 0, Math.max(0, hostRect.height - itemRect.height));
  item.style.left = `${Math.round(nextLeft)}px`;
  item.style.top = `${Math.round(nextTop)}px`;
  editorStatus.textContent = "Unsaved changes";
}

function startCustomDrag(event, handle) {
  if (!editorActive) return;
  if (activeDrag) return;
  const item = handle.closest("[data-custom-item]");
  const host = item?.closest("[data-custom-host]");
  if (!item || !host) return;

  event.preventDefault();
  selectCustomItem(item);
  const itemRect = item.getBoundingClientRect();
  activeDrag = {
    item,
    host,
    offsetX: event.clientX - itemRect.left,
    offsetY: event.clientY - itemRect.top
  };
  if (event.pointerId != null) {
    handle.setPointerCapture?.(event.pointerId);
  }
}

function moveCustomDrag(event) {
  if (!activeDrag) return;
  const hostRect = activeDrag.host.getBoundingClientRect();
  const itemRect = activeDrag.item.getBoundingClientRect();
  const nextLeft = clamp(event.clientX - hostRect.left - activeDrag.offsetX, 0, Math.max(0, hostRect.width - itemRect.width));
  const nextTop = clamp(event.clientY - hostRect.top - activeDrag.offsetY, 0, Math.max(0, hostRect.height - itemRect.height));
  activeDrag.item.style.left = `${Math.round(nextLeft)}px`;
  activeDrag.item.style.top = `${Math.round(nextTop)}px`;
  editorStatus.textContent = "Unsaved changes";
}

function endCustomDrag() {
  if (!activeDrag) return;
  activeDrag = null;
  saveEdits(false);
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

openModalButtons.forEach((button) => button.addEventListener("click", openModal));
closeModalButtons.forEach((button) => button.addEventListener("click", closeModal));

document.addEventListener("click", (event) => {
  const replaceButton = event.target.closest("[data-image-replace]");
  if (replaceButton) {
    const image = replaceButton.closest("[data-image-field], [data-custom-item]")?.querySelector("img[data-edit-image]");
    if (image) chooseImageFor(image);
    return;
  }

  const editableImage = event.target.closest("img[data-edit-image]");
  if (editorActive && editableImage) {
    event.preventDefault();
    chooseImageFor(editableImage);
  }

  const customItem = event.target.closest("[data-custom-item]");
  if (editorActive && customItem) {
    selectCustomItem(customItem);
  }
});

document.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest(".custom-drag-handle");
  if (handle) startCustomDrag(event, handle);
});

document.addEventListener("pointermove", moveCustomDrag);
document.addEventListener("pointerup", endCustomDrag);
document.addEventListener("pointercancel", endCustomDrag);
document.addEventListener("mousedown", (event) => {
  const handle = event.target.closest(".custom-drag-handle");
  if (handle) startCustomDrag(event, handle);
});
document.addEventListener("mousemove", moveCustomDrag);
document.addEventListener("mouseup", endCustomDrag);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
  nudgeSelectedCustomItem(event);

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveEdits();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.closest(".editor-field") || event.target.closest("[data-custom-item]")) {
    editorStatus.textContent = "Unsaved changes";
  }
});

editorToggle?.addEventListener("click", () => {
  setEditorMode(!editorActive);
  if (!editorActive) saveEdits();
});

editorSave?.addEventListener("click", () => saveEdits());
editorAddText?.addEventListener("click", () => addCustomItem("text"));
editorAddImage?.addEventListener("click", () => addCustomItem("image"));
editorSaveRepo?.addEventListener("click", saveRepoHtml);
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
