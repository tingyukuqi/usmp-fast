<template>
  <el-dialog v-model="visible" title="采集日志" width="1100px" append-to-body destroy-on-close>
    <div class="mb-[12px]">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="结果状态" prop="resultStatus">
          <el-select v-model="queryParams.resultStatus" placeholder="请选择结果状态" clearable style="width: 180px">
            <el-option v-for="item in resultStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table v-loading="loading" :data="logList" border>
      <el-table-column label="开始时间" prop="startTime" min-width="160" />
      <el-table-column label="结束时间" prop="endTime" min-width="160" />
      <el-table-column label="执行方式" prop="executeMode" min-width="100" show-overflow-tooltip />
      <el-table-column label="结果状态" prop="resultStatus" min-width="100" show-overflow-tooltip />
      <el-table-column label="同步状态" prop="syncStatus" min-width="100" show-overflow-tooltip />
      <el-table-column label="耗时(ms)" prop="durationMs" width="100" align="center" />
      <el-table-column label="资源数" prop="resourceCount" width="90" align="center" />
      <el-table-column label="云租户数" prop="cloudTenantCount" width="100" align="center" />
      <el-table-column label="同步记录数" prop="syncRecordCount" width="110" align="center" />
      <el-table-column label="错误信息" prop="errorMessage" min-width="220" show-overflow-tooltip />
    </el-table>

    <pagination v-if="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
  </el-dialog>
</template>

<script setup name="CollectLogDialog" lang="ts">
import { listCollectLogs } from '@/api/supply/collectConfig';
import { CollectLogQuery, CollectLogVO } from '@/api/supply/collectConfig/types';
import { resolveRows, resolveTotal } from '@/api/supply/common';

const props = defineProps<{
  modelValue: boolean;
  collectConfigId?: string | number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const loading = ref(false);
const logList = ref<CollectLogVO[]>([]);
const total = ref(0);

const queryParams = reactive<CollectLogQuery>({
  pageNum: 1,
  pageSize: 10,
  resultStatus: ''
});

const resultStatusOptions: DictDataOption[] = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '执行中', value: 'running' }
];

const getList = async () => {
  if (!visible.value || !props.collectConfigId) {
    logList.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  try {
    const response = await listCollectLogs(props.collectConfigId, queryParams);
    const rows = resolveRows<CollectLogVO>(response);
    logList.value = rows;
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
  queryParams.pageNum = 1;
  queryParams.resultStatus = '';
  getList();
};

watch(
  () => [visible.value, props.collectConfigId],
  ([open]) => {
    if (open) {
      queryParams.pageNum = 1;
      getList();
    }
  },
  { immediate: true }
);
</script>
