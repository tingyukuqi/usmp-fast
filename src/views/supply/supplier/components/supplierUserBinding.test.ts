import { describe, expect, it, vi } from 'vitest';
import type { SupplierBoundUser } from '@/api/supply/supplier/types';
import { getBoundUserIds, getRemainingUserIds, openUserSelectorWithSelection, toBoundUsers } from './supplierUserBinding';

describe('supplierUserBinding', () => {
  it('将已绑定用户转换为选择器需要的用户ID数组', () => {
    const users: SupplierBoundUser[] = [
      { userId: 101, userName: 'zhangsan', nickName: '张三' },
      { userId: '102', userName: 'lisi', nickName: '李四' }
    ];

    expect(getBoundUserIds(users)).toEqual([101, '102']);
  });

  it('打开选择器前先同步已绑定用户，再等待视图刷新', async () => {
    const steps: string[] = [];
    const setSelected = vi.fn((ids: Array<string | number>) => {
      steps.push(`set:${ids.join(',')}`);
    });
    const waitForUi = vi.fn(async () => {
      steps.push('wait');
    });
    const open = vi.fn(() => {
      steps.push('open');
    });

    await openUserSelectorWithSelection([{ userId: 201, nickName: '王五' }], setSelected, open, waitForUi);

    expect(steps).toEqual(['set:201', 'wait', 'open']);
  });

  it('将用户选择结果映射为绑定用户列表', () => {
    expect(
      toBoundUsers([
        { userId: 301, userName: 'zhaoliu', nickName: '赵六' },
        { userId: 302, userName: 'sunqi' }
      ])
    ).toEqual([
      { userId: 301, userName: 'zhaoliu', nickName: '赵六' },
      { userId: 302, userName: 'sunqi', nickName: undefined }
    ]);
  });

  it('删除单个绑定用户时返回剩余用户ID集合', () => {
    expect(
      getRemainingUserIds(
        [
          { userId: 401, userName: 'u1' },
          { userId: 402, userName: 'u2' },
          { userId: 403, userName: 'u3' }
        ],
        402
      )
    ).toEqual([401, 403]);
  });

  it('删除最后一个用户时允许得到空的用户ID集合', () => {
    expect(getRemainingUserIds([{ userId: 501, userName: 'last' }], 501)).toEqual([]);
  });
});
