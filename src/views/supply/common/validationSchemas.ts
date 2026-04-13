import {
  isEmailAddress,
  isHttpUrl,
  isIpv4,
  isJsonObjectString,
  isPhoneNumber,
  isUnifiedCreditCode,
  isValidDateTimeOrder,
  startsWithSlash
} from './validationFormatters';

type Trigger = 'blur' | 'change' | Array<'blur' | 'change'>;

export interface SupplyValidationContext {
  hasBoundSupplier?: boolean;
}

export interface SupplyValidatorDefinition<T extends Record<string, any>> {
  trigger?: Trigger;
  message: string;
  validate: (value: unknown, model: T, ctx: SupplyValidationContext) => boolean;
}

export interface SupplyConditionalRequiredDefinition<T extends Record<string, any>> {
  field: keyof T | string;
  message: string;
  trigger?: Trigger;
  when: (model: T, ctx: SupplyValidationContext) => boolean;
}

export interface SupplyFieldDefinition<T extends Record<string, any>> {
  required?: boolean;
  message?: string;
  trigger?: Trigger;
  defaultValue?: unknown | (() => unknown);
  payloadField?: string;
  validators?: Array<SupplyValidatorDefinition<T>>;
}

export interface SupplySceneSchema<T extends Record<string, any>> {
  requiredFields: Array<keyof T | string>;
  conditionalRequired: Array<SupplyConditionalRequiredDefinition<T>>;
  payloadFieldMap: Record<string, string>;
  fields: Record<string, SupplyFieldDefinition<T>>;
}

const authPayloadRequired = <T extends { authType?: string }>(model: T) => !['none', 'no_auth', 'anonymous'].includes(String(model.authType || ''));

