
let persona = null
let symbols = null

export function cachePersona(data) {
  persona = data
}
export function getCachedPersona() {
  return persona
}

export function cacheSymbols(data) {
  symbols = data
}
export function getCachedSymbols() {
  return symbols
}
