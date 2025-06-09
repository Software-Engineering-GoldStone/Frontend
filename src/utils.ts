const IMAGE_BASE_URL = '/img/cards/'

export function getActionCardImageUrl(
  actionType: string,
  tools: string | string[] | undefined,
): string {
  if (!tools) {
    return `${IMAGE_BASE_URL}/${actionType}.png`
  }

  if (Array.isArray(tools)) {
    tools.sort()
    const toolUrl = tools.join('_')
    return `${IMAGE_BASE_URL}/${actionType}_${toolUrl}.png`
  }

  throw new Error(`Tools is not supported: ${tools} / ${typeof tools}`)
}

export function getPathCardImageUrl(pathType: string): string {
  return `${IMAGE_BASE_URL}/${pathType}.png`
}
