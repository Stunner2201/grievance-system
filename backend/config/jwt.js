module.exports = {
  secret: process.env.JWT_SECRET || '52DA7C6C45FC6B8A9BEF57B72127B0ADA60ADEF32B27B21E981820DD0BD0902A',
  jwtExpiration: 3600, // 1 hour
  jwtRefreshExpiration: 86400, // 24 hours
  adminRoles: ['super_admin', 'department_admin']
};