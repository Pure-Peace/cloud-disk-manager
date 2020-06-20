export function hasClass (el, className) {
  if (!className) {
    return true
  }
  if (!el || !el.className || typeof el.className !== 'string') {
    return false
  }
  for (const cn of el.className.split(/\s+/)) {
    if (cn === className) {
      return true
    }
  }
  return false
}

export function getElementsByClassName (className) {
  const els = []
  for (const el of document.getElementsByClassName(className) || []) {
    els.push(el)
  }
  return els
}
