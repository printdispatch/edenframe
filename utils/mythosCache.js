
let personaCache = null
let symbolCache = null

export function cachePersona(p) {
  personaCache = p
}

export function getCachedPersona() {
  return personaCache
}

export function cacheSymbols(s) {
  symbolCache = s
}

export function getCachedSymbols() {
  return symbolCache
}
