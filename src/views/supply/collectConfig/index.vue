<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="云平台" prop="cloudPlatformId">
              <el-select v-model="queryParams.cloudPlatformId" placeholder="请选择云平台" clearable filterable style="width: 220px">
                <el-option v-for="item in platformOptions" :key="item.platformId" :label="item.platformName" :value="item.platformId" />
              </el-select>
            </el-form-item>
            <el-form-item label="供应商代码" prop="providerCode">
              <el-input v-model="queryParams.providerCode" placeholder="请输入供应商代码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="采集范围" prop="collectScope">
              <el-select v-model="queryParams.collectScope" placeholder="请选择采集范围" clearable style="width: 180px">
                <el-option v-for="item in collectScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
            <el-button v-hasPermi="['supply:collectConfig:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:collectConfig:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:collectConfig:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="configList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="云平台" prop="cloudPlatformName" min-width="160" show-overflow-tooltip />
        <el-table-column label="供应商代码" prop="providerCode" min-width="140" show-overflow-tooltip />
        <el-table-column label="采集范围" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(collectScopeOptions, scope.row.collectScope) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="采集模式" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(collectModeOptions, scope.row.collectMode) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="同步策略" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(syncStrategyOptions, scope.row.syncStrategy) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="鉴权类型" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(authTypeOptions, scope.row.authType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="执行周期" prop="executeCycle" min-width="110" show-overflow-tooltip />
        <el-table-column label="超时(s)" prop="timeoutSeconds" width="90" align="center" />
        <el-table-column label="重试次数" prop="retryTimes" width="90" align="center" />
        <el-table-column label="SSL校验" width="90" align="center">
          <template #default="scope">
            <span>{{ scope.row.verifySsl === false || scope.row.verifySsl === 'false' ? '否' : '是' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row, $event)" />
          </template>
        </el-table-column>
        <el-table-column label="最近采集状态" prop="lastCollectStatus" min-width="120" show-overflow-tooltip />
        <el-table-column label="最近采集时间" prop="lastCollectTime" min-width="160" show-overflow-tooltip />
        <el-table-column label="下次采集时间" prop="nextCollectTime" min-width="160" show-overflow-tooltip />
        <el-table-column label="最近错误" prop="lastErrorMessage" min-width="220" show-overflow-tooltip />
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['supply:collectConfig:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="立即执行" placement="top">
              <el-button v-hasPermi="['supply:collectConfig:execute']" link type="primary" icon="VideoPlay" @click="handleExecute(scope.row)" />
            </el-tooltip>
            <el-tooltip content="查看日志" placement="top">
              <el-button link type="primary" icon="Document" @click="handleOpenLog(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['supply:collectConfig:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="900px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="云平台" prop="cloudPlatformId">
              <el-select v-model="form.cloudPlatformId" placeholder="请选择云平台" filterable style="width: 100%">
                <el-option v-for="item in platformOptions" :key="item.platformId" :label="item.platformName" :value="item.platformId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商代码" prop="providerCode">
              <el-input v-model="form.providerCode" placeholder="请输入供应商代码" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采集地址" prop="collectUrl">
              <el-input v-model="form.collectUrl" placeholder="请输入采集地址" maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="同步地址" prop="syncEndpoint">
              <el-input v-model="form.syncEndpoint" placeholder="请输入同步地址" maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采集范围" prop="collectScope">
              <el-select
                v-model="form.collectScope"
                placeholder="请选择采集范围"
                clearable
                filterable
                allow-create
                default-first-option
                style="width: 100%"
              >
                <el-option v-for="item in collectScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采集模式" prop="collectMode">
              <el-select v-model="form.collectMode" placeholder="请选择采集模式" clearable style="width: 100%">
                <el-option v-for="item in collectModeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="同步策略" prop="syncStrategy">
              <el-select v-model="form.syncStrategy" placeholder="请选择同步策略" clearable style="width: 100%">
                <el-option v-for="item in syncStrategyOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="连接器编码" prop="connectorCode">
              <el-input v-model="form.connectorCode" placeholder="请输入连接器编码" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="鉴权类型" prop="authType">
              <el-select
                v-model="form.authType"
                placeholder="请选择鉴权类型"
                clearable
                filterable
                allow-create
                default-first-option
                style="width: 100%"
              >
                <el-option v-for="item in authTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行周期" prop="executeCycle">
              <el-input v-model="form.executeCycle" placeholder="请输入执行周期，如 6h" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="超时秒数" prop="timeoutSeconds">
              <el-input-number v-model="form.timeoutSeconds" :min="0" :max="999999" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重试次数" prop="retryTimes">
              <el-input-number v-model="form.retryTimes" :min="0" :max="99" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校验SSL" prop="verifySsl">
              <el-radio-group v-model="form.verifySsl">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="鉴权载荷" prop="authPayload">
              <el-input v-model="form.authPayload" type="textarea" :rows="4" placeholder="请输入鉴权 JSON" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="范围过滤" prop="scopeFilter">
              <el-input v-model="form.scopeFilter" type="textarea" :rows="4" placeholder="请输入范围过滤 JSON" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="采集选项" prop="collectOptions">
              <el-input v-model="form.collectOptions" type="textarea" :rows="4" placeholder="请输入采集选项 JSON" />
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
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="500" show-word-limit />
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

    <CollectLogDialog v-model="logDialogVisible" :collect-config-id="currentLogConfigId" />
  </div>
</template>

<script setup name="CollectConfig" lang="ts">
import { resolveData, resolveRows, resolveTotal, parseJsonIfPossible, stringifyJsonValue } from '@/api/supply/common';
import {
  addCollectConfig,
  changeCollectConfigStatus,
  delCollectConfig,
  executeCollectConfig,
  getCollectConfig,
  listCollectConfig,
  updateCollectConfig
} from '@/api/supply/collectConfig';
import { CollectConfigForm, CollectConfigQuery, CollectConfigVO } from '@/api/supply/collectConfig/types';
import { listCloudPlatformOptions } from '@/api/supply/cloudPlatform';
import { CloudPlatformOption } from '@/api/supply/cloudPlatform/types';
import CollectLogDialog from './components/CollectLogDialog.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable, supply_auth_type } = toRefs<any>(proxy?.useDict('sys_normal_disable', 'supply_auth_type'));

const loading = ref(false);
const submitting = ref(false);
const showSearch = ref(true);
const configList = ref<CollectConfigVO[]>([]);
const platformOptions = ref<CloudPlatformOption[]>([]);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const logDialogVisible = ref(false);
const currentLogConfigId = ref<string | number>();

const queryFormRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryParams = reactive<CollectConfigQuery>({
  pageNum: 1,
  pageSize: 10,
  cloudPlatformId: undefined,
  providerCode: '',
  collectScope: '',
  status: ''
});

const initFormData = (): CollectConfigForm & {
  authPayload: string;
  scopeFilter: string;
  collectOptions: string;
} => ({
  collectConfigId: undefined,
  cloudPlatformId: undefined,
  providerCode: '',
  collectUrl: '',
  syncEndpoint: '',
  collectScope: 'tenant',
  collectMode: 'scheduled_pull',
  syncStrategy: 'full',
  connectorCode: '',
  authType: '',
  authPayload: '',
  scopeFilter: '',
  collectOptions: '',
  executeCycle: '6h',
  timeoutSeconds: 60,
  retryTimes: 0,
  verifySsl: true,
  status: '0',
  remark: ''
});

const form = ref(initFormData());

const rules = reactive<FormRules<typeof form.value>>({
  cloudPlatformId: [{ required: true, message: '云平台不能为空', trigger: 'change' }],
  collectScope: [{ required: true, message: '采集范围不能为空', trigger: 'change' }],
  collectMode: [{ required: true, message: '采集模式不能为空', trigger: 'change' }]
});

const authTypeOptions = computed<DictDataOption[]>(() => supply_auth_type.value || []);

const collectScopeOptions: DictDataOption[] = [
  { label: '云租户', value: 'tenant' },
  { label: '资源台账', value: 'resource' },
  { label: '账单汇总', value: 'billing' },
  { label: '监控汇总', value: 'monitor' }
];

const collectModeOptions: DictDataOption[] = [
  { label: '定时拉取', value: 'scheduled_pull' },
  { label: '手工拉取', value: 'manual_pull' }
];

const syncStrategyOptions: DictDataOption[] = [
  { label: '全量', value: 'full' },
  { label: '增量', value: 'incremental' },
  { label: '对账', value: 'reconcile' }
];

const getOptionLabel = (options: DictDataOption[], value?: string) => {
  if (!value) return '-';
  return options.find((item) => item.value === value)?.label || value;
};

const normalizePlatformOptions = (rows: any[]): CloudPlatformOption[] => {
  return rows.map((item) => ({
    platformId: item.platformId ?? item.id ?? item.value,
    platformName: item.platformName ?? item.label ?? item.name ?? '-'
  }));
};

const resetForm = () => {
  form.value = initFormData();
  formRef.value?.resetFields();
};

const getPlatformOptionList = async () => {
  const response = await listCloudPlatformOptions();
  platformOptions.value = normalizePlatformOptions(resolveRows(response));
};

const getList = async () => {
  loading.value = true;
  try {
    const response = await listCollectConfig(queryParams);
    const rows = resolveRows<CollectConfigVO>(response);
    configList.value = rows;
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

const handleSelectionChange = (selection: CollectConfigVO[]) => {
  ids.value = selection.map((item) => item.collectConfigId);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  resetForm();
  dialog.visible = true;
  dialog.title = '新增采集配置';
};

const handleUpdate = async (row?: CollectConfigVO) => {
  const collectConfigId = row?.collectConfigId || ids.value[0];
  if (!collectConfigId) return;
  resetForm();
  const response = await getCollectConfig(collectConfigId);
  const detail = resolveData<CollectConfigVO>(response);
  if (detail) {
    Object.assign(form.value, detail, {
      authPayload: stringifyJsonValue(detail.authPayload),
      scopeFilter: stringifyJsonValue(detail.scopeFilter),
      collectOptions: stringifyJsonValue(detail.collectOptions)
    });
  }
  dialog.visible = true;
  dialog.title = '修改采集配置';
};

const handleDelete = async (row?: CollectConfigVO) => {
  const collectConfigIds = row?.collectConfigId || ids.value.join(',');
  if (!collectConfigIds) return;
  await proxy?.$modal.confirm(`是否确认删除采集配置编号为“${collectConfigIds}”的数据项？`);
  await delCollectConfig(collectConfigIds);
  if (configList.value.length === 1 && queryParams.pageNum > 1) {
    queryParams.pageNum -= 1;
  }
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

const handleStatusChange = async (row: CollectConfigVO, value: string) => {
  const previousStatus = value === '0' ? '1' : '0';
  const actionText = value === '0' ? '启用' : '停用';
  try {
    await proxy?.$modal.confirm(`是否确认${actionText}采集配置？`);
    await changeCollectConfigStatus(row.collectConfigId, value);
    proxy?.$modal.msgSuccess(`${actionText}成功`);
    await getList();
  } catch {
    row.status = previousStatus;
  }
};

const handleExecute = async (row: CollectConfigVO) => {
  await proxy?.$modal.confirm(`是否立即执行采集配置“${row.collectConfigId}”？`);
  await executeCollectConfig(row.collectConfigId);
  proxy?.$modal.msgSuccess('执行指令已提交');
  await getList();
};

const handleOpenLog = (row: CollectConfigVO) => {
  currentLogConfigId.value = row.collectConfigId;
  logDialogVisible.value = true;
};

const submitForm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      const payload: CollectConfigForm = {
        ...form.value,
        authPayload: parseJsonIfPossible(form.value.authPayload),
        scopeFilter: parseJsonIfPossible(form.value.scopeFilter),
        collectOptions: parseJsonIfPossible(form.value.collectOptions)
      };
      if (payload.collectConfigId !== undefined) {
        await updateCollectConfig(payload);
      } else {
        await addCollectConfig(payload);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    } finally {
      submitting.value = false;
    }
  });
};

onMounted(async () => {
  await Promise.all([getPlatformOptionList(), getList()]);
});
</script>
