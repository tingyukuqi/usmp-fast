import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CloudTenantOption, CloudTenantQuery, CloudTenantVO } from './types';

export const listCloudTenant = (query?: CloudTenantQuery): AxiosPromise<CloudTenantVO[]> => {
  return request({
    url: '/supply/cloud-tenants/list',
    method: 'get',
    params: query
  });
};

export const refreshCloudTenantSnapshot = (cloudPlatformId: string | number) => {
  return request({
    url: '/supply/cloud-tenants/refresh/' + cloudPlatformId,
    method: 'post'
  });
};

export const listCloudTenantOptions = (query?: CloudTenantQuery): AxiosPromise<CloudTenantOption[]> => {
  return request({
    url: '/supply/options/cloud-tenants',
    method: 'get',
    params: query
  });
};
