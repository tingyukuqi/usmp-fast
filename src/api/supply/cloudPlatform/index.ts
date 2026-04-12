import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CloudPlatformForm, CloudPlatformOption, CloudPlatformQuery, CloudPlatformVO } from './types';

export const listCloudPlatform = (query?: CloudPlatformQuery): AxiosPromise<CloudPlatformVO[]> => {
  return request({
    url: '/supply/cloud-platforms/list',
    method: 'get',
    params: query
  });
};

export const getCloudPlatform = (platformId: string | number): AxiosPromise<CloudPlatformVO> => {
  return request({
    url: '/supply/cloud-platforms/' + platformId,
    method: 'get'
  });
};

export const addCloudPlatform = (data: CloudPlatformForm) => {
  return request({
    url: '/supply/cloud-platforms',
    method: 'post',
    data
  });
};

export const updateCloudPlatform = (data: CloudPlatformForm) => {
  return request({
    url: '/supply/cloud-platforms',
    method: 'put',
    data
  });
};

export const delCloudPlatform = (platformIds: Array<string | number> | string | number) => {
  return request({
    url: '/supply/cloud-platforms/' + platformIds,
    method: 'delete'
  });
};

export const listCloudPlatformOptions = (): AxiosPromise<CloudPlatformOption[]> => {
  return request({
    url: '/supply/cloud-platforms/options',
    method: 'get'
  });
};
