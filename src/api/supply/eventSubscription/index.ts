import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { EventLogQuery, EventLogVO, EventSubscriptionForm, EventSubscriptionQuery, EventSubscriptionStatusForm, EventSubscriptionVO } from './types';

export const listEventSubscription = (query?: EventSubscriptionQuery): AxiosPromise<EventSubscriptionVO[]> => {
  return request({
    url: '/supply/event-subscriptions/list',
    method: 'get',
    params: query
  });
};

export const getEventSubscription = (subscriptionId: string | number): AxiosPromise<EventSubscriptionVO> => {
  return request({
    url: '/supply/event-subscriptions/' + subscriptionId,
    method: 'get'
  });
};

export const addEventSubscription = (data: EventSubscriptionForm) => {
  return request({
    url: '/supply/event-subscriptions',
    method: 'post',
    data
  });
};

export const updateEventSubscription = (data: EventSubscriptionForm) => {
  return request({
    url: '/supply/event-subscriptions',
    method: 'put',
    data
  });
};

export const changeEventSubscriptionStatus = (subscriptionId: string | number, status: string) => {
  const data: EventSubscriptionStatusForm = { status };
  return request({
    url: `/supply/event-subscriptions/${subscriptionId}/status`,
    method: 'put',
    data
  });
};

export const delEventSubscription = (subscriptionIds: Array<string | number> | string | number) => {
  return request({
    url: '/supply/event-subscriptions/' + subscriptionIds,
    method: 'delete'
  });
};

export const listEventLogs = (subscriptionId: string | number, query?: EventLogQuery): AxiosPromise<EventLogVO[]> => {
  return request({
    url: `/supply/event-subscriptions/${subscriptionId}/events`,
    method: 'get',
    params: query
  });
};
