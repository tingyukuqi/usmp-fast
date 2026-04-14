import { describe, expect, it } from 'vitest';
import { extractSupplierBoundUsers } from './supplierBoundUsers';

describe('supplierBoundUsers', () => {
  it('优先解析详情中的 users 字段', () => {
    expect(
      extractSupplierBoundUsers({
        users: [{ userId: 1, userName: 'admin', nickName: '管理员' }]
      })
    ).toEqual([{ userId: 1, userName: 'admin', nickName: '管理员' }]);
  });

  it('兼容解析 userList 和 boundUsers 字段', () => {
    expect(
      extractSupplierBoundUsers({
        userList: [{ userId: 2, userName: 'ops', nickName: '运维' }]
      })
    ).toEqual([{ userId: 2, userName: 'ops', nickName: '运维' }]);

    expect(
      extractSupplierBoundUsers({
        boundUsers: [{ userId: 3, userName: 'audit', nickName: '审计' }]
      })
    ).toEqual([{ userId: 3, userName: 'audit', nickName: '审计' }]);
  });

  it('过滤掉缺少 userId 的脏数据', () => {
    expect(
      extractSupplierBoundUsers({
        supplierUsers: [{ userName: 'no-id' }, { userId: 4, userName: 'kept', nickName: '保留' }]
      })
    ).toEqual([{ userId: 4, userName: 'kept', nickName: '保留' }]);
  });
});
