export interface SupplierBoundUser {
  userId: string | number;
  userName?: string;
  nickName?: string;
}

export interface SupplierVO extends BaseEntity {
  supplierId: string | number;
  supplierCode: string;
  supplierName: string;
  supplierShortName?: string;
  supplierType?: string;
  creditCode?: string;
  serviceScope?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  cooperationType?: string;
  status: string;
  platformCount?: number;
  accountCount?: number;
  remark?: string;
  users?: SupplierBoundUser[];
}

export interface SupplierQuery extends PageQuery {
  supplierName?: string;
  creditCode?: string;
  cooperationType?: string;
  status?: string;
}

export interface SupplierForm {
  supplierId?: string | number;
  supplierCode?: string;
  supplierName: string;
  supplierShortName?: string;
  supplierType?: string;
  creditCode?: string;
  serviceScope?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  cooperationType?: string;
  remark?: string;
}

export interface SupplierStatusForm {
  status: string;
}

export interface SupplierOption {
  supplierId: string | number;
  supplierName: string;
}

export interface SupplierPlatformAccountVO extends BaseEntity {
  accountId: string | number;
  supplierId: string | number;
  cloudPlatformId: string | number;
  cloudPlatformName?: string;
  accountName: string;
  accountIdentifier: string;
  remark?: string;
}

export interface SupplierPlatformAccountForm {
  accountId?: string | number;
  supplierId?: string | number;
  cloudPlatformId?: string | number;
  accountName: string;
  accountIdentifier: string;
  remark?: string;
}

export interface SupplierUserBindingForm {
  userIds: Array<string | number>;
}

export interface CloudPlatformOption {
  platformId: string | number;
  platformName: string;
}
