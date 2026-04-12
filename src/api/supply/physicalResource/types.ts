export interface PhysicalResourceVO extends BaseEntity {
  resourceId: string | number;
  resourceCode: string;
  supplierId?: string | number;
  supplierName?: string;
  deviceName: string;
  deviceType?: string;
  deviceModel?: string;
  serialNumber?: string;
  assetTag?: string;
  resourceStatus?: string;
  rackLocation?: string;
  idcLocation?: string;
  manageIp?: string;
  purchaseDate?: string;
  expireDate?: string;
  specPayload?: unknown;
  remark?: string;
}

export interface PhysicalResourceQuery extends PageQuery {
  supplierId?: string | number;
  deviceType?: string;
  idcLocation?: string;
  keyword?: string;
  beginCreateTime?: string;
  endCreateTime?: string;
}

export interface PhysicalResourceForm {
  resourceId?: string | number;
  resourceCode?: string;
  supplierId?: string | number;
  deviceName: string;
  deviceType?: string;
  deviceModel?: string;
  serialNumber?: string;
  assetTag?: string;
  resourceStatus?: string;
  rackLocation?: string;
  idcLocation?: string;
  manageIp?: string;
  purchaseDate?: string;
  expireDate?: string;
  specPayload?: unknown;
  remark?: string;
}
