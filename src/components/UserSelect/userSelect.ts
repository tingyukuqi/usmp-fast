import type { UserVO } from '@/api/system/user/types';

export const normalizeSelectedUsers = (value?: UserVO[] | UserVO): UserVO[] => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

export const resolveUserRows = (resp: any): UserVO[] => {
  if (Array.isArray(resp?.rows)) return resp.rows;
  if (Array.isArray(resp?.data?.rows)) return resp.data.rows;
  if (Array.isArray(resp?.data)) return resp.data;
  return [];
};
