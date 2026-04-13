<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="620px" append-to-body destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="云租户" prop="cloudTenantSnapshotId" :required="isFieldRequired('cloudTenantSnapshotId')">
        <el-select v-model="form.cloudTenantSnapshotId" placeholder="请选择云租户" filterable clearable :disabled="isEdit" style="width: 100%">
          <el-option
            v-for="item in cloudTenantOptions"
            :key="String(item.cloudTenantSnapshotId || item.cloudTenantId)"
            :label="item.cloudTenantName || '-'"
            :value="item.cloudTenantSnapshotId || item.cloudTenantId"
          >
            <div class="flex items-center justify-between gap-3">
              <span>{{ item.cloudTenantName || '-' }}</span>
              <span class="text-xs text-[var(--el-text-color-secondary)]">{{ item.cloudTenantCode || '-' }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="绑定组织" prop="boundOrgId" :required="isFieldRequired('boundOrgId')">
        <el-tree-select
          v-model="form.boundOrgId"
          :data="orgTree"
          :props="{ value: 'id', label: 'name', children: 'children' } as any"
          value-key="id"
          node-key="id"
          check-strictly
          filterable
          clearable
          placeholder="请选择组织"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="绑定状态" prop="bindStatus">
        <el-radio-group v-model="form.bindStatus">
          <el-radio value="bound">已绑定</el-radio>
          <el-radio value="unbound">已解绑</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生效时间" prop="effectiveTime">
        <el-date-picker
          v-model="form.effectiveTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择生效时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="失效时间" prop="invalidTime" :required="isFieldRequired('invalidTime')">
        <el-date-picker
          v-model="form.invalidTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择失效时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="绑定备注" prop="bindingRemark">
        <el-input v-model="form.bindingRemark" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入绑定备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="submitting" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { resolveData, resolveRows } from '@/api/supply/common';
import { listCloudTenantOptions } from '@/api/supply/cloudTenant';
import { CloudTenantOption } from '@/api/supply/cloudTenant/types';
import { addOrgTenantBinding, getOrgTenantBinding, updateOrgTenantBinding } from '@/api/supply/orgTenantBinding';
import { OrgTenantBindingForm, OrgTenantBindingVO } from '@/api/supply/orgTenantBinding/types';
import { getOrgTree } from '@/api/system/org';
import { OrgTreeNode } from '@/api/system/org/types';
import { createSupplyValidation } from '@/views/supply/common/validationEngine';

const props = defineProps<{
  modelValue: boolean;
  platformId: string | number;
  bindingId?: string | number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const formRef = ref<ElFormInstance>();
const submitting = ref(false);
const orgTree = ref<OrgTreeNode[]>([]);
const cloudTenantOptions = ref<CloudTenantOption[]>([]);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isEdit = computed(() => props.bindingId !== undefined && props.bindingId !== null && props.bindingId !== '');
const dialogTitle = computed(() => (isEdit.value ? '修改云租户绑定' : '新增云租户绑定'));

const initFormData = (): OrgTenantBindingForm => ({
  bindingId: undefined,
  cloudPlatformId: props.platformId,
  cloudTenantSnapshotId: undefined,
  orgId: undefined,
  boundOrgId: undefined,
  bindStatus: 'bound',
  effectiveTime: '',
  invalidTime: '',
  bindingRemark: ''
});

const form = ref<OrgTenantBindingForm>(initFormData());
const validationScene = computed(() => (isEdit.value ? 'edit' : 'add'));
const { rules, isFieldRequired, normalizePayload } = createSupplyValidation('orgTenantBinding', validationScene, form);

const normalizeCloudTenantOptions = (rows: CloudTenantOption[]) =>
  rows.map((item) => ({
    ...item,
    cloudTenantSnapshotId: item.cloudTenantSnapshotId ?? item.cloudTenantId,
    cloudTenantId: item.cloudTenantId ?? item.cloudTenantSnapshotId
  }));

const loadOrgTree = async () => {
  const response = await getOrgTree();
  orgTree.value = response.data || [];
};

const loadCloudTenantOptions = async () => {
  if (isEdit.value) return;
  const response = await listCloudTenantOptions({
    cloudPlatformId: props.platformId,
    bindStatus: 'unbound'
  });
  cloudTenantOptions.value = normalizeCloudTenantOptions(resolveRows<CloudTenantOption>(response));
};

const loadDetail = async () => {
  if (!props.bindingId) return;
  const response = await getOrgTenantBinding(props.bindingId);
  const detail = resolveData<OrgTenantBindingVO>(response);
  if (!detail) return;
  form.value = {
    bindingId: detail.bindingId,
    cloudPlatformId: detail.cloudPlatformId ?? props.platformId,
    cloudTenantSnapshotId: detail.cloudTenantSnapshotId ?? detail.cloudTenantId,
    cloudTenantId: detail.cloudTenantId ?? detail.cloudTenantSnapshotId,
    orgId: detail.orgId ?? detail.boundOrgId,
    boundOrgId: detail.boundOrgId ?? detail.orgId,
    bindStatus: detail.bindStatus || 'bound',
    effectiveTime: detail.effectiveTime || '',
    invalidTime: detail.invalidTime || '',
    bindingRemark: detail.bindingRemark || ''
  };
  cloudTenantOptions.value = normalizeCloudTenantOptions([
    {
      cloudTenantSnapshotId: detail.cloudTenantSnapshotId ?? detail.cloudTenantId,
      cloudTenantId: detail.cloudTenantId ?? detail.cloudTenantSnapshotId,
      cloudTenantCode: detail.cloudTenantCode,
      cloudTenantName: detail.cloudTenantName,
      bindStatus: detail.bindStatus
    }
  ]);
};

const resetForm = () => {
  form.value = initFormData();
  cloudTenantOptions.value = [];
  formRef.value?.resetFields();
};

const initDialog = async () => {
  resetForm();
  await Promise.all([loadOrgTree(), loadCloudTenantOptions()]);
  if (isEdit.value) {
    await loadDetail();
  }
};

const submitForm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      const payload = normalizePayload() as OrgTenantBindingForm;
      payload.cloudPlatformId = props.platformId;
      payload.cloudTenantSnapshotId = form.value.cloudTenantSnapshotId ?? form.value.cloudTenantId;
      if (isEdit.value) {
        await updateOrgTenantBinding(payload);
      } else {
        await addOrgTenantBinding(payload);
      }
      proxy?.$modal.msgSuccess('操作成功');
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      initDialog();
    }
  }
);

watch(
  () => form.value.bindStatus,
  () => {
    formRef.value?.clearValidate(['invalidTime']);
  }
);
</script>
