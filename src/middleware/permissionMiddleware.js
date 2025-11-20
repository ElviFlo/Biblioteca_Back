export function requirePermission(permissionKey) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !user.permissions[permissionKey]) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    next();
  };
}
