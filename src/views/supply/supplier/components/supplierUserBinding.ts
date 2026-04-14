import type { SupplierBoundUser } from '@/api/supply/supplier/types';
import type { UserVO } from '@/api/system/user/types';

type SelectableUser = Pick<UserVO, 'userId' | 'userName' | 'nickName'> | SupplierBoundUser;

export const toBoundUsers = (list: SelectableUser[]): SupplierBoundUser[] => {
  return list.map((item) => ({
    userId: item.userId,
    userName: item.userName,
    nickName: item.nickName
  }));
};

export const getBoundUserIds = (list: SupplierBoundUser[]): Array<string | number> => {
  return list.map((item) => item.userId);
};

export const getRemainingUserIds = (list: SupplierBoundUser[], removedUserId: string | number): Array<string | number> => {
  return list.filter((item) => item.userId !== removedUserId).map((item) => item.userId);
};

export const openUserSelectorWithSelection = async (
  users: SupplierBoundUser[],
  setSelected: (ids: Array<string | number>) => void,
  open: () => void,
  waitForUi: () => Promise<void>
) => {
  const ids = getBoundUserIds(users);
  setSelected(ids);
  await waitForUi();
  open();
};
