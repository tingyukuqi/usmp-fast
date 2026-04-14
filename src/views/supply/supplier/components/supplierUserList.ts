import type { SupplierBoundUser, SupplierUserBindingVO } from '@/api/supply/supplier/types';

const resolveRows = (resp: any): any[] => {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.rows)) return resp.rows;
  if (Array.isArray(resp?.data?.rows)) return resp.data.rows;
  if (Array.isArray(resp?.data)) return resp.data;
  return [];
};

export const normalizeSupplierUserBindings = (resp: any): SupplierUserBindingVO[] => {
  return resolveRows(resp)
    .map((item) => {
      const userId = item?.userId;
      if (userId === undefined || userId === null || userId === '') {
        return null;
      }
      return {
        bindingId: item?.bindingId,
        supplierId: item?.supplierId,
        userId,
        deptId: item?.deptId,
        userName: item?.userName,
        nickName: item?.nickName,
        phonenumber: item?.phonenumber,
        email: item?.email,
        status: item?.status,
        createTime: item?.createTime
      } as SupplierUserBindingVO;
    })
    .filter((item): item is SupplierUserBindingVO => item !== null);
};

export const toBoundUsersFromBindings = (list: SupplierUserBindingVO[]): SupplierBoundUser[] => {
  return list.map((item) => ({
    userId: item.userId,
    userName: item.userName,
    nickName: item.nickName
  }));
};
