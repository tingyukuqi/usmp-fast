export const hasValue = (value: unknown) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

export const isIpv4 = (value: string) => /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(value);

export const startsWithSlash = (value: string) => value.startsWith('/');

export const isUnifiedCreditCode = (value: string) => /^[0-9A-Z]{18}$/.test(value);

export const isPhoneNumber = (value: string) => /^1[3-9]\d{9}$/.test(value);

export const isEmailAddress = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const parseJsonObjectString = (value: string) => {
  const parsed = JSON.parse(value);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('必须为 JSON 对象');
  }
  return parsed;
};

export const isJsonObjectString = (value: string) => {
  try {
    parseJsonObjectString(value);
    return true;
  } catch {
    return false;
  }
};

export const isValidDateTimeOrder = (start?: string, end?: string) => {
  if (!hasValue(start) || !hasValue(end)) return true;
  return new Date(String(end)).getTime() >= new Date(String(start)).getTime();
};

export const toJsonObjectIfNeeded = (value: unknown) => {
  if (typeof value !== 'string' || !hasValue(value)) return value;
  return parseJsonObjectString(value);
};
