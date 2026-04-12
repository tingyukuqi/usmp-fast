<template>
  <div>
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="关键字" prop="keyword">
            <el-input v-model="queryParams.keyword" placeholder="请输入云租户名称或编码" clearable @keyup.enter="handleQuery" />
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

    <el-row :gutter="10" class="mb-[10px]">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>
      </el-col>
      <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="bindingList" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="云租户编码" prop="cloudTenantCode" min-width="160" show-overflow-tooltip />
      <el-table-column label="云租户名称" prop="cloudTenantName" min-width="180" show-overflow-tooltip />
      <el-table-column label="绑定状态" min-width="100">
        <template #default="scope">
          <el-tag :type="scope.row.bindStatus === 'bound' ? 'success' : 'info'">{{ getBindStatusLabel(scope.row.bindStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="绑定组织" prop="boundOrgName" min-width="180" show-overflow-tooltip />
      <el-table-column label="绑定备注" prop="bindingRemark" min-width="220" show-overflow-tooltip />
      <el-table-column label="创建时间" min-width="170">
        <template #default="scope">
          <span>{{ proxy?.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
        </template>
      </el-table-column>
    </el-table>

    <pagination v-if="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <OrgTenantBindingDialog v-model="dialogVisible" :platform-id="platformId" :binding-id="currentBindingId" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { resolveRows, resolveTotal } from '@/api/supply/common';
import { delOrgTenantBinding, listOrgTenantBinding } from '@/api/supply/orgTenantBinding';
import { OrgTenantBindingQuery, OrgTenantBindingVO } from '@/api/supply/orgTenantBinding/types';
import OrgTenantBindingDialog from './OrgTenantBindingDialog.vue';

const props = defineProps<{
  platformId: string | number;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const showSearch = ref(true);
const loading = ref(false);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const dialogVisible = ref(false);
const currentBindingId = ref<string | number>();
const bindingList = ref<OrgTenantBindingVO[]>([]);

const queryFormRef = ref<ElFormInstance>();

const queryParams = reactive<OrgTenantBindingQuery>({
  pageNum: 1,
  pageSize: 10,
  cloudPlatformId: props.platformId,
  keyword: '',
  bindStatus: ''
});

const bindStatusOptions = [
  { label: '已绑定', value: 'bound' },
  { label: '未绑定', value: 'unbound' }
];

const normalizeRows = (rows: OrgTenantBindingVO[]) =>
  rows.map((item) => ({
    ...item,
    bindingId: item.bindingId,
    cloudTenantSnapshotId: item.cloudTenantSnapshotId ?? item.cloudTenantId,
    cloudTenantId: item.cloudTenantId ?? item.cloudTenantSnapshotId
  }));

const getBindStatusLabel = (value?: string) => bindStatusOptions.find((item) => item.value === value)?.label || value || '-';

const getList = async () => {
  loading.value = true;
  try {
    queryParams.cloudPlatformId = props.platformId;
    const response = await listOrgTenantBinding(queryParams);
    const rows = normalizeRows(resolveRows<OrgTenantBindingVO>(response));
    bindingList.value = rows;
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

const handleSelectionChange = (selection: OrgTenantBindingVO[]) => {
  ids.value = selection.map((item) => item.bindingId!).filter(Boolean);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  currentBindingId.value = undefined;
  dialogVisible.value = true;
};

const handleUpdate = (row?: OrgTenantBindingVO) => {
  currentBindingId.value = row?.bindingId || ids.value[0];
  if (!currentBindingId.value) return;
  dialogVisible.value = true;
};

const handleDelete = async (row?: OrgTenantBindingVO) => {
  const bindingIds = row?.bindingId || ids.value.join(',');
  if (!bindingIds) return;
  await proxy?.$modal.confirm(`是否确认删除云租户绑定编号为“${bindingIds}”的数据项？`);
  await delOrgTenantBinding(bindingIds);
  if (bindingList.value.length === 1 && queryParams.pageNum > 1) {
    queryParams.pageNum -= 1;
  }
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
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
