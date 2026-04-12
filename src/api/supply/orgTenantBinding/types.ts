export interface OrgTenantBindingVO extends BaseEntity {
  bindingId?: string | number;
  cloudPlatformId?: string | number;
  cloudTenantSnapshotId?: string | number;
  cloudTenantId?: string | number;
  cloudTenantCode?: string;
  cloudTenantName?: string;
  bindStatus?: string;
  boundOrgId?: string | number;
  boundOrgName?: string;
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
  boundOrgId?: string | number;
  bindingRemark?: string;
}
