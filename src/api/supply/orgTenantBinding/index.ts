import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OrgTenantBindingForm, OrgTenantBindingQuery, OrgTenantBindingVO } from './types';

export const listOrgTenantBinding = (query?: OrgTenantBindingQuery): AxiosPromise<OrgTenantBindingVO[]> => {
  return request({
    url: '/supply/org-tenant-bindings/list',
    method: 'get',
    params: query
  });
};

export const getOrgTenantBinding = (bindingId: string | number): AxiosPromise<OrgTenantBindingVO> => {
  return request({
    url: '/supply/org-tenant-bindings/' + bindingId,
    method: 'get'
  });
};

export const addOrgTenantBinding = (data: OrgTenantBindingForm) => {
  return request({
    url: '/supply/org-tenant-bindings',
    method: 'post',
    data
  });
};

export const updateOrgTenantBinding = (data: OrgTenantBindingForm) => {
  return request({
    url: '/supply/org-tenant-bindings',
    method: 'put',
    data
  });
};

export const delOrgTenantBinding = (bindingIds: Array<string | number> | string | number) => {
  return request({
    url: '/supply/org-tenant-bindings/' + bindingIds,
    method: 'delete'
  });
};
