export interface OrgTenantBindingVO extends BaseEntity {
  bindingId?: string | number;
  cloudPlatformId?: string | number;
  cloudTenantSnapshotId?: string | number;
  cloudTenantId?: string | number;
  cloudTenantCode?: string;
  cloudTenantName?: string;
  bindStatus?: string;
  orgId?: string | number;
  boundOrgId?: string | number;
  boundOrgName?: string;
  effectiveTime?: string;
  invalidTime?: string;
  bindingRemark?: string;
}

export interface OrgTenantBindingQuery extends PageQuery {
  cloudPlatformId?: string | number;
  keyword?: string;
  bindStatus?: string;
}

export interface OrgTenantBindingForm {
  bindingId?: string | number;
  cloudPlatformId?: string | number;
  cloudTenantSnapshotId?: string | number;
  cloudTenantId?: string | number;
  orgId?: string | number;
  boundOrgId?: string | number;
  bindStatus?: string;
  effectiveTime?: string;
  invalidTime?: string;
  bindingRemark?: string;
}
