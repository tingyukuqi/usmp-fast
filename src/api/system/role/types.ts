/**
 * 菜单树形结构类型
 */
export interface DeptTreeOption {
  id: string;
  label: string;
  parentId: string;
  weight: number;
  children?: DeptTreeOption[];
}

export interface RoleDeptTree {
  checkedKeys: string[];
  depts: DeptTreeOption[];
}

export interface RoleVO extends BaseEntity {
  roleId: string | number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: string;
  menuCheckStrictly: boolean;
  deptCheckStrictly: boolean;
  status: string;
  delFlag: string;
  remark?: any;
  flag: boolean;
  menuIds?: Array<string | number>;
  deptIds?: Array<string | number>;
  admin: boolean;
  /** 父角色ID，顶级为 null */
  parentId?: string | number | null;
  /** 角色层级深度，顶级=0 */
  roleLevel?: number;
  /** 父角色名称 */
  parentRoleName?: string;
  /** 子角色列表（树形结构） */
  children?: RoleVO[];
  /** 已隐藏的继承菜单ID */
  hiddenMenuIds?: Array<string | number>;
  /** 当前生效的继承菜单ID */
  inheritedMenuIds?: Array<string | number>;
}

export interface RoleQuery extends PageQuery {
  roleName: string;
  roleKey: string;
  status: string;
}

export interface RoleForm {
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string;
  menuCheckStrictly: boolean;
  deptCheckStrictly: boolean;
  remark: string;
  dataScope?: string;
  roleId: string | undefined;
  menuIds: Array<string | number>;
  deptIds: Array<string | number>;
  /** 父角色ID */
  parentId?: string | number | null;
  /** 隐藏的继承菜单ID数组 */
  hiddenMenuIds?: Array<string | number>;
}

/** 角色有效菜单 */
export interface RoleEffectiveMenu {
  roleId: number;
  menuId: number;
  /** 来源：OWN=自有, INHERITED=继承 */
  source: string;
  /** 继承来源角色ID */
  inheritFromRoleId: number | null;
}

/** dataScope 继承约束映射：父角色 dataScope → 子角色允许的 dataScope 列表 */
export const DATA_SCOPE_ALLOWED_MAP: Record<string, string[]> = {
  '1': ['1', '2', '3', '4', '5', '6'],
  '2': ['2', '3', '4', '5', '6'],
  '3': ['3', '5'],
  '4': ['3', '4', '5', '6'],
  '5': ['5'],
  '6': ['3', '4', '5', '6']
}
