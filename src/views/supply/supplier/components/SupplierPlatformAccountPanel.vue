<template>
  <div>
    <div class="mb-[12px] flex justify-between">
      <div class="text-sm text-[var(--el-text-color-secondary)]">平台账号列表</div>
      <el-button type="primary" plain icon="Plus" :disabled="!supplierId" @click="handleAdd">新增账号</el-button>
    </div>

    <el-table v-loading="loading" :data="accountList" border>
      <el-table-column label="云平台" prop="cloudPlatformName" min-width="160" show-overflow-tooltip />
      <el-table-column label="账号名称" prop="accountName" min-width="140" show-overflow-tooltip />
      <el-table-column label="账号标识" prop="accountIdentifier" min-width="160" show-overflow-tooltip />
      <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy?.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && accountList.length === 0" description="暂无平台账号" />

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="520px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="云平台" prop="cloudPlatformId">
          <el-select v-model="form.cloudPlatformId" placeholder="请选择云平台" filterable style="width: 100%">
            <el-option v-for="item in platformOptions" :key="item.platformId" :label="item.platformName" :value="item.platformId" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号名称" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入账号名称" maxlength="64" />
        </el-form-item>
        <el-form-item label="账号标识" prop="accountIdentifier">
          <el-input v-model="form.accountIdentifier" placeholder="请输入账号标识" maxlength="128" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="submitting" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="dialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SupplierPlatformAccountPanel" lang="ts">
import {
  addSupplierPlatformAccount,
  delSupplierPlatformAccount,
  listCloudPlatformOptions,
  listSupplierPlatformAccounts,
  updateSupplierPlatformAccount
} from '@/api/supply/supplier';
import { CloudPlatformOption, SupplierPlatformAccountForm, SupplierPlatformAccountVO } from '@/api/supply/supplier/types';

interface Props {
  supplierId?: string | number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  refreshStats: [];
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const submitting = ref(false);
const accountList = ref<SupplierPlatformAccountVO[]>([]);
const platformOptions = ref<CloudPlatformOption[]>([]);
const formRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData = (): SupplierPlatformAccountForm => ({
  accountId: undefined,
  supplierId: props.supplierId,
  cloudPlatformId: undefined,
  accountName: '',
  accountIdentifier: '',
  remark: ''
});

const form = ref<SupplierPlatformAccountForm>(initFormData());

const rules = reactive<FormRules<SupplierPlatformAccountForm>>({
  cloudPlatformId: [{ required: true, message: '云平台不能为空', trigger: 'change' }],
  accountName: [{ required: true, message: '账号名称不能为空', trigger: 'blur' }],
  accountIdentifier: [{ required: true, message: '账号标识不能为空', trigger: 'blur' }]
});

const resolveRows = <T,>(resp: any): T[] => {
  if (Array.isArray(resp?.rows)) return resp.rows;
  if (Array.isArray(resp?.data?.rows)) return resp.data.rows;
  if (Array.isArray(resp?.data)) return resp.data;
  return [];
};

const normalizePlatformOptions = (list: any[]): CloudPlatformOption[] => {
  return list.map((item) => ({
    platformId: item.platformId ?? item.id ?? item.value,
    platformName: item.platformName ?? item.label ?? item.name ?? item.platformNameCn ?? '-'
  }));
};

const resetForm = () => {
  form.value = initFormData();
  formRef.value?.clearValidate();
};

const getPlatformOptions = async () => {
  const resp = await listCloudPlatformOptions();
  platformOptions.value = normalizePlatformOptions(resolveRows(resp));
};

const getList = async () => {
  if (!props.supplierId) {
    accountList.value = [];
    return;
  }
  loading.value = true;
  try {
    const resp = await listSupplierPlatformAccounts(props.supplierId);
    accountList.value = resolveRows<SupplierPlatformAccountVO>(resp);
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  resetForm();
  dialog.visible = true;
  dialog.title = '新增平台账号';
};

const handleEdit = (row: SupplierPlatformAccountVO) => {
  form.value = {
    accountId: row.accountId,
    supplierId: row.supplierId,
    cloudPlatformId: row.cloudPlatformId,
    accountName: row.accountName,
    accountIdentifier: row.accountIdentifier,
    remark: row.remark
  };
  dialog.visible = true;
  dialog.title = '修改平台账号';
};

const handleDelete = async (row: SupplierPlatformAccountVO) => {
  await proxy?.$modal.confirm(`是否确认删除平台账号“${row.accountName}”？`);
  await delSupplierPlatformAccount(row.accountId);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
  emit('refreshStats');
};

const submitForm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid || !props.supplierId) return;
    submitting.value = true;
    try {
      if (form.value.accountId !== undefined) {
        await updateSupplierPlatformAccount(form.value);
      } else {
        await addSupplierPlatformAccount(props.supplierId, {
          ...form.value,
          supplierId: props.supplierId
        });
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
      emit('refreshStats');
    } finally {
      submitting.value = false;
    }
  });
};

watch(
  () => props.supplierId,
  async () => {
    resetForm();
    await Promise.all([getPlatformOptions(), getList()]);
  },
  { immediate: true }
);
</script>
