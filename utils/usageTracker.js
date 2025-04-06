
export function estimateTokens(text) {
  const words = text.trim().split(/\s+/).length
  return Math.round(words * 1.5) // Rough estimate: 1 word ≈ 1.5 tokens
}

export function selectModel(prompt, memoryLines) {
  const tokenEstimate = estimateTokens(prompt + memoryLines)
  const threshold = 1000 // Adjustable threshold for using gpt-4o

  if (tokenEstimate > threshold || /sky split|rodeo|charged|release/.test(prompt.toLowerCase())) {
    return 'gpt-4o'
  }
  return 'gpt-3.5-turbo'
}
