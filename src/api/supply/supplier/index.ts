import request from '@/utils/request';
import { UserQuery, UserVO } from '@/api/system/user/types';
import {
  SupplierForm,
  SupplierPlatformAccountForm,
  SupplierQuery,
  SupplierStatusForm,
  SupplierUserBindingForm,
  SupplierUserBindingVO,
  SupplierVO,
  SupplierPlatformAccountVO,
  SupplierOption,
  CloudPlatformOption
} from './types';
import { AxiosPromise } from 'axios';

export const listSupplier = (query?: SupplierQuery): AxiosPromise<SupplierVO[]> => {
  return request({
    url: '/supply/suppliers/list',
    method: 'get',
    params: query
  });
};

export const getSupplier = (supplierId: string | number): AxiosPromise<SupplierVO> => {
  return request({
    url: '/supply/suppliers/' + supplierId,
    method: 'get'
  });
};

export const addSupplier = (data: SupplierForm) => {
  return request({
    url: '/supply/suppliers',
    method: 'post',
    data
  });
};

export const updateSupplier = (data: SupplierForm) => {
  return request({
    url: '/supply/suppliers',
    method: 'put',
    data
  });
};

export const changeSupplierStatus = (supplierId: string | number, status: string) => {
  const data: SupplierStatusForm = { status };
  return request({
    url: `/supply/suppliers/${supplierId}/status`,
    method: 'put',
    data
  });
};

export const delSupplier = (supplierIds: string | number | Array<string | number>) => {
  return request({
    url: '/supply/suppliers/' + supplierIds,
    method: 'delete'
  });
};

export const listSupplierOptions = (): AxiosPromise<SupplierOption[]> => {
  return request({
    url: '/supply/suppliers/options',
    method: 'get'
  });
};

export const listSupplierPlatformAccounts = (supplierId: string | number): AxiosPromise<SupplierPlatformAccountVO[]> => {
  return request({
    url: `/supply/suppliers/${supplierId}/platform-accounts`,
    method: 'get'
  });
};

export const addSupplierPlatformAccount = (supplierId: string | number, data: SupplierPlatformAccountForm) => {
  return request({
    url: `/supply/suppliers/${supplierId}/platform-accounts`,
    method: 'post',
    data
  });
};

export const updateSupplierPlatformAccount = (data: SupplierPlatformAccountForm) => {
  return request({
    url: '/supply/suppliers/platform-accounts',
    method: 'put',
    data
  });
};

export const delSupplierPlatformAccount = (accountIds: string | number | Array<string | number>) => {
  return request({
    url: '/supply/suppliers/platform-accounts/' + accountIds,
    method: 'delete'
  });
};

export const updateSupplierUsers = (supplierId: string | number, data: SupplierUserBindingForm) => {
  return request({
    url: `/supply/suppliers/${supplierId}/users`,
    method: 'put',
    data
  });
};

export const listSupplierUsers = (supplierId: string | number): AxiosPromise<SupplierUserBindingVO[]> => {
  return request({
    url: `/supply/suppliers/${supplierId}/users`,
    method: 'get'
  });
};

export const listBindableSupplierUsers = (supplierId: string | number, query?: UserQuery): AxiosPromise<UserVO[]> => {
  return request({
    url: `/supply/suppliers/${supplierId}/bindable-users`,
    method: 'get',
    params: query
  });
};

export const listCloudPlatformOptions = (): AxiosPromise<CloudPlatformOption[]> => {
  return request({
    url: '/supply/cloud-platforms/options',
    method: 'get'
  });
};