export const supplyValidationSchemas = {
  supplier: {
    add: {
      requiredFields: ['supplierCode', 'supplierName', 'supplierType'],
      conditionalRequired: [],
      payloadFieldMap: {},
      fields: {
        supplierCode: { required: true, message: '供应商编码不能为空' },
        supplierName: { required: true, message: '供应商名称不能为空' },
        supplierType: { required: true, message: '供应商类型不能为空' },
        creditCode: {
          validators: [{ message: '请输入正确的统一社会信用代码', validate: (value) => !value || isUnifiedCreditCode(String(value)) }]
        },
        contactPhone: {
          validators: [{ message: '请输入正确的手机号码', validate: (value) => !value || isPhoneNumber(String(value)) }]
        },
        contactEmail: {
          validators: [{ message: '请输入正确的邮箱地址', validate: (value) => !value || isEmailAddress(String(value)) }]
        }
      }
    },
    edit: {
      requiredFields: ['supplierId', 'supplierCode', 'supplierName', 'supplierType'],
      conditionalRequired: [],
      payloadFieldMap: {},
      fields: {
        supplierId: { required: true, message: '供应商ID不能为空', trigger: 'change' },
        supplierCode: { required: true, message: '供应商编码不能为空' },
        supplierName: { required: true, message: '供应商名称不能为空' },
        supplierType: { required: true, message: '供应商类型不能为空' },
        creditCode: {
          validators: [{ message: '请输入正确的统一社会信用代码', validate: (value) => !value || isUnifiedCreditCode(String(value)) }]
        },
        contactPhone: {
          validators: [{ message: '请输入正确的手机号码', validate: (value) => !value || isPhoneNumber(String(value)) }]
        },
        contactEmail: {
          validators: [{ message: '请输入正确的邮箱地址', validate: (value) => !value || isEmailAddress(String(value)) }]
        }
      }
    }
  },
  supplierPlatformAccount: {
    add: {
      requiredFields: ['accountName', 'accountIdentifier'],
      conditionalRequired: [],
      payloadFieldMap: {},
      fields: {
        accountName: { required: true, message: '账号名称不能为空' },
        accountIdentifier: { required: true, message: '账号标识不能为空' }
      }
    },
    edit: {
      requiredFields: ['accountId', 'supplierId', 'accountName', 'accountIdentifier'],
      conditionalRequired: [],
      payloadFieldMap: {},
      fields: {
        accountId: { required: true, message: '账号ID不能为空', trigger: 'change' },
        supplierId: { required: true, message: '供应商ID不能为空', trigger: 'change' },
        accountName: { required: true, message: '账号名称不能为空' },
        accountIdentifier: { required: true, message: '账号标识不能为空' }
      }
    }
  },
  supplierUserBinding: {
    submit: {
      requiredFields: ['userIds'],
      conditionalRequired: [],
      payloadFieldMap: {},
      fields: {
        userIds: { required: true, message: '至少选择一个用户', trigger: 'change' }
      }
    }
  },
  physicalResource: {
    add: {
      requiredFields: ['resourceCode', 'deviceName', 'deviceType', 'serialNumber', 'resourceStatus'],
      conditionalRequired: [
        {
          field: 'supplierId',
          message: '所属供应商不能为空',
          trigger: 'change',
          when: (_model, ctx) => !ctx.hasBoundSupplier
        }
      ],
      payloadFieldMap: {},
      fields: {
        resourceCode: { required: true, message: '资源编号不能为空' },
        deviceName: { required: true, message: '设备名称不能为空' },
        deviceType: { required: true, message: '设备类型不能为空', trigger: 'change' },
        serialNumber: { required: true, message: '序列号不能为空' },
        resourceStatus: { required: true, message: '资源状态不能为空', trigger: 'change' },
        manageIp: {
          validators: [{ message: '请输入正确的 IPv4 地址', validate: (value) => !value || isIpv4(String(value)) }]
        },
        specPayload: {
          validators: [{ message: '规格JSON必须为对象', validate: (value) => !value || isJsonObjectString(String(value)) }]
        }
      }
    },
    edit: {
      requiredFields: ['resourceId', 'resourceCode', 'deviceName', 'deviceType', 'serialNumber', 'resourceStatus'],
      conditionalRequired: [
        {
          field: 'supplierId',
          message: '所属供应商不能为空',
          trigger: 'change',
          when: (_model, ctx) => !ctx.hasBoundSupplier
        }
      ],
      payloadFieldMap: {},
      fields: {
        resourceId: { required: true, message: '资源ID不能为空', trigger: 'change' },
        resourceCode: { required: true, message: '资源编号不能为空' },
        deviceName: { required: true, message: '设备名称不能为空' },
        deviceType: { required: true, message: '设备类型不能为空', trigger: 'change' },
        serialNumber: { required: true, message: '序列号不能为空' },
        resourceStatus: { required: true, message: '资源状态不能为空', trigger: 'change' },
        manageIp: {
          validators: [{ message: '请输入正确的 IPv4 地址', validate: (value) => !value || isIpv4(String(value)) }]
        },
        specPayload: {
          validators: [{ message: '规格JSON必须为对象', validate: (value) => !value || isJsonObjectString(String(value)) }]
        }
      }
    }
  },
  cloudPlatform: {
    add: {
      requiredFields: ['platformCode', 'platformName', 'platformType', 'providerCode', 'accessUrl'],
      conditionalRequired: [],
      payloadFieldMap: {},
      fields: {
        platformCode: { required: true, message: '平台编码不能为空' },
        platformName: { required: true, message: '平台名称不能为空' },
        platformType: { required: true, message: '平台类型不能为空', trigger: 'change' },
        providerCode: { required: true, message: '供应商代码不能为空' },
        accessUrl: {
          required: true,
          message: '接入地址不能为空',
          validators: [{ message: '接入地址必须为 http:// 或 https:// 地址', validate: (value) => !!value && isHttpUrl(String(value)) }]
        }
      }
    },
    edit: {
      requiredFields: ['platformId', 'platformCode', 'platformName', 'platformType', 'providerCode', 'accessUrl'],
      conditionalRequired: [],
      payloadFieldMap: {},
      fields: {
        platformId: { required: true, message: '平台ID不能为空', trigger: 'change' },
        platformCode: { required: true, message: '平台编码不能为空' },
        platformName: { required: true, message: '平台名称不能为空' },
        platformType: { required: true, message: '平台类型不能为空', trigger: 'change' },
        providerCode: { required: true, message: '供应商代码不能为空' },
        accessUrl: {
          required: true,
          message: '接入地址不能为空',
          validators: [{ message: '接入地址必须为 http:// 或 https:// 地址', validate: (value) => !!value && isHttpUrl(String(value)) }]
        }
      }
    }
  },
  collectConfig: {
    add: {
      requiredFields: [
        'cloudPlatformId',
        'providerCode',
        'collectUrl',
        'collectScope',
        'collectMode',
        'syncStrategy',
        'connectorCode',
        'authType',
        'executeCycle'
      ],
      conditionalRequired: [
        {
          field: 'authPayload',
          message: '鉴权载荷不能为空',
          when: (model) => authPayloadRequired(model)
        }
      ],
      payloadFieldMap: {},
      fields: {
        cloudPlatformId: { required: true, message: '云平台不能为空', trigger: 'change' },
        providerCode: { required: true, message: '供应商代码不能为空' },
        collectUrl: {
          required: true,
          message: '采集地址不能为空',
          validators: [{ message: '采集地址必须为 http:// 或 https:// 地址', validate: (value) => !!value && isHttpUrl(String(value)) }]
        },
        collectScope: { required: true, message: '采集范围不能为空', trigger: 'change' },
        collectMode: { required: true, message: '采集模式不能为空', trigger: 'change' },
        syncStrategy: { required: true, message: '同步策略不能为空', trigger: 'change' },
        connectorCode: { required: true, message: '连接器编码不能为空' },
        authType: { required: true, message: '鉴权类型不能为空', trigger: 'change' },
        executeCycle: { required: true, message: '执行周期不能为空' },
        authPayload: {
          validators: [{ message: '鉴权载荷必须为对象 JSON', validate: (value) => !value || isJsonObjectString(String(value)) }]
        },
        syncEndpoint: {
          validators: [{ message: '同步地址必须为 http:// 或 https:// 地址', validate: (value) => !value || isHttpUrl(String(value)) }]
        },
        scopeFilter: {
          validators: [{ message: '范围过滤必须为对象 JSON', validate: (value) => !value || isJsonObjectString(String(value)) }]
        },
        collectOptions: {
          validators: [{ message: '采集选项必须为对象 JSON', validate: (value) => !value || isJsonObjectString(String(value)) }]
        },
        timeoutSeconds: { defaultValue: 60 },
        retryTimes: { defaultValue: 0 },
        verifySsl: { defaultValue: true }
      }
    },
    edit: {
      requiredFields: [
        'collectConfigId',
        'cloudPlatformId',
        'providerCode',
        'collectUrl',
        'collectScope',
        'collectMode',
        'syncStrategy',
        'connectorCode',
        'authType',
        'executeCycle'
      ],
      conditionalRequired: [
        {
          field: 'authPayload',
          message: '鉴权载荷不能为空',
          when: (model) => authPayloadRequired(model)
        }
      ],
      payloadFieldMap: {},
      fields: {
        collectConfigId: { required: true, message: '采集配置ID不能为空', trigger: 'change' },
        cloudPlatformId: { required: true, message: '云平台不能为空', trigger: 'change' },
        providerCode: { required: true, message: '供应商代码不能为空' },
        collectUrl: {
          required: true,
          message: '采集地址不能为空',
          validators: [{ message: '采集地址必须为 http:// 或 https:// 地址', validate: (value) => !!value && isHttpUrl(String(value)) }]
        },
        collectScope: { required: true, message: '采集范围不能为空', trigger: 'change' },
        collectMode: { required: true, message: '采集模式不能为空', trigger: 'change' },
        syncStrategy: { required: true, message: '同步策略不能为空', trigger: 'change' },
        connectorCode: { required: true, message: '连接器编码不能为空' },
        authType: { required: true, message: '鉴权类型不能为空', trigger: 'change' },
        executeCycle: { required: true, message: '执行周期不能为空' },
        authPayload: {
          validators: [{ message: '鉴权载荷必须为对象 JSON', validate: (value) => !value || isJsonObjectString(String(value)) }]
        },
        syncEndpoint: {
          validators: [{ message: '同步地址必须为 http:// 或 https:// 地址', validate: (value) => !value || isHttpUrl(String(value)) }]
        },
        scopeFilter: {
          validators: [{ message: '范围过滤必须为对象 JSON', validate: (value) => !value || isJsonObjectString(String(value)) }]
        },
        collectOptions: {
          validators: [{ message: '采集选项必须为对象 JSON', validate: (value) => !value || isJsonObjectString(String(value)) }]
        },
        timeoutSeconds: { defaultValue: 60 },
        retryTimes: { defaultValue: 0 },
        verifySsl: { defaultValue: true }
      }
    }
  },
  eventSubscription: {
    add: {
      requiredFields: ['cloudPlatformId', 'providerCode', 'eventScope', 'ingestMode', 'dataFormat', 'schemaVersion'],
      conditionalRequired: [
        {
          field: 'topicName',
          message: '主题名称不能为空',
          when: (model) => ['rocketmq', 'kafka_adapter'].includes(String(model.ingestMode || ''))
        },
        {
          field: 'consumerGroup',
          message: '消费组不能为空',
          when: (model) => ['rocketmq', 'kafka_adapter'].includes(String(model.ingestMode || ''))
        },
        {
          field: 'endpointPath',
          message: '回调路径不能为空',
          when: (model) => String(model.ingestMode || '') === 'webhook'
        },
        {
          field: 'authPayload',
          message: '鉴权载荷不能为空',
          when: (model) => authPayloadRequired(model)
        }
      ],
      payloadFieldMap: {},
      fields: {
        cloudPlatformId: { required: true, message: '云平台不能为空', trigger: 'change' },
        providerCode: { required: true, message: '供应商代码不能为空' },
        eventScope: { required: true, message: '事件范围不能为空', trigger: 'change' },
        ingestMode: { required: true, message: '接入方式不能为空', trigger: 'change' },
        dataFormat: { required: true, message: '数据格式不能为空', trigger: 'change' },
        schemaVersion: { required: true, message: 'Schema版本不能为空' },
        endpointPath: {
          validators: [{ message: '回调路径必须以 / 开头', validate: (value) => !value || startsWithSlash(String(value)) }]
        },
        authPayload: {
          validators: [{ message: '鉴权载荷必须为对象 JSON', validate: (value) => !value || isJsonObjectString(String(value)) }]
        }
      }
    },
    edit: {
      requiredFields: ['subscriptionId', 'cloudPlatformId', 'providerCode', 'eventScope', 'ingestMode', 'dataFormat', 'schemaVersion'],
      conditionalRequired: [
        {
          field: 'topicName',
          message: '主题名称不能为空',
          when: (model) => ['rocketmq', 'kafka_adapter'].includes(String(model.ingestMode || ''))
        },
        {
          field: 'consumerGroup',
          message: '消费组不能为空',
          when: (model) => ['rocketmq', 'kafka_adapter'].includes(String(model.ingestMode || ''))
        },
        {
          field: 'endpointPath',
          message: '回调路径不能为空',
          when: (model) => String(model.ingestMode || '') === 'webhook'
        },
        {
          field: 'authPayload',
          message: '鉴权载荷不能为空',
          when: (model) => authPayloadRequired(model)
        }
      ],
      payloadFieldMap: {},
      fields: {
        subscriptionId: { required: true, message: '订阅ID不能为空', trigger: 'change' },
        cloudPlatformId: { required: true, message: '云平台不能为空', trigger: 'change' },
        providerCode: { required: true, message: '供应商代码不能为空' },
        eventScope: { required: true, message: '事件范围不能为空', trigger: 'change' },
        ingestMode: { required: true, message: '接入方式不能为空', trigger: 'change' },
        dataFormat: { required: true, message: '数据格式不能为空', trigger: 'change' },
        schemaVersion: { required: true, message: 'Schema版本不能为空' },
        endpointPath: {
          validators: [{ message: '回调路径必须以 / 开头', validate: (value) => !value || startsWithSlash(String(value)) }]
        },
        authPayload: {
          validators: [{ message: '鉴权载荷必须为对象 JSON', validate: (value) => !value || isJsonObjectString(String(value)) }]
        }
      }
    }
  },
  orgTenantBinding: {
    add: {
      requiredFields: ['boundOrgId', 'cloudPlatformId', 'cloudTenantSnapshotId'],
      conditionalRequired: [
        {
          field: 'invalidTime',
          message: '失效时间不能为空',
          trigger: 'change',
          when: (model) => String(model.bindStatus || '') === 'unbound'
        }
      ],
      payloadFieldMap: {
        boundOrgId: 'orgId'
      },
      fields: {
        boundOrgId: { required: true, message: '绑定组织不能为空', trigger: 'change' },
        cloudPlatformId: { required: true, message: '云平台不能为空', trigger: 'change' },
        cloudTenantSnapshotId: { required: true, message: '云租户不能为空', trigger: 'change' },
        effectiveTime: {
          validators: [
            {
              message: '失效时间不能早于生效时间',
              validate: (_value, model) => isValidDateTimeOrder(model.effectiveTime, model.invalidTime)
            }
          ]
        },
        invalidTime: {
          validators: [
            {
              message: '失效时间不能早于生效时间',
              validate: (_value, model) => isValidDateTimeOrder(model.effectiveTime, model.invalidTime)
            }
          ]
        }
      }
    },
    edit: {
      requiredFields: ['bindingId', 'boundOrgId', 'cloudPlatformId', 'cloudTenantSnapshotId'],
      conditionalRequired: [
        {
          field: 'invalidTime',
          message: '失效时间不能为空',
          trigger: 'change',
          when: (model) => String(model.bindStatus || '') === 'unbound'
        }
      ],
      payloadFieldMap: {
        boundOrgId: 'orgId'
      },
      fields: {
        bindingId: { required: true, message: '绑定ID不能为空', trigger: 'change' },
        boundOrgId: { required: true, message: '绑定组织不能为空', trigger: 'change' },
        cloudPlatformId: { required: true, message: '云平台不能为空', trigger: 'change' },
        cloudTenantSnapshotId: { required: true, message: '云租户不能为空', trigger: 'change' },
        effectiveTime: {
          validators: [
            {
              message: '失效时间不能早于生效时间',
              validate: (_value, model) => isValidDateTimeOrder(model.effectiveTime, model.invalidTime)
            }
          ]
        },
        invalidTime: {
          validators: [
            {
              message: '失效时间不能早于生效时间',
              validate: (_value, model) => isValidDateTimeOrder(model.effectiveTime, model.invalidTime)
            }
          ]
        }
      }
    }
  }
} as const;

export type SupplyValidationModule = keyof typeof supplyValidationSchemas;
export type SupplyValidationScene<M extends SupplyValidationModule> = keyof (typeof supplyValidationSchemas)[M];
