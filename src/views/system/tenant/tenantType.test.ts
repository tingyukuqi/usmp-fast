import { describe, expect, it } from 'vitest';
import type { TenantVO } from '@/api/system/tenant/types';
import { getTenantTypeLabel } from './tenantType';

const createTenantRow = (overrides: Partial<TenantVO> = {}): TenantVO =>
  ({
    id: 1,
    tenantId: '100001',
    username: 'tenant_admin',
    contactUserName: '张三',
    contactPhone: '13800000000',
    companyName: '测试企业',
    licenseNumber: '913000000000000000',
    address: '测试地址',
    domain: 'example.com',
    intro: '',
    remark: '',
    packageId: 1,
    expireTime: '2026-12-31 23:59:59',
    accountCount: 1,
    status: '0',
    ...overrides
  }) as TenantVO;

describe('tenantType', () => {
  it('优先显示接口返回的中文租户类型', () => {
    expect(
      getTenantTypeLabel(
        createTenantRow({
          tenantType: 'cloud_tenant',
          tenantTypeLabel: '云租户'
        }),
        [{ label: '平台运营', value: 'platform_operation' }]
      )
    ).toBe('云租户');
  });

  it('在接口未返回中文时回退到字典映射', () => {
    expect(
      getTenantTypeLabel(
        createTenantRow({
          tenantType: 'service_provider'
        }),
        [{ label: '代维服务商', value: 'service_provider' }]
      )
    ).toBe('代维服务商');
  });

  it('在字典缺失时回退到原始值或横杠', () => {
    expect(getTenantTypeLabel(createTenantRow({ tenantType: 'unknown_type' }), [])).toBe('unknown_type');
    expect(getTenantTypeLabel(createTenantRow({ tenantType: '' }), [])).toBe('-');
  });
});
