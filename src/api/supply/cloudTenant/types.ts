export interface CloudTenantVO extends BaseEntity {
  cloudTenantSnapshotId?: string | number;
  cloudTenantId?: string | number;
  cloudPlatformId?: string | number;
  cloudTenantCode?: string;
  cloudTenantName?: string;
  externalTenantId?: string;
  tenantStatus?: string;
  bindStatus?: string;
  boundOrgId?: string | number;
  boundOrgName?: string;
  syncStatus?: string;
  lastSyncTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface CloudTenantQuery extends PageQuery {
  cloudPlatformId?: string | number;
  keyword?: string;
  tenantStatus?: string;
  bindStatus?: string;
}

export interface CloudTenantOption {
  cloudTenantSnapshotId?: string | number;
  cloudTenantId?: string | number;
  cloudTenantCode?: string;
  cloudTenantName?: string;
  bindStatus?: string;
}
