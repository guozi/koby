export function hexToRgb(h) {
  if (!/^#[0-9a-fA-F]{6}$/.test(h)) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  }
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function luminance(r, g, b) {
  return 0.2126 * srgbToLinear(r / 255) + 0.7152 * srgbToLinear(g / 255) + 0.0722 * srgbToLinear(b / 255)
}

export function contrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function rgbToCmyk(r, g, b) {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 }
  const c1 = 1 - r / 255, m1 = 1 - g / 255, y1 = 1 - b / 255
  const k = Math.min(c1, m1, y1)
  return {
    c: Math.round((c1 - k) / (1 - k) * 100),
    m: Math.round((m1 - k) / (1 - k) * 100),
    y: Math.round((y1 - k) / (1 - k) * 100),
    k: Math.round(k * 100)
  }
}

export function rgbToOklch(r, g, b) {
  const lr = srgbToLinear(r / 255), lg = srgbToLinear(g / 255), lb = srgbToLinear(b / 255)
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  const l1 = Math.cbrt(l_), m1 = Math.cbrt(m_), s1 = Math.cbrt(s_)
  const L = 0.2104542553 * l1 + 0.7936177850 * m1 - 0.0040720468 * s1
  const a = 1.9779984951 * l1 - 2.4285922050 * m1 + 0.4505937099 * s1
  const bv = 0.0259040371 * l1 + 0.7827717662 * m1 - 0.8086757660 * s1
  const C = Math.sqrt(a * a + bv * bv)
  let H = Math.atan2(bv, a) * 180 / Math.PI
  if (H < 0) H += 360
  return { L: (L * 100).toFixed(1), C: (C * 100).toFixed(1), H: H.toFixed(1) }
}

export function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
