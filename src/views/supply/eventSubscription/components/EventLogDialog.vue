<template>
  <el-dialog v-model="visible" title="事件日志" width="1200px" append-to-body destroy-on-close>
    <div class="mb-[12px]">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="处理状态" prop="processStatus">
          <el-select v-model="queryParams.processStatus" placeholder="请选择处理状态" clearable style="width: 180px">
            <el-option v-for="item in processStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table v-loading="loading" :data="logList" border>
      <el-table-column label="事件范围" prop="eventScope" min-width="120" show-overflow-tooltip />
      <el-table-column label="事件键" prop="eventKey" min-width="140" show-overflow-tooltip />
      <el-table-column label="源事件ID" prop="sourceEventId" min-width="180" show-overflow-tooltip />
      <el-table-column label="事件时间" prop="eventTime" min-width="160" />
      <el-table-column label="接收时间" prop="ingestTime" min-width="160" />
      <el-table-column label="处理状态" prop="processStatus" min-width="100" show-overflow-tooltip />
      <el-table-column label="TraceId" prop="traceId" min-width="180" show-overflow-tooltip />
      <el-table-column label="错误信息" prop="errorMessage" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handlePreview(scope.row)">查看载荷</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-if="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <el-dialog v-model="payloadDialog.visible" title="事件载荷" width="900px" append-to-body>
      <el-row :gutter="12">
        <el-col :span="12">
          <div class="mb-[8px] font-medium">原始载荷</div>
          <el-input :model-value="payloadDialog.rawPayload" type="textarea" :rows="18" readonly />
        </el-col>
        <el-col :span="12">
          <div class="mb-[8px] font-medium">标准化载荷</div>
          <el-input :model-value="payloadDialog.normalizedPayload" type="textarea" :rows="18" readonly />
        </el-col>
      </el-row>
    </el-dialog>
  </el-dialog>
</template>

<script setup name="EventLogDialog" lang="ts">
import { resolveRows, resolveTotal, stringifyJsonValue } from '@/api/supply/common';
import { listEventLogs } from '@/api/supply/eventSubscription';
import { EventLogQuery, EventLogVO } from '@/api/supply/eventSubscription/types';

const props = defineProps<{
  modelValue: boolean;
  subscriptionId?: string | number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const loading = ref(false);
const logList = ref<EventLogVO[]>([]);
const total = ref(0);

const queryParams = reactive<EventLogQuery>({
  pageNum: 1,
  pageSize: 10,
  processStatus: ''
});

const processStatusOptions: DictDataOption[] = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '处理中', value: 'processing' }
];

const payloadDialog = reactive({
  visible: false,
  rawPayload: '',
  normalizedPayload: ''
});

const getList = async () => {
  if (!visible.value || !props.subscriptionId) {
    logList.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  try {
    const response = await listEventLogs(props.subscriptionId, queryParams);
    const rows = resolveRows<EventLogVO>(response);
    logList.value = rows;
    total.value = resolveTotal(response, rows);
  } finally {
    loading.value = false;
  }
};

const handlePreview = (row: EventLogVO) => {
  payloadDialog.rawPayload = stringifyJsonValue(row.rawPayload);
  payloadDialog.normalizedPayload = stringifyJsonValue(row.normalizedPayload);
  payloadDialog.visible = true;
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryParams.pageNum = 1;
  queryParams.processStatus = '';
  getList();
};

watch(
  () => [visible.value, props.subscriptionId],
  ([open]) => {
    if (open) {
      queryParams.pageNum = 1;
      getList();
    }
  },
  { immediate: true }
);
</script>
