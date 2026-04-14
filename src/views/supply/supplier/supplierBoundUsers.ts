import type { SupplierBoundUser } from '@/api/supply/supplier/types';

const BOUND_USER_FIELDS = ['users', 'userList', 'boundUsers', 'supplierUsers', 'supplierUserList'] as const;

const normalizeBoundUser = (item: any): SupplierBoundUser | null => {
  const userId = item?.userId ?? item?.id;
  if (userId === undefined || userId === null || userId === '') {
    return null;
  }
  return {
    userId,
    userName: item?.userName ?? item?.username,
    nickName: item?.nickName ?? item?.nickname
  };
};

export const extractSupplierBoundUsers = (data: any): SupplierBoundUser[] => {
  for (const field of BOUND_USER_FIELDS) {
    const list = data?.[field];
    if (!Array.isArray(list)) {
      continue;
    }
    return list.map(normalizeBoundUser).filter((item): item is SupplierBoundUser => item !== null);
  }
  return [];
};
