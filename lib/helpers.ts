export const setUnstableVariant = (enabled: boolean) => {
  const html = document.documentElement

  if (enabled) {
    if (html.getAttribute("data-theme") !== "unstable") {
      html.setAttribute("data-theme", "unstable")
    }
    return
  }

  if (html.getAttribute("data-theme") === "unstable") {
    html.removeAttribute("data-theme")
  }
}
