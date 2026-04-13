import type { FormItemRule } from 'element-plus';

type FormRuleTrigger = 'blur' | 'change' | Array<'blur' | 'change'>;

const isEmptyValue = (value: unknown) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

const createValidator =
  <T extends Record<string, unknown>>(message: string, shouldRequire: (source: T) => boolean) =>
  (_rule: FormItemRule, value: unknown, callback: (error?: Error) => void, source: T) => {
    if (!shouldRequire(source) || !isEmptyValue(value)) {
      callback();
      return;
    }
    callback(new Error(message));
  };

export const createRequiredRule = <T extends Record<string, unknown> = Record<string, unknown>>(
  message: string,
  trigger: FormRuleTrigger = 'blur'
): FormItemRule[] => [
  {
    trigger,
    validator: createValidator<T>(message, () => true)
  }
];

export const createNumberRequiredRule = (message: string, trigger: FormRuleTrigger = 'change'): FormItemRule[] =>
  createRequiredRule(message, trigger);

export const createBooleanRequiredRule = (message: string, trigger: FormRuleTrigger = 'change'): FormItemRule[] =>
  createRequiredRule(message, trigger);

export const createConditionalRequiredRule = <T extends Record<string, unknown>>(
  message: string,
  shouldRequire: (source: T) => boolean,
  trigger: FormRuleTrigger = 'blur'
): FormItemRule[] => [
  {
    trigger,
    validator: createValidator<T>(message, shouldRequire)
  }
];
