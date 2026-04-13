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
            <el-form-item label="事件范围" prop="eventScope">
              <el-select v-model="queryParams.eventScope" placeholder="请选择事件范围" clearable style="width: 180px">
                <el-option v-for="item in eventScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="接入方式" prop="ingestMode">
              <el-select v-model="queryParams.ingestMode" placeholder="请选择接入方式" clearable style="width: 180px">
                <el-option v-for="item in ingestModeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
            <el-button v-hasPermi="['supply:eventSubscription:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:eventSubscription:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['supply:eventSubscription:remove']"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
            >
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="subscriptionList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="云平台" prop="cloudPlatformName" min-width="160" show-overflow-tooltip />
        <el-table-column label="供应商代码" prop="providerCode" min-width="140" show-overflow-tooltip />
        <el-table-column label="事件范围" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(eventScopeOptions, scope.row.eventScope) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="接入方式" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(ingestModeOptions, scope.row.ingestMode) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="主题" prop="topicName" min-width="160" show-overflow-tooltip />
        <el-table-column label="消费组" prop="consumerGroup" min-width="160" show-overflow-tooltip />
        <el-table-column label="回调路径" prop="endpointPath" min-width="180" show-overflow-tooltip />
        <el-table-column label="数据格式" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(dataFormatOptions, scope.row.dataFormat) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Schema版本" prop="schemaVersion" min-width="120" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row, $event)" />
          </template>
        </el-table-column>
        <el-table-column label="最近事件时间" prop="lastEventTime" min-width="160" show-overflow-tooltip />
        <el-table-column label="最近错误" prop="lastErrorMessage" min-width="220" show-overflow-tooltip />
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['supply:eventSubscription:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="查看日志" placement="top">
              <el-button link type="primary" icon="Document" @click="handleOpenLog(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['supply:eventSubscription:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="860px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="云平台" prop="cloudPlatformId" :required="isFieldRequired('cloudPlatformId')">
              <el-select v-model="form.cloudPlatformId" placeholder="请选择云平台" filterable style="width: 100%">
                <el-option v-for="item in platformOptions" :key="item.platformId" :label="item.platformName" :value="item.platformId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商代码" prop="providerCode" :required="isFieldRequired('providerCode')">
              <el-input v-model="form.providerCode" placeholder="请输入供应商代码" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="事件范围" prop="eventScope" :required="isFieldRequired('eventScope')">
              <el-select v-model="form.eventScope" placeholder="请选择事件范围" clearable style="width: 100%">
                <el-option v-for="item in eventScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接入方式" prop="ingestMode" :required="isFieldRequired('ingestMode')">
              <el-select v-model="form.ingestMode" placeholder="请选择接入方式" clearable style="width: 100%">
                <el-option v-for="item in ingestModeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主题名称" prop="topicName" :required="isFieldRequired('topicName')">
              <el-input v-model="form.topicName" placeholder="请输入主题名称" maxlength="128" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消费组" prop="consumerGroup" :required="isFieldRequired('consumerGroup')">
              <el-input v-model="form.consumerGroup" placeholder="请输入消费组" maxlength="128" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="回调路径" prop="endpointPath" :required="isFieldRequired('endpointPath')">
              <el-input v-model="form.endpointPath" placeholder="请输入回调路径" maxlength="255" />
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
            <el-form-item label="数据格式" prop="dataFormat" :required="isFieldRequired('dataFormat')">
              <el-select v-model="form.dataFormat" placeholder="请选择数据格式" clearable style="width: 100%">
                <el-option v-for="item in dataFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Schema版本" prop="schemaVersion" :required="isFieldRequired('schemaVersion')">
              <el-input v-model="form.schemaVersion" placeholder="请输入 Schema 版本" maxlength="64" />
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
            <el-form-item label="鉴权载荷" prop="authPayload" :required="isFieldRequired('authPayload')">
              <el-input v-model="form.authPayload" type="textarea" :rows="5" placeholder="请输入鉴权 JSON" />
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

    <EventLogDialog v-model="logDialogVisible" :subscription-id="currentLogSubscriptionId" />
  </div>
</template>

<script setup name="EventSubscription" lang="ts">
import { parseJsonIfPossible, resolveData, resolveRows, resolveTotal, stringifyJsonValue } from '@/api/supply/common';
import { listCloudPlatformOptions } from '@/api/supply/cloudPlatform';
import { CloudPlatformOption } from '@/api/supply/cloudPlatform/types';
import {
  addEventSubscription,
  changeEventSubscriptionStatus,
  delEventSubscription,
  getEventSubscription,
  listEventSubscription,
  updateEventSubscription
} from '@/api/supply/eventSubscription';
import { EventSubscriptionForm, EventSubscriptionQuery, EventSubscriptionVO } from '@/api/supply/eventSubscription/types';
import { createSupplyValidation } from '@/views/supply/common/validationEngine';
import EventLogDialog from './components/EventLogDialog.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable, supply_auth_type } = toRefs<any>(proxy?.useDict('sys_normal_disable', 'supply_auth_type'));

const loading = ref(false);
const submitting = ref(false);
const showSearch = ref(true);
const subscriptionList = ref<EventSubscriptionVO[]>([]);
const platformOptions = ref<CloudPlatformOption[]>([]);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const logDialogVisible = ref(false);
const currentLogSubscriptionId = ref<string | number>();

const queryFormRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryParams = reactive<EventSubscriptionQuery>({
  pageNum: 1,
  pageSize: 10,
  cloudPlatformId: undefined,
  eventScope: '',
  ingestMode: '',
  status: ''
});

const initFormData = (): EventSubscriptionForm & { authPayload: string } => ({
  subscriptionId: undefined,
  cloudPlatformId: undefined,
  providerCode: '',
  eventScope: 'alarm',
  ingestMode: 'webhook',
  topicName: '',
  consumerGroup: '',
  endpointPath: '',
  authType: '',
  authPayload: '',
  dataFormat: 'json',
  schemaVersion: 'v1',
  status: '0',
  remark: ''
});

const form = ref(initFormData());

const validationScene = computed(() => (form.value.subscriptionId !== undefined ? 'edit' : 'add'));
const { rules, isFieldRequired, normalizePayload } = createSupplyValidation('eventSubscription', validationScene, form);

const authTypeOptions = computed<DictDataOption[]>(() => supply_auth_type.value || []);

const eventScopeOptions: DictDataOption[] = [
  { label: '告警事件', value: 'alarm' },
  { label: '资源变更', value: 'resource_change' },
  { label: '租户变更', value: 'tenant_change' },
  { label: '操作审计', value: 'operation_audit' }
];

const ingestModeOptions: DictDataOption[] = [
  { label: 'RocketMQ', value: 'rocketmq' },
  { label: 'Kafka适配器', value: 'kafka_adapter' },
  { label: 'Webhook', value: 'webhook' }
];

const dataFormatOptions: DictDataOption[] = [
  { label: 'JSON', value: 'json' },
  { label: 'CloudEvents JSON', value: 'cloudevents_json' }
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
    const response = await listEventSubscription(queryParams);
    const rows = resolveRows<EventSubscriptionVO>(response);
    subscriptionList.value = rows;
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

const handleSelectionChange = (selection: EventSubscriptionVO[]) => {
  ids.value = selection.map((item) => item.subscriptionId);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  resetForm();
  dialog.visible = true;
  dialog.title = '新增事件订阅';
};

const handleUpdate = async (row?: EventSubscriptionVO) => {
  const subscriptionId = row?.subscriptionId || ids.value[0];
  if (!subscriptionId) return;
  resetForm();
  const response = await getEventSubscription(subscriptionId);
  const detail = resolveData<EventSubscriptionVO>(response);
  if (detail) {
    Object.assign(form.value, detail, {
      authPayload: stringifyJsonValue(detail.authPayload)
    });
  }
  dialog.visible = true;
  dialog.title = '修改事件订阅';
};

const handleDelete = async (row?: EventSubscriptionVO) => {
  const subscriptionIds = row?.subscriptionId || ids.value.join(',');
  if (!subscriptionIds) return;
  await proxy?.$modal.confirm(`是否确认删除事件订阅编号为“${subscriptionIds}”的数据项？`);
  await delEventSubscription(subscriptionIds);
  if (subscriptionList.value.length === 1 && queryParams.pageNum > 1) {
    queryParams.pageNum -= 1;
  }
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

const handleStatusChange = async (row: EventSubscriptionVO, value: string) => {
  const previousStatus = value === '0' ? '1' : '0';
  const actionText = value === '0' ? '启用' : '停用';
  try {
    await proxy?.$modal.confirm(`是否确认${actionText}事件订阅？`);
    await changeEventSubscriptionStatus(row.subscriptionId, value);
    proxy?.$modal.msgSuccess(`${actionText}成功`);
    await getList();
  } catch {
    row.status = previousStatus;
  }
};

const handleOpenLog = (row: EventSubscriptionVO) => {
  currentLogSubscriptionId.value = row.subscriptionId;
  logDialogVisible.value = true;
};

const submitForm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      const payload = normalizePayload() as EventSubscriptionForm;
      if (payload.subscriptionId !== undefined) {
        await updateEventSubscription(payload);
      } else {
        await addEventSubscription(payload);
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

watch(
  () => [form.value.ingestMode, form.value.authType],
  () => {
    formRef.value?.clearValidate(['topicName', 'consumerGroup', 'endpointPath', 'authPayload']);
  }
);
</script>
