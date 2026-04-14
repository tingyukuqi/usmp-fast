<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="供应商名称" prop="supplierName">
              <el-input v-model="queryParams.supplierName" placeholder="请输入供应商名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="信用代码" prop="creditCode">
              <el-input v-model="queryParams.creditCode" placeholder="请输入统一社会信用代码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="合作类型" prop="cooperationType">
              <el-select v-model="queryParams.cooperationType" placeholder="请选择合作类型" clearable style="width: 180px">
                <el-option v-for="item in cooperationTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
            <el-button v-hasPermi="['supply:supplier:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:supplier:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:supplier:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="supplierList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="供应商编码" prop="supplierCode" min-width="140" show-overflow-tooltip />
        <el-table-column label="供应商名称" prop="supplierName" min-width="160" show-overflow-tooltip />
        <el-table-column label="供应商简称" prop="supplierShortName" min-width="120" show-overflow-tooltip />
        <el-table-column label="供应商类型" prop="supplierType" min-width="120" show-overflow-tooltip />
        <el-table-column label="信用代码" prop="creditCode" min-width="180" show-overflow-tooltip />
        <el-table-column label="联系人" prop="contactName" min-width="120" show-overflow-tooltip />
        <el-table-column label="联系电话" prop="contactPhone" min-width="120" />
        <el-table-column label="联系邮箱" prop="contactEmail" min-width="180" show-overflow-tooltip />
        <el-table-column label="合作类型" min-width="120">
          <template #default="scope">
            <dict-tag :options="cooperationTypeOptions" :value="scope.row.cooperationType" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row, $event)" />
          </template>
        </el-table-column>
        <el-table-column label="关联平台数" prop="platformCount" width="100" align="center" />
        <el-table-column label="关联账号数" prop="accountCount" width="100" align="center" />
        <el-table-column label="创建时间" prop="createTime" min-width="160">
          <template #default="scope">
            <span>{{ proxy?.parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['supply:supplier:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="管理" placement="top">
              <el-button v-hasPermi="['supply:supplier:edit']" link type="primary" icon="Setting" @click="handleManage(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['supply:supplier:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <SupplierFormDialog
      v-model="formDialogVisible"
      :mode="formMode"
      :form-data="currentSupplier"
      :cooperation-type-options="cooperationTypeOptions"
      @success="handleFormSuccess"
    />

    <SupplierManageDrawer v-model="drawerVisible" :supplier="currentSupplier" :users="currentUsers" @refresh-stats="handleRefreshStats" />
  </div>
</template>

<script setup name="SupplierManagement" lang="ts">
import { changeSupplierStatus, delSupplier, getSupplier, listSupplier } from '@/api/supply/supplier';
import { SupplierBoundUser, SupplierQuery, SupplierVO } from '@/api/supply/supplier/types';
import { extractSupplierBoundUsers } from './supplierBoundUsers';
import SupplierFormDialog from './components/SupplierFormDialog.vue';
import SupplierManageDrawer from './components/SupplierManageDrawer.vue';

interface DictOption {
  label: string;
  value: string;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));
const { supply_cooperation_type } = toRefs<any>(proxy?.useDict('supply_cooperation_type'));

const loading = ref(false);
const showSearch = ref(true);
const supplierList = ref<SupplierVO[]>([]);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const formDialogVisible = ref(false);
const drawerVisible = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const currentSupplier = ref<Partial<SupplierVO>>({});
const currentUsers = ref<SupplierBoundUser[]>([]);

const queryFormRef = ref<ElFormInstance>();

const queryParams = reactive<SupplierQuery>({
  pageNum: 1,
  pageSize: 10,
  supplierName: '',
  creditCode: '',
  cooperationType: '',
  status: ''
});

const cooperationTypeOptions = computed<DictOption[]>(() => supply_cooperation_type.value || []);

const resolveRows = <T,>(resp: any): T[] => {
  if (Array.isArray(resp?.rows)) return resp.rows;
  if (Array.isArray(resp?.data?.rows)) return resp.data.rows;
  if (Array.isArray(resp?.data)) return resp.data;
  return [];
};

const resolveTotal = (resp: any, rows: any[]) => {
  if (typeof resp?.total === 'number') return resp.total;
  if (typeof resp?.data?.total === 'number') return resp.data.total;
  return rows.length;
};

const resolveBoundUsers = (data: any): SupplierBoundUser[] => extractSupplierBoundUsers(data);

const getList = async () => {
  loading.value = true;
  try {
    const resp = await listSupplier(queryParams);
    const rows = resolveRows<SupplierVO>(resp);
    supplierList.value = rows;
    total.value = resolveTotal(resp, rows);
  } finally {
    loading.value = false;
  }
};

const refreshCurrentSupplier = async () => {
  if (!currentSupplier.value.supplierId) return;
  const resp = await getSupplier(currentSupplier.value.supplierId);
  currentSupplier.value = resp.data || {};
  currentUsers.value = resolveBoundUsers(resp.data);
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

const handleSelectionChange = (selection: SupplierVO[]) => {
  ids.value = selection.map((item) => item.supplierId);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  currentSupplier.value = {};
  formMode.value = 'add';
  formDialogVisible.value = true;
};

const handleUpdate = async (row?: SupplierVO) => {
  const supplierId = row?.supplierId || ids.value[0];
  if (!supplierId) return;
  const resp = await getSupplier(supplierId);
  currentSupplier.value = resp.data || {};
  formMode.value = 'edit';
  formDialogVisible.value = true;
};

const handleDelete = async (row?: SupplierVO) => {
  const supplierIds = row?.supplierId || ids.value.join(',');
  if (!supplierIds) return;
  await proxy?.$modal.confirm(`是否确认删除供应商编号为“${supplierIds}”的数据项？`);
  await delSupplier(supplierIds);
  if (supplierList.value.length === 1 && queryParams.pageNum && queryParams.pageNum > 1) {
    queryParams.pageNum -= 1;
  }
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

const handleStatusChange = async (row: SupplierVO, value: string) => {
  const previousStatus = value === '0' ? '1' : '0';
  const actionText = value === '0' ? '启用' : '停用';
  try {
    await proxy?.$modal.confirm(`是否确认${actionText}供应商“${row.supplierName}”？`);
    await changeSupplierStatus(row.supplierId, value);
    proxy?.$modal.msgSuccess(`${actionText}成功`);
    await getList();
  } catch {
    row.status = previousStatus;
  }
};

const handleManage = async (row: SupplierVO) => {
  const resp = await getSupplier(row.supplierId);
  currentSupplier.value = resp.data || row;
  currentUsers.value = resolveBoundUsers(resp.data);
  drawerVisible.value = true;
};

const handleFormSuccess = async () => {
  await getList();
  if (drawerVisible.value && currentSupplier.value.supplierId) {
    await refreshCurrentSupplier();
  }
};

const handleRefreshStats = async () => {
  await getList();
  if (drawerVisible.value) {
    await refreshCurrentSupplier();
  }
};

onMounted(() => {
  getList();
});
</script>
