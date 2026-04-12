export interface EventSubscriptionVO extends BaseEntity {
  subscriptionId: string | number;
  cloudPlatformId?: string | number;
  cloudPlatformName?: string;
  providerCode?: string;
  eventScope?: string;
  ingestMode?: string;
  topicName?: string;
  consumerGroup?: string;
  endpointPath?: string;
  authType?: string;
  authPayload?: unknown;
  dataFormat?: string;
  schemaVersion?: string;
  status?: string;
  lastEventTime?: string;
  lastErrorMessage?: string;
  remark?: string;
}

export interface EventSubscriptionQuery extends PageQuery {
  cloudPlatformId?: string | number;
  eventScope?: string;
  ingestMode?: string;
  status?: string;
}

export interface EventSubscriptionForm {
  subscriptionId?: string | number;
  cloudPlatformId?: string | number;
  providerCode?: string;
  eventScope?: string;
  ingestMode?: string;
  topicName?: string;
  consumerGroup?: string;
  endpointPath?: string;
  authType?: string;
  authPayload?: unknown;
  dataFormat?: string;
  schemaVersion?: string;
  status?: string;
  remark?: string;
}

export interface EventSubscriptionStatusForm {
  status: string;
}

export interface EventLogVO extends BaseEntity {
  eventLogId?: string | number;
  subscriptionId?: string | number;
  cloudPlatformId?: string | number;
  eventScope?: string;
  eventKey?: string;
  sourceEventId?: string;
  eventTime?: string;
  ingestTime?: string;
  processStatus?: string;
  traceId?: string;
  rawPayload?: unknown;
  normalizedPayload?: unknown;
  errorMessage?: string;
}

export interface EventLogQuery extends PageQuery {
  processStatus?: string;
}
