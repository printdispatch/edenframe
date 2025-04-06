
export function estimateTokens(input) {
  const words = input.trim().split(/\s+/).length
  return Math.round(words * 1.5) // rough approximation
}

export function selectModel(prompt, memory) {
  const totalTokens = estimateTokens(prompt + memory)
  return totalTokens > 3000 ? 'gpt-3.5-turbo' : 'gpt-4o'
}
