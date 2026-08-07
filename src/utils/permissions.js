export const hasPermission = (user, permissionKey) => {
  if (!user) return false;
  if (user.role === 'super-admin') return true;
  if (user.role !== 'admin') return false;
  return user.adminRole?.permissions?.some((p) => p.key === permissionKey) || false;
};