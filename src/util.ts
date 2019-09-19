/**
 * Gets the value at `path` of `object`.
 * @param {Object} object
 * @param {string|Array} path
 * @returns {*} value if exists else undefined
 */
export function get(object, path) {
  if (typeof path === 'string') {
    path = path.split('.').filter(key => key.length);
  }

  return path.reduce((dive, key) => dive && dive[key], object);
}
