import { useSelector } from 'react-redux';
import { hasPermission } from '@/utils/permissions';

export default function usePermission(permissionKey) {
  const user = useSelector((state) => state.user.user);
  return hasPermission(user, permissionKey);
}