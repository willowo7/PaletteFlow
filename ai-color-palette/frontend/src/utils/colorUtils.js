const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const hexToRgb = (hexColor) => {
  const hex = hexColor.replace('#', '')
  const value = parseInt(hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex, 16)
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff
  }
}

const rgbToHex = (r, g, b) => {
  const toHex = (v) => Math.round(v).toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const srgbToLinear = (channel) => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

const linearToSrgb = (channel) => {
  const c = clamp(channel)
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

export const getLuminance = (hexColor) => {
  const { r, g, b } = hexToRgb(hexColor)
  const rl = srgbToLinear(r)
  const gl = srgbToLinear(g)
  const bl = srgbToLinear(b)
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

export const getContrastRatio = (color1, color2) => {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

export const getContrastLevel = (ratio) => {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'FAIL'
}

const applyMatrix = (hexColor, matrix) => {
  const { r, g, b } = hexToRgb(hexColor)
  const rl = srgbToLinear(r)
  const gl = srgbToLinear(g)
  const bl = srgbToLinear(b)

  const r2 = matrix[0][0] * rl + matrix[0][1] * gl + matrix[0][2] * bl
  const g2 = matrix[1][0] * rl + matrix[1][1] * gl + matrix[1][2] * bl
  const b2 = matrix[2][0] * rl + matrix[2][1] * gl + matrix[2][2] * bl

  const sr = linearToSrgb(r2) * 255
  const sg = linearToSrgb(g2) * 255
  const sb = linearToSrgb(b2) * 255

  return rgbToHex(sr, sg, sb)
}

const MATRICES = {
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7]
  ],
  protanopia: [
    [0.56667, 0.43333, 0],
    [0.55833, 0.44167, 0],
    [0, 0.24167, 0.75833]
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.43333, 0.56667],
    [0, 0.475, 0.525]
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114]
  ]
}

export const simulateDeuteranopia = (hexColor) => applyMatrix(hexColor, MATRICES.deuteranopia)

export const simulateProtanopia = (hexColor) => applyMatrix(hexColor, MATRICES.protanopia)

export const simulateTritanopia = (hexColor) => applyMatrix(hexColor, MATRICES.tritanopia)

export const simulateAchromatopsia = (hexColor) => applyMatrix(hexColor, MATRICES.achromatopsia)
