import { describe, expect, it } from 'vitest';
import { normalizeSupplierUserBindings, toBoundUsersFromBindings } from './supplierUserList';

describe('supplierUserList', () => {
  it('兼容解析数组与 rows 结构', () => {
    expect(
      normalizeSupplierUserBindings([
        {
          bindingId: 1,
          supplierId: 10,
          userId: 100,
          userName: 'admin'
        }
      ])
    ).toEqual([
      {
        bindingId: 1,
        supplierId: 10,
        userId: 100,
        deptId: undefined,
        userName: 'admin',
        nickName: undefined,
        phonenumber: undefined,
        email: undefined,
        status: undefined,
        createTime: undefined
      }
    ]);

    expect(
      normalizeSupplierUserBindings({
        rows: [
          {
            bindingId: 2,
            supplierId: 11,
            userId: 101,
            userName: 'ops'
          }
        ]
      })
    ).toHaveLength(1);
  });

  it('过滤无 userId 的脏数据', () => {
    expect(
      normalizeSupplierUserBindings([
        { bindingId: 1, supplierId: 10, userName: 'bad' },
        { bindingId: 2, supplierId: 10, userId: 102, userName: 'good' }
      ])
    ).toEqual([
      {
        bindingId: 2,
        supplierId: 10,
        userId: 102,
        deptId: undefined,
        userName: 'good',
        nickName: undefined,
        phonenumber: undefined,
        email: undefined,
        status: undefined,
        createTime: undefined
      }
    ]);
  });

  it('将绑定列表转换为父组件需要的精简用户信息', () => {
    expect(
      toBoundUsersFromBindings([
        {
          bindingId: 3,
          supplierId: 12,
          userId: 103,
          userName: 'audit',
          nickName: '审计'
        }
      ])
    ).toEqual([{ userId: 103, userName: 'audit', nickName: '审计' }]);
  });
});
