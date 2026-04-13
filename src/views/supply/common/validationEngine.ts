import { computed, unref, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue';
import type { FormItemRule, FormRules } from 'element-plus';
import { hasValue, toJsonObjectIfNeeded } from './validationFormatters';
import {
  supplyValidationSchemas,
  type SupplySceneSchema,
  type SupplyValidationContext,
  type SupplyValidationModule,
  type SupplyValidationScene
} from './validationSchemas';

type Trigger = 'blur' | 'change' | Array<'blur' | 'change'>;

type ValidationModel = Record<string, any>;

const normalizeTrigger = (trigger?: Trigger): Trigger => trigger || 'blur';

const toRuntimeModel = (model: ValidationModel, ctx: SupplyValidationContext) => ({
  ...model,
  __ctx: ctx
});

const createRequiredValidator =
  <T extends ValidationModel>(message: string, predicate: (model: T, ctx: SupplyValidationContext) => boolean) =>
  (_rule: FormItemRule, value: unknown, callback: (error?: Error) => void, source: T) => {
    const ctx = (source as any).__ctx || {};
    if (!predicate(source, ctx) || hasValue(value)) {
      callback();
      return;
    }
    callback(new Error(message));
  };

const createCustomValidator =
  <T extends ValidationModel>(message: string, validate: (value: unknown, model: T, ctx: SupplyValidationContext) => boolean) =>
  (_rule: FormItemRule, value: unknown, callback: (error?: Error) => void, source: T) => {
    const ctx = (source as any).__ctx || {};
    if (validate(value, source, ctx)) {
      callback();
      return;
    }
    callback(new Error(message));
  };

const buildRulesFromSchema = <T extends ValidationModel>(
  schema: SupplySceneSchema<T>,
  getModel: () => T,
  getContext: () => SupplyValidationContext
): FormRules<T> => {
  const rules: FormRules<T> = {};
  Object.entries(schema.fields).forEach(([field, definition]) => {
    const fieldRules: FormItemRule[] = [];
    if (definition.required) {
      fieldRules.push({
        trigger: normalizeTrigger(definition.trigger),
        validator: createRequiredValidator<T>(definition.message || `${field}不能为空`, () => true)
      });
    }
    schema.conditionalRequired
      .filter((item) => item.field === field)
      .forEach((item) => {
        fieldRules.push({
          trigger: normalizeTrigger(item.trigger),
          validator: createRequiredValidator<T>(item.message, item.when)
        });
      });
    (definition.validators || []).forEach((validator) => {
      fieldRules.push({
        trigger: normalizeTrigger(validator.trigger),
        validator: createCustomValidator<T>(validator.message, validator.validate)
      });
    });
    if (fieldRules.length > 0) {
      (rules as any)[field] = fieldRules.map((rule) => ({
        ...rule,
        validator: (_rule: FormItemRule, value: unknown, callback: (error?: Error) => void) =>
          rule.validator?.(_rule, value, callback, toRuntimeModel(getModel(), getContext()) as any)
      }));
    }
  });
  return rules;
};

const applyDefaults = <T extends ValidationModel>(schema: SupplySceneSchema<T>, model: T) => {
  Object.entries(schema.fields).forEach(([field, definition]) => {
    if (definition.defaultValue === undefined) return;
    if (model[field] === undefined || model[field] === null || model[field] === '') {
      model[field] = typeof definition.defaultValue === 'function' ? (definition.defaultValue as () => unknown)() : definition.defaultValue;
    }
  });
};

const normalizePayload = <T extends ValidationModel>(schema: SupplySceneSchema<T>, model: T) => {
  const payload: Record<string, any> = { ...model };
  ['authPayload', 'scopeFilter', 'collectOptions', 'specPayload'].forEach((field) => {
    if (!(field in payload)) return;
    payload[field] = toJsonObjectIfNeeded(payload[field]);
  });
  Object.entries(schema.payloadFieldMap).forEach(([sourceField, targetField]) => {
    payload[targetField] = payload[sourceField];
  });
  delete payload.__ctx;
  return payload;
};

export const createSupplyValidation = <M extends SupplyValidationModule, T extends ValidationModel>(
  module: M,
  scene: MaybeRefOrGetter<SupplyValidationScene<M>>,
  model: Ref<T>,
  context?: MaybeRefOrGetter<SupplyValidationContext>
) => {
  const getSchema = () => supplyValidationSchemas[module][unref(scene)] as SupplySceneSchema<T>;
  const getContext = () => unref(context) || {};
  const rules = computed(() => buildRulesFromSchema<T>(getSchema(), () => model.value, getContext)) as ComputedRef<FormRules<T>>;

  const isFieldRequired = (field: string) => {
    const schema = getSchema();
    if (schema.requiredFields.includes(field as never)) return true;
    return schema.conditionalRequired.some((item) => item.field === field && item.when(model.value, getContext()));
  };

  return {
    schema: computed(() => getSchema()),
    rules,
    isFieldRequired,
    applyDefaults: () => applyDefaults(getSchema(), model.value),
    normalizePayload: () => normalizePayload(getSchema(), model.value)
  };
};
