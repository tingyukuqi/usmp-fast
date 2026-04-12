export interface SupplyPageResult<T> {
  code?: number;
  msg?: string;
  total?: number;
  rows?: T[];
  data?: T[] | { rows?: T[]; total?: number } | T;
}

export interface SupplyResult<T> {
  code?: number;
  msg?: string;
  data?: T;
  total?: number;
  rows?: T[];
}

export const resolveRows = <T>(response: SupplyPageResult<T> | any): T[] => {
  if (Array.isArray(response?.rows)) {
    return response.rows;
  }
  if (Array.isArray(response?.data?.rows)) {
    return response.data.rows;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
};

export const resolveTotal = (response: SupplyPageResult<any> | any, rows: unknown[] = []) => {
  if (typeof response?.total === 'number') {
    return response.total;
  }
  if (typeof response?.data?.total === 'number') {
    return response.data.total;
  }
  return rows.length;
};

export const resolveData = <T>(response: SupplyResult<T> | any): T | undefined => {
  return response?.data;
};

export const stringifyJsonValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const parseJsonIfPossible = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }
  const text = value.trim();
  if (!text) {
    return '';
  }
  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
};
