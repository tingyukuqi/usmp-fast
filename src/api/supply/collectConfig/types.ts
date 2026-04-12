export interface CollectConfigVO extends BaseEntity {
  collectConfigId: string | number;
  cloudPlatformId?: string | number;
  cloudPlatformName?: string;
  providerCode?: string;
  collectUrl?: string;
  syncEndpoint?: string;
  collectScope?: string;
  collectMode?: string;
  syncStrategy?: string;
  connectorCode?: string;
  authType?: string;
  authPayload?: unknown;
  scopeFilter?: unknown;
  collectOptions?: unknown;
  executeCycle?: string;
  timeoutSeconds?: number;
  retryTimes?: number;
  verifySsl?: string | boolean;
  status?: string;
  lastCollectTime?: string;
  lastSuccessTime?: string;
  lastCollectStatus?: string;
  lastErrorMessage?: string;
  nextCollectTime?: string;
  remark?: string;
}

export interface CollectConfigQuery extends PageQuery {
  cloudPlatformId?: string | number;
  providerCode?: string;
  collectScope?: string;
  status?: string;
}

export interface CollectConfigForm {
  collectConfigId?: string | number;
  cloudPlatformId?: string | number;
  providerCode?: string;
  collectUrl?: string;
  syncEndpoint?: string;
  collectScope?: string;
  collectMode?: string;
  syncStrategy?: string;
  connectorCode?: string;
  authType?: string;
  authPayload?: unknown;
  scopeFilter?: unknown;
  collectOptions?: unknown;
  executeCycle?: string;
  timeoutSeconds?: number;
  retryTimes?: number;
  verifySsl?: string | boolean;
  status?: string;
  remark?: string;
}

export interface CollectConfigStatusForm {
  status: string;
}

export interface CollectLogVO extends BaseEntity {
  logId?: string | number;
  collectConfigId?: string | number;
  cloudPlatformId?: string | number;
  collectScope?: string;
  executeMode?: string;
  jobInstanceId?: string;
  traceId?: string;
  triggerUserId?: string | number;
  startTime?: string;
  endTime?: string;
  durationMs?: number;
  resultStatus?: string;
  syncStatus?: string;
  resourceCount?: number;
  cloudTenantCount?: number;
  syncRecordCount?: number;
  configSnapshot?: unknown;
  errorMessage?: string;
}

export interface CollectLogQuery extends PageQuery {
  resultStatus?: string;
}
