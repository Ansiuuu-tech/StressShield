import jwt from 'jsonwebtoken';
export const createTokens = (user) => ({
  accessToken: jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  ),
  refreshToken: jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' }),
});
export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
};
export const requireRole =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.auth.role)
      ? next()
      : res.status(403).json({ message: 'You do not have permission for this action.' });
