"use client";

export function toast({ title, description }: { title: string; description?: string }) {
  // Minimal client-side toast: screen-reader friendly + console log.
  try {
    const el = document.createElement("div");
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.className =
      "fixed bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-black text-white px-4 py-2 text-sm shadow-lg z-50";
    el.textContent = description ? `${title} — ${description}` : title;
    document.body.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 2200);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(title, description);
  }
}
