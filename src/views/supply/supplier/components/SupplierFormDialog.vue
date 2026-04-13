<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="720px" append-to-body destroy-on-close @closed="handleClosed">
    <el-form ref="formRef" :model="model" :rules="rules" label-width="110px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="供应商编码" prop="supplierCode" :required="isFieldRequired('supplierCode')">
            <el-input v-model="model.supplierCode" placeholder="请输入供应商编码" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商名称" prop="supplierName" :required="isFieldRequired('supplierName')">
            <el-input v-model="model.supplierName" placeholder="请输入供应商名称" maxlength="64" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="供应商简称" prop="supplierShortName">
            <el-input v-model="model.supplierShortName" placeholder="请输入供应商简称" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商类型" prop="supplierType" :required="isFieldRequired('supplierType')">
            <el-input v-model="model.supplierType" placeholder="请输入供应商类型" maxlength="64" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="统一信用代码" prop="creditCode">
            <el-input v-model="model.creditCode" placeholder="请输入统一社会信用代码" maxlength="18" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合作类型" prop="cooperationType">
            <el-select v-model="model.cooperationType" placeholder="请选择合作类型" clearable style="width: 100%">
              <el-option v-for="item in cooperationTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="联系人" prop="contactName">
            <el-input v-model="model.contactName" placeholder="请输入联系人" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="model.contactPhone" placeholder="请输入联系电话" maxlength="11" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="联系邮箱" prop="contactEmail">
            <el-input v-model="model.contactEmail" placeholder="请输入联系邮箱" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="服务范围" prop="serviceScope">
            <el-input v-model="model.serviceScope" placeholder="请输入服务范围" maxlength="255" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="公司地址" prop="address">
        <el-input v-model="model.address" placeholder="请输入公司地址" maxlength="255" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="model.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="500" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="submitting" type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="handleCancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="SupplierFormDialog" lang="ts">
import { addSupplier, updateSupplier } from '@/api/supply/supplier';
import { SupplierForm } from '@/api/supply/supplier/types';
import { createSupplyValidation } from '@/views/supply/common/validationEngine';

interface OptionItem {
  label: string;
  value: string;
}

interface Props {
  modelValue: boolean;
  mode: 'add' | 'edit';
  formData?: Partial<SupplierForm>;
  cooperationTypeOptions?: OptionItem[];
}

const props = withDefaults(defineProps<Props>(), {
  formData: () => ({}),
  cooperationTypeOptions: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const formRef = ref<ElFormInstance>();
const submitting = ref(false);

const initFormData = (): SupplierForm => ({
  supplierId: undefined,
  supplierCode: '',
  supplierName: '',
  supplierShortName: '',
  supplierType: '',
  creditCode: '',
  serviceScope: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  cooperationType: '',
  remark: ''
});

const model = ref<SupplierForm>(initFormData());

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const dialogTitle = computed(() => (props.mode === 'edit' ? '修改供应商' : '新增供应商'));

const validationScene = computed(() => (props.mode === 'edit' ? 'edit' : 'add'));
const { rules, isFieldRequired, normalizePayload } = createSupplyValidation('supplier', validationScene, model);

const resetModel = () => {
  model.value = {
    ...initFormData(),
    ...props.formData
  };
};

const handleCancel = () => {
  visible.value = false;
};

const handleClosed = () => {
  formRef.value?.resetFields();
  resetModel();
};

const handleSubmit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      const payload = normalizePayload() as SupplierForm;
      if (props.mode === 'edit' && payload.supplierId !== undefined) {
        await updateSupplier(payload);
      } else {
        await addSupplier(payload);
      }
      proxy?.$modal.msgSuccess('操作成功');
      emit('success');
      visible.value = false;
    } finally {
      submitting.value = false;
    }
  });
};

watch(
  () => [props.formData, props.modelValue] as const,
  ([, opened]) => {
    if (!opened) return;
    resetModel();
    nextTick(() => formRef.value?.clearValidate());
  },
  { immediate: true, deep: true }
);
</script>
