/** 组织机构视图对象 */
export interface OrgVO extends BaseEntity {
  /** 组织ID（=根部门deptId） */
  orgId: string | number;
  /** 组织名称 */
  orgName: string;
  /** 组织类型 */
  deptCategory: string;
  /** 显示顺序 */
  orderNum: number;
  /** 负责人ID */
  leader: number | string;
  /** 负责人名称 */
  leaderName: string;
  /** 联系电话 */
  phone: string;
  /** 邮箱 */
  email: string;
  /** 状态（0正常 1停用） */
  status: string;
}

/** 组织机构查询参数 */
export interface OrgQuery {
  orgName?: string;
  deptCategory?: string;
  status?: string;
}

/** 组织机构表单 */
export interface OrgForm {
  orgId?: string | number;
  orgName: string;
  deptCategory?: string;
  orderNum: number;
  leader?: number | string;
  phone?: string;
  email?: string;
  status: string;
  tenantId?: string;
}

/** 组织下拉树节点 */
export interface OrgTreeNode {
  id: number;
  parentId: number;
  name: string;
  weight: number;
  extra?: { disabled: boolean };
}
