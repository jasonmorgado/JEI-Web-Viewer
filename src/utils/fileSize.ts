export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function calculateObjectSize(obj: any): number {
  const seen = new Set()

  function sizeOf(object: any): number {
    if (object === null || object === undefined) return 0

    const type = typeof object

    if (type === 'string') {
      return object.length * 2 // UTF-16 encoding
    } else if (type === 'number') {
      return 8
    } else if (type === 'boolean') {
      return 4
    }

    if (seen.has(object)) return 0
    seen.add(object)

    let bytes = 0

    if (Array.isArray(object)) {
      bytes += object.reduce((acc, item) => acc + sizeOf(item), 0)
    } else if (type === 'object') {
      for (const key in object) {
        bytes += sizeOf(key) + sizeOf(object[key])
      }
    }

    return bytes
  }

  return sizeOf(obj)
}
