import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CollectConfigForm, CollectConfigQuery, CollectConfigStatusForm, CollectConfigVO, CollectLogQuery, CollectLogVO } from './types';

export const listCollectConfig = (query?: CollectConfigQuery): AxiosPromise<CollectConfigVO[]> => {
  return request({
    url: '/supply/collect-configs/list',
    method: 'get',
    params: query
  });
};

export const getCollectConfig = (collectConfigId: string | number): AxiosPromise<CollectConfigVO> => {
  return request({
    url: '/supply/collect-configs/' + collectConfigId,
    method: 'get'
  });
};

export const addCollectConfig = (data: CollectConfigForm) => {
  return request({
    url: '/supply/collect-configs',
    method: 'post',
    data
  });
};

export const updateCollectConfig = (data: CollectConfigForm) => {
  return request({
    url: '/supply/collect-configs',
    method: 'put',
    data
  });
};

export const changeCollectConfigStatus = (collectConfigId: string | number, status: string) => {
  const data: CollectConfigStatusForm = { status };
  return request({
    url: `/supply/collect-configs/${collectConfigId}/status`,
    method: 'put',
    data
  });
};

export const delCollectConfig = (collectConfigIds: Array<string | number> | string | number) => {
  return request({
    url: '/supply/collect-configs/' + collectConfigIds,
    method: 'delete'
  });
};

export const executeCollectConfig = (collectConfigId: string | number) => {
  return request({
    url: `/supply/collect-configs/${collectConfigId}/execute`,
    method: 'post'
  });
};

export const listCollectLogs = (collectConfigId: string | number, query?: CollectLogQuery): AxiosPromise<CollectLogVO[]> => {
  return request({
    url: `/supply/collect-configs/${collectConfigId}/logs`,
    method: 'get',
    params: query
  });
};
