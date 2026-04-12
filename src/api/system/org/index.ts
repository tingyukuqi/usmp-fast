import { OrgVO, OrgQuery, OrgForm, OrgTreeNode } from './types';
import { AxiosPromise } from 'axios';
import request from '@/utils/request';

/** 获取组织列表 */
export const listOrg = (query?: OrgQuery): AxiosPromise<OrgVO[]> => {
  return request({
    url: '/system/org/list',
    method: 'get',
    params: query
  });
};

/** 获取组织下拉树 */
export const getOrgTree = (): AxiosPromise<OrgTreeNode[]> => {
  return request({
    url: '/system/org/tree',
    method: 'get'
  });
};

/** 获取组织详情 */
export const getOrg = (orgId: string | number): AxiosPromise<OrgVO> => {
  return request({
    url: '/system/org/' + orgId,
    method: 'get'
  });
};

/** 获取组织选择框列表 */
export const optionSelect = (orgIds?: (number | string)[]): AxiosPromise<OrgVO[]> => {
  return request({
    url: '/system/org/optionselect',
    method: 'get',
    params: orgIds?.length ? { orgIds: orgIds.join(',') } : {}
  });
};

/** 获取组织下的部门树 */
export const getOrgDeptTree = (orgId: string | number): AxiosPromise<any> => {
  return request({
    url: '/system/org/' + orgId + '/dept/tree',
    method: 'get'
  });
};

/** 新增组织 */
export const addOrg = (data: OrgForm) => {
  return request({
    url: '/system/org',
    method: 'post',
    data
  });
};

/** 修改组织 */
export const updateOrg = (data: OrgForm) => {
  return request({
    url: '/system/org',
    method: 'put',
    data
  });
};

/** 删除组织 */
export const delOrg = (orgIds: Array<string | number> | string | number) => {
  return request({
    url: '/system/org/' + orgIds,
    method: 'delete'
  });
};

export default { listOrg, getOrgTree, optionSelect };
