import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PhysicalResourceForm, PhysicalResourceQuery, PhysicalResourceVO } from './types';

export const listPhysicalResource = (query?: PhysicalResourceQuery): AxiosPromise<PhysicalResourceVO[]> => {
  return request({
    url: '/supply/physical-resources/list',
    method: 'get',
    params: query
  });
};

export const getPhysicalResource = (resourceId: string | number): AxiosPromise<PhysicalResourceVO> => {
  return request({
    url: '/supply/physical-resources/' + resourceId,
    method: 'get'
  });
};

export const addPhysicalResource = (data: PhysicalResourceForm) => {
  return request({
    url: '/supply/physical-resources',
    method: 'post',
    data
  });
};

export const updatePhysicalResource = (data: PhysicalResourceForm) => {
  return request({
    url: '/supply/physical-resources',
    method: 'put',
    data
  });
};

export const delPhysicalResource = (resourceIds: Array<string | number> | string | number) => {
  return request({
    url: '/supply/physical-resources/' + resourceIds,
    method: 'delete'
  });
};
