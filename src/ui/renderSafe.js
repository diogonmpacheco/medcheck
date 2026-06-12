// MedCheck Engine — safe rendering helpers for generated/imported strings

function safeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeAttr(value) {
  return safeHtml(value).replace(/`/g, "&#96;");
}

function safeText(value, fallback = "") {
  const text = String(value ?? fallback ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

function safeTextList(values = [], separator = " · ") {
  return values
    .map(value => safeText(value))
    .filter(Boolean)
    .map(value => safeHtml(value))
    .join(separator);
}
