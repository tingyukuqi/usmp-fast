import type { TenantVO } from '@/api/system/tenant/types';

export function getTenantTypeLabel(row: TenantVO, options: DictDataOption[]): string {
  if (row.tenantTypeLabel) {
    return row.tenantTypeLabel;
  }

  const matchedOption = options.find((item) => item.value === row.tenantType);
  if (matchedOption?.label) {
    return matchedOption.label;
  }

  return row.tenantType || '-';
}
