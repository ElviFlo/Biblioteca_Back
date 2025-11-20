export function requireFields(obj, fields) {
  const missing = fields.filter(f => !obj[f]);
  if (missing.length > 0) {
    return `Faltan campos requeridos: ${missing.join(', ')}`;
  }
  return null;
}
