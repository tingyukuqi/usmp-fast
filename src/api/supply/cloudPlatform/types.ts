export interface CloudPlatformVO extends BaseEntity {
  platformId: string | number;
  platformCode: string;
  platformName: string;
  platformType?: string;
  providerCode?: string;
  resourcePoolCode?: string;
  regionCode?: string;
  accessUrl?: string;
  apiVersion?: string;
  description?: string;
  status?: string;
}

export interface CloudPlatformQuery extends PageQuery {
  platformName?: string;
  platformCode?: string;
  platformType?: string;
  providerCode?: string;
  status?: string;
}

export interface CloudPlatformForm {
  platformId?: string | number;
  platformCode?: string;
  platformName: string;
  platformType?: string;
  providerCode?: string;
  resourcePoolCode?: string;
  regionCode?: string;
  accessUrl?: string;
  apiVersion?: string;
  description?: string;
  status?: string;
}

export interface CloudPlatformOption {
  platformId: string | number;
  platformName: string;
}
