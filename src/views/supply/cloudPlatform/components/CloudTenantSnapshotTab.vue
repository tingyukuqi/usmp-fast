<template>
  <div>
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="关键字" prop="keyword">
            <el-input v-model="queryParams.keyword" placeholder="请输入云租户名称或编码" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="租户状态" prop="tenantStatus">
            <el-select v-model="queryParams.tenantStatus" placeholder="请选择租户状态" clearable style="width: 160px">
              <el-option v-for="item in tenantStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="绑定状态" prop="bindStatus">
            <el-select v-model="queryParams.bindStatus" placeholder="请选择绑定状态" clearable style="width: 160px">
              <el-option v-for="item in bindStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-table v-loading="loading" :data="tenantList" border>
      <el-table-column label="租户编码" prop="cloudTenantCode" min-width="160" show-overflow-tooltip />
      <el-table-column label="租户名称" prop="cloudTenantName" min-width="180" show-overflow-tooltip />
      <el-table-column label="外部租户ID" prop="externalTenantId" min-width="180" show-overflow-tooltip />
      <el-table-column label="租户状态" min-width="120">
        <template #default="scope">
          <el-tag :type="getTenantStatusTag(scope.row.tenantStatus)">{{ getTenantStatusLabel(scope.row.tenantStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="绑定状态" min-width="100">
        <template #default="scope">
          <el-tag :type="scope.row.bindStatus === 'bound' ? 'success' : 'info'">{{ getBindStatusLabel(scope.row.bindStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="绑定组织" prop="boundOrgName" min-width="180" show-overflow-tooltip />
      <el-table-column label="同步时间" min-width="170">
        <template #default="scope">
          <span>{{ proxy?.parseTime(scope.row.lastSyncTime || scope.row.updateTime || scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
    </el-table>

    <pagination v-if="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
  </div>
</template>

<script setup lang="ts">
import { resolveRows, resolveTotal } from '@/api/supply/common';
import { listCloudTenant } from '@/api/supply/cloudTenant';
import { CloudTenantQuery, CloudTenantVO } from '@/api/supply/cloudTenant/types';

const props = defineProps<{
  platformId: string | number;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const showSearch = ref(true);
const loading = ref(false);
const total = ref(0);
const tenantList = ref<CloudTenantVO[]>([]);

const queryFormRef = ref<ElFormInstance>();

const queryParams = reactive<CloudTenantQuery>({
  pageNum: 1,
  pageSize: 10,
  cloudPlatformId: props.platformId,
  keyword: '',
  tenantStatus: '',
  bindStatus: ''
});

const tenantStatusOptions = [
  { label: '正常', value: 'normal' },
  { label: '冻结', value: 'frozen' },
  { label: '已删除', value: 'deleted' }
];

const bindStatusOptions = [
  { label: '已绑定', value: 'bound' },
  { label: '未绑定', value: 'unbound' }
];

const normalizeRows = (rows: CloudTenantVO[]) =>
  rows.map((item) => ({
    ...item,
    cloudTenantSnapshotId: item.cloudTenantSnapshotId ?? item.cloudTenantId,
    cloudTenantId: item.cloudTenantId ?? item.cloudTenantSnapshotId
  }));

const getTenantStatusLabel = (value?: string) => tenantStatusOptions.find((item) => item.value === value)?.label || value || '-';
const getBindStatusLabel = (value?: string) => bindStatusOptions.find((item) => item.value === value)?.label || value || '-';

const getTenantStatusTag = (value?: string) => {
  if (value === 'normal') return 'success';
  if (value === 'frozen') return 'warning';
  if (value === 'deleted') return 'danger';
  return 'info';
};

const getList = async () => {
  loading.value = true;
  try {
    queryParams.cloudPlatformId = props.platformId;
    const response = await listCloudTenant(queryParams);
    const rows = normalizeRows(resolveRows<CloudTenantVO>(response));
    tenantList.value = rows;
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
  queryParams.cloudPlatformId = props.platformId;
  getList();
};

watch(
  () => props.platformId,
  () => {
    queryParams.cloudPlatformId = props.platformId;
    queryParams.pageNum = 1;
    getList();
  },
  { immediate: true }
);

defineExpose({
  reload: getList
});
</script>
