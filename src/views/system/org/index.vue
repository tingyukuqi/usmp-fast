<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="组织名称" prop="orgName">
              <el-input v-model="queryParams.orgName" placeholder="请输入组织名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="组织类型" prop="deptCategory">
              <el-input v-model="queryParams.deptCategory" placeholder="请输入组织类型" clearable style="width: 240px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="组织状态" clearable>
                <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button v-hasPermi="['system:org:add']" type="primary" plain icon="Plus" @click="handleAdd()">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:org:remove']" type="danger" plain icon="Delete" :disabled="ids.length === 0" @click="handleDelete()">删除</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table ref="orgTableRef" v-loading="loading" :data="orgList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="组织名称" prop="orgName" :show-overflow-tooltip="true" min-width="150" />
        <el-table-column label="组织类型" prop="deptCategory" align="center" min-width="120" />
        <el-table-column v-if="false" label="排序" prop="orderNum" align="center" width="80" />
        <el-table-column label="负责人" prop="leaderName" align="center" min-width="100" />
        <el-table-column label="联系电话" prop="phone" align="center" min-width="120" />
        <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" min-width="160" />
        <el-table-column label="租户名称" prop="tenantName" :show-overflow-tooltip="true" min-width="150" />
        <el-table-column label="状态" align="center" width="80">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" min-width="160">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150" align="center">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['system:org:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="查看部门" placement="top">
              <el-button v-hasPermi="['system:org:query']" link type="primary" icon="OfficeBuilding" @click="handleViewDept(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['system:org:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/修改组织弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" destroy-on-close append-to-body width="500px">
      <el-form ref="orgFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属租户" prop="tenantId">
          <el-select v-model="form.tenantId" placeholder="请选择租户" filterable style="width: 100%">
            <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId" />
          </el-select>
        </el-form-item>
        <el-form-item label="组织名称" prop="orgName">
          <el-input v-model="form.orgName" placeholder="请输入组织名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="组织类型" prop="deptCategory">
          <el-input v-model="form.deptCategory" placeholder="请输入组织类型" />
        </el-form-item>
        <el-form-item label="显示排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" controls-position="right" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看组织下部门树弹窗 -->
    <el-dialog v-model="deptDialogVisible" title="组织下部门结构" destroy-on-close append-to-body width="500px">
      <el-tree
        ref="deptTreeRef"
        :data="deptTreeData"
        :props="{ label: 'label', children: 'children' }"
        node-key="id"
        default-expand-all
      />
      <template #footer>
        <el-button @click="deptDialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Org" lang="ts">
import { listOrg, getOrg, addOrg, updateOrg, delOrg, getOrgDeptTree } from '@/api/system/org';
import { OrgVO, OrgForm, OrgQuery } from '@/api/system/org/types';
import { getTenantList } from '@/api/login';
import { useUserStore } from '@/store/modules/user';
import { TenantVO } from '@/api/types';

const userStore = useUserStore();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const orgList = ref<OrgVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const deptDialogVisible = ref(false);
const deptTreeData = ref<any[]>([]);

/** 租户列表 */
const tenantList = ref<TenantVO[]>([]);
const currentTenantId = userStore.tenantId;

const queryFormRef = ref<ElFormInstance>();
const orgFormRef = ref<ElFormInstance>();
const orgTableRef = ref<ElTableInstance>();
const deptTreeRef = ref<ElTreeInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: OrgForm = {
  orgId: undefined,
  orgName: '',
  deptCategory: undefined,
  orderNum: 0,
  leader: undefined,
  phone: undefined,
  email: undefined,
  status: '0',
  tenantId: currentTenantId
};

const data = reactive<PageData<OrgForm, OrgQuery>>({
  form: { ...initFormData },
  queryParams: {
    orgName: undefined,
    deptCategory: undefined,
    status: undefined
  },
  rules: {
    orgName: [{ required: true, message: '组织名称不能为空', trigger: 'blur' }],
    orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
    email: [{ type: 'email' as any, message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phone: [{ pattern: /^1[3456789][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
  }
});
const { form, queryParams, rules } = toRefs(data);

/** 查询组织列表 */
const getList = async () => {
  loading.value = true;
  const res = await listOrg(queryParams.value);
  orgList.value = res.data || [];
  loading.value = false;
};

/** 搜索 */
const handleQuery = () => {
  getList();
};

/** 重置 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选 */
const handleSelectionChange = (selection: OrgVO[]) => {
  ids.value = selection.map(item => item.orgId);
};

/** 重置表单 */
const reset = () => {
  form.value = { ...initFormData };
  orgFormRef.value?.resetFields();
};

/** 新增 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增组织';
};

/** 修改 */
const handleUpdate = async (row: OrgVO) => {
  reset();
  const res = await getOrg(row.orgId);
  form.value = res.data;
  dialog.visible = true;
  dialog.title = '修改组织';
};

/** 查看组织下部门树 */
const handleViewDept = async (row: OrgVO) => {
  const res = await getOrgDeptTree(row.orgId);
  deptTreeData.value = res.data || [];
  deptDialogVisible.value = true;
};

/** 提交 */
const submitForm = () => {
  orgFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.orgId ? await updateOrg(form.value) : await addOrg(form.value);
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除 */
const handleDelete = async (row?: OrgVO) => {
  const orgIds = row?.orgId || ids.value.join(',');
  await proxy?.$modal.confirm('是否确认删除组织编号为"' + orgIds + '"的数据项?');
  await delOrg(orgIds);
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

/** 取消 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 加载租户列表 */
const loadTenantList = async () => {
  const res = await getTenantList(true);
  tenantList.value = res.data?.voList || [];
};

onMounted(() => {
  loadTenantList();
  getList();
});
</script>
