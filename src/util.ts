/**
 * Gets the value at `path` of `object`.
 * @param object
 * @param path
 * @returns value if exists else undefined
 */
export function get(object: Record<string, any>, path: string | any[]): any {
  if (typeof path === 'string') {
    path = path.split('.').filter((key) => key.length);
  }

  return path.reduce((dive, key) => dive?.[key], object);
}
