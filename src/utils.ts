const IMAGE_BASE_URL = '/img/cards/'
const CELL_POS_DIFF = 13

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

export function convertToClientCellPos(x: number, y: number): { x: number; y: number } {
  return { x: x + 13, y: 17 - y }
}

export function convertToServerCellPos(x: number, y: number): { x: number; y: number } {
  return { x: x - 13, y: 17 - y }
}
