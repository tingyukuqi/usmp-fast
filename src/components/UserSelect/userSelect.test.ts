import { describe, expect, it } from 'vitest';
import type { UserVO } from '@/api/system/user/types';
import { normalizeSelectedUsers, resolveUserRows } from './userSelect';

describe('userSelect', () => {
  it('优先把传入的单个或多个已选用户归一化为数组', () => {
    const oneUser = { userId: 1, userName: 'admin', nickName: '管理员' } as UserVO;
    const twoUsers = [
      oneUser,
      { userId: 2, userName: 'ops', nickName: '运维' } as UserVO
    ];

    expect(normalizeSelectedUsers(undefined)).toEqual([]);
    expect(normalizeSelectedUsers(oneUser)).toEqual([oneUser]);
    expect(normalizeSelectedUsers(twoUsers)).toEqual(twoUsers);
  });

  it('兼容解析 rows、data.rows 和 data 数组结构', () => {
    const rows = [{ userId: 1 }, { userId: 2 }] as UserVO[];

    expect(resolveUserRows({ rows })).toEqual(rows);
    expect(resolveUserRows({ data: { rows } })).toEqual(rows);
    expect(resolveUserRows({ data: rows })).toEqual(rows);
    expect(resolveUserRows({})).toEqual([]);
  });
});
