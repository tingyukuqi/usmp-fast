<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="平台名称" prop="platformName">
              <el-input v-model="queryParams.platformName" placeholder="请输入平台名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="平台编码" prop="platformCode">
              <el-input v-model="queryParams.platformCode" placeholder="请输入平台编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="平台类型" prop="platformType">
              <el-select
                v-model="queryParams.platformType"
                placeholder="请选择平台类型"
                clearable
                filterable
                allow-create
                default-first-option
                style="width: 180px"
              >
                <el-option v-for="item in platformTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 140px">
                <el-option v-for="item in sys_normal_disable" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:cloudPlatform:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:cloudPlatform:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:cloudPlatform:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:cloudPlatform:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="platformList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="平台编码" prop="platformCode" min-width="140" show-overflow-tooltip />
        <el-table-column label="平台名称" prop="platformName" min-width="160" show-overflow-tooltip />
        <el-table-column label="平台类型" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(platformTypeOptions, scope.row.platformType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="供应商代码" prop="providerCode" min-width="140" show-overflow-tooltip />
        <el-table-column label="资源池" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(resourcePoolOptions, scope.row.resourcePoolCode) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="区域编码" prop="regionCode" min-width="120" show-overflow-tooltip />
        <el-table-column label="接入地址" prop="accessUrl" min-width="220" show-overflow-tooltip />
        <el-table-column label="API版本" prop="apiVersion" min-width="110" show-overflow-tooltip />
        <el-table-column label="状态" min-width="90">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" min-width="160">
          <template #default="scope">
            <span>{{ proxy?.parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="description" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="scope">
            <el-tooltip content="云租户管理" placement="top">
              <el-button link type="primary" icon="Connection" @click="handleTenantManage(scope.row)" />
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['supply:cloudPlatform:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['supply:cloudPlatform:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="760px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="平台编码" prop="platformCode" :required="isFieldRequired('platformCode')">
              <el-input v-model="form.platformCode" placeholder="请输入平台编码" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台名称" prop="platformName" :required="isFieldRequired('platformName')">
              <el-input v-model="form.platformName" placeholder="请输入平台名称" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台类型" prop="platformType" :required="isFieldRequired('platformType')">
              <el-select
                v-model="form.platformType"
                placeholder="请选择平台类型"
                clearable
                filterable
                allow-create
                default-first-option
                style="width: 100%"
              >
                <el-option v-for="item in platformTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商代码" prop="providerCode" :required="isFieldRequired('providerCode')">
              <el-input v-model="form.providerCode" placeholder="请输入供应商代码" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源池" prop="resourcePoolCode">
              <el-select
                v-model="form.resourcePoolCode"
                placeholder="请选择资源池"
                clearable
                filterable
                allow-create
                default-first-option
                style="width: 100%"
              >
                <el-option v-for="item in resourcePoolOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="区域编码" prop="regionCode">
              <el-input v-model="form.regionCode" placeholder="请输入区域编码" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="接入地址" prop="accessUrl" :required="isFieldRequired('accessUrl')">
              <el-input v-model="form.accessUrl" placeholder="请输入接入地址" maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="API版本" prop="apiVersion">
              <el-input v-model="form.apiVersion" placeholder="请输入 API 版本" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="item in sys_normal_disable" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入平台描述" maxlength="500" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup name="CloudPlatform" lang="ts">
import { resolveData, resolveRows, resolveTotal } from '@/api/supply/common';
import { addCloudPlatform, delCloudPlatform, getCloudPlatform, listCloudPlatform, updateCloudPlatform } from '@/api/supply/cloudPlatform';
import { CloudPlatformForm, CloudPlatformQuery, CloudPlatformVO } from '@/api/supply/cloudPlatform/types';
import { createSupplyValidation } from '@/views/supply/common/validationEngine';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable, supply_cloud_platform_type, supply_resource_pool } = toRefs<any>(
  proxy?.useDict('sys_normal_disable', 'supply_cloud_platform_type', 'supply_resource_pool')
);

const loading = ref(false);
const submitting = ref(false);
const showSearch = ref(true);
const platformList = ref<CloudPlatformVO[]>([]);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);

const queryFormRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryParams = reactive<CloudPlatformQuery>({
  pageNum: 1,
  pageSize: 10,
  platformName: '',
  platformCode: '',
  platformType: '',
  providerCode: '',
  status: ''
});

const initFormData = (): CloudPlatformForm => ({
  platformId: undefined,
  platformCode: '',
  platformName: '',
  platformType: '',
  providerCode: '',
  resourcePoolCode: '',
  regionCode: '',
  accessUrl: '',
  apiVersion: '',
  description: '',
  status: '0'
});

const form = ref<CloudPlatformForm>(initFormData());

const validationScene = computed(() => (form.value.platformId !== undefined ? 'edit' : 'add'));
const { rules, isFieldRequired, normalizePayload } = createSupplyValidation('cloudPlatform', validationScene, form);

const platformTypeOptions = computed<DictDataOption[]>(() => supply_cloud_platform_type.value || []);
const resourcePoolOptions = computed<DictDataOption[]>(() => supply_resource_pool.value || []);

const getOptionLabel = (options: DictDataOption[], value?: string) => {
  if (!value) return '-';
  return options.find((item) => item.value === value)?.label || value;
};

const resetForm = () => {
  form.value = initFormData();
  formRef.value?.resetFields();
};

const getList = async () => {
  loading.value = true;
  try {
    const response = await listCloudPlatform(queryParams);
    const rows = resolveRows<CloudPlatformVO>(response);
    platformList.value = rows;
    total.value = resolveTotal(response, rows);
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  getList();
};

const handleSelectionChange = (selection: CloudPlatformVO[]) => {
  ids.value = selection.map((item) => item.platformId);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  resetForm();
  dialog.visible = true;
  dialog.title = '新增云平台';
};

const handleUpdate = async (row?: CloudPlatformVO) => {
  const platformId = row?.platformId || ids.value[0];
  if (!platformId) return;
  resetForm();
  const response = await getCloudPlatform(platformId);
  const detail = resolveData<CloudPlatformVO>(response);
  if (detail) {
    Object.assign(form.value, detail);
  }
  dialog.visible = true;
  dialog.title = '修改云平台';
};

const handleDelete = async (row?: CloudPlatformVO) => {
  const platformIds = row?.platformId || ids.value.join(',');
  if (!platformIds) return;
  await proxy?.$modal.confirm(`是否确认删除云平台编号为“${platformIds}”的数据项？`);
  await delCloudPlatform(platformIds);
  if (platformList.value.length === 1 && queryParams.pageNum > 1) {
    queryParams.pageNum -= 1;
  }
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

const submitForm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      const payload = normalizePayload() as CloudPlatformForm;
      if (payload.platformId !== undefined) {
        await updateCloudPlatform(payload);
      } else {
        await addCloudPlatform(payload);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    } finally {
      submitting.value = false;
    }
  });
};

const handleExport = () => {
  proxy?.download(
    'supply/cloud-platforms/export',
    {
      ...queryParams
    },
    `cloud_platforms_${new Date().getTime()}.xlsx`
  );
};

const handleTenantManage = (row: CloudPlatformVO) => {
  if (!row.platformId) return;
  proxy?.$tab.openPage(
    `/supply/cloud-platform/tenant-manage/${row.platformId}`,
    `云租户管理-${row.platformName || row.platformCode || row.platformId}`
  );
};

onMounted(() => {
  getList();
});
</script>
