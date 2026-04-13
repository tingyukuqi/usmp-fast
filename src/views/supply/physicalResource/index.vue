<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" label-width="80px">
            <el-row :gutter="12">
              <el-col :span="5">
                <el-form-item label="所属供应商" prop="supplierId" label-width="96px" class="supplier-query-item">
                  <el-select v-model="queryParams.supplierId" placeholder="请选择供应商" clearable filterable style="width: 100%">
                    <el-option v-for="item in supplierOptions" :key="item.supplierId" :label="item.supplierName" :value="item.supplierId" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="设备类型" prop="deviceType">
                  <el-select
                    v-model="queryParams.deviceType"
                    placeholder="请选择设备类型"
                    clearable
                    filterable
                    allow-create
                    default-first-option
                    style="width: 100%"
                  >
                    <el-option v-for="item in deviceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="机房位置" prop="idcLocation">
                  <el-input v-model="queryParams.idcLocation" placeholder="请输入机房位置" clearable @keyup.enter="handleQuery" />
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item label="关键字" prop="keyword">
                  <el-input v-model="queryParams.keyword" placeholder="设备名称或 SN" clearable @keyup.enter="handleQuery" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="录入时间">
                  <el-date-picker
                    v-model="dateRange"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                    :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="12">
              <el-col :span="4">
                <el-form-item label-width="0" class="query-actions">
                  <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                  <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:physicalResource:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:physicalResource:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['supply:physicalResource:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-dropdown>
              <el-button plain type="warning">
                更多
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Top" @click="handleImport">导入数据</el-dropdown-item>
                  <el-dropdown-item icon="Download" @click="importTemplate">下载模板</el-dropdown-item>
                  <el-dropdown-item icon="Download" @click="handleExport">导出数据</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="resourceList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="资源编号" prop="resourceCode" min-width="150" show-overflow-tooltip />
        <el-table-column label="所属供应商" prop="supplierName" min-width="150" show-overflow-tooltip />
        <el-table-column label="设备名称" prop="deviceName" min-width="160" show-overflow-tooltip />
        <el-table-column label="设备类型" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(deviceTypeOptions, scope.row.deviceType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设备型号" prop="deviceModel" min-width="140" show-overflow-tooltip />
        <el-table-column label="SN" prop="serialNumber" min-width="160" show-overflow-tooltip />
        <el-table-column label="资产标签" prop="assetTag" min-width="140" show-overflow-tooltip />
        <el-table-column label="资源状态" min-width="120">
          <template #default="scope">
            <span>{{ getOptionLabel(resourceStatusOptions, scope.row.resourceStatus) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="机柜位置" prop="rackLocation" min-width="120" show-overflow-tooltip />
        <el-table-column label="机房位置" prop="idcLocation" min-width="140" show-overflow-tooltip />
        <el-table-column label="管理IP" prop="manageIp" min-width="130" show-overflow-tooltip />
        <el-table-column label="采购日期" prop="purchaseDate" min-width="120" show-overflow-tooltip />
        <el-table-column label="到期日期" prop="expireDate" min-width="120" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="createTime" min-width="160">
          <template #default="scope">
            <span>{{ proxy?.parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['supply:physicalResource:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['supply:physicalResource:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="860px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="资源编号" prop="resourceCode" :required="isFieldRequired('resourceCode')">
              <el-input v-model="form.resourceCode" placeholder="请输入资源编号" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属供应商" prop="supplierId" :required="isFieldRequired('supplierId')">
              <el-select v-model="form.supplierId" placeholder="请选择供应商" filterable style="width: 100%">
                <el-option v-for="item in supplierOptions" :key="item.supplierId" :label="item.supplierName" :value="item.supplierId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" prop="deviceName" :required="isFieldRequired('deviceName')">
              <el-input v-model="form.deviceName" placeholder="请输入设备名称" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="deviceType" :required="isFieldRequired('deviceType')">
              <el-select
                v-model="form.deviceType"
                placeholder="请选择设备类型"
                clearable
                filterable
                allow-create
                default-first-option
                style="width: 100%"
              >
                <el-option v-for="item in deviceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备型号" prop="deviceModel">
              <el-input v-model="form.deviceModel" placeholder="请输入设备型号" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="序列号" prop="serialNumber" :required="isFieldRequired('serialNumber')">
              <el-input v-model="form.serialNumber" placeholder="请输入序列号" maxlength="128" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资产标签" prop="assetTag">
              <el-input v-model="form.assetTag" placeholder="请输入资产标签" maxlength="128" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源状态" prop="resourceStatus" :required="isFieldRequired('resourceStatus')">
              <el-select v-model="form.resourceStatus" placeholder="请选择资源状态" clearable style="width: 100%">
                <el-option v-for="item in resourceStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="机柜位置" prop="rackLocation">
              <el-input v-model="form.rackLocation" placeholder="请输入机柜位置" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="机房位置" prop="idcLocation">
              <el-input v-model="form.idcLocation" placeholder="请输入机房位置" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="管理IP" prop="manageIp">
              <el-input v-model="form.manageIp" placeholder="请输入管理IP" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购日期" prop="purchaseDate">
              <el-date-picker v-model="form.purchaseDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择采购日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期日期" prop="expireDate">
              <el-date-picker v-model="form.expireDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择到期日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="规格JSON" prop="specPayload">
              <el-input v-model="form.specPayload" type="textarea" :rows="5" placeholder="请输入 JSON 规格信息" />
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

    <el-dialog v-model="upload.open" :title="upload.title" width="420px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :data="{ updateSupport: upload.updateSupport }"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="text-center el-upload__tip">
            <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" :true-label="1" :false-label="0" />是否更新已存在资源</div>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PhysicalResource" lang="ts">
import { globalHeaders } from '@/utils/request';
import { resolveData, resolveRows, resolveTotal, stringifyJsonValue } from '@/api/supply/common';
import {
  addPhysicalResource,
  delPhysicalResource,
  getPhysicalResource,
  listPhysicalResource,
  updatePhysicalResource
} from '@/api/supply/physicalResource';
import { PhysicalResourceForm, PhysicalResourceQuery, PhysicalResourceVO } from '@/api/supply/physicalResource/types';
import { listSupplierOptions } from '@/api/supply/supplier';
import { SupplierOption } from '@/api/supply/supplier/types';
import { createSupplyValidation } from '@/views/supply/common/validationEngine';
import { useUserStore } from '@/store/modules/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { supply_device_type } = toRefs<any>(proxy?.useDict('supply_device_type'));
const userStore = useUserStore();

const loading = ref(false);
const submitting = ref(false);
const showSearch = ref(true);
const resourceList = ref<PhysicalResourceVO[]>([]);
const supplierOptions = ref<SupplierOption[]>([]);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const upload = reactive<ImportOption>({
  open: false,
  title: '物理资源导入',
  isUploading: false,
  updateSupport: 0,
  headers: globalHeaders(),
  url: import.meta.env.VITE_APP_BASE_API + '/supply/physical-resources/importData'
});

const queryFormRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData = (): PhysicalResourceForm & { specPayload: string } => ({
  resourceId: undefined,
  resourceCode: '',
  supplierId: userStore.supplierId,
  deviceName: '',
  deviceType: '',
  deviceModel: '',
  serialNumber: '',
  assetTag: '',
  resourceStatus: 'inventory',
  rackLocation: '',
  idcLocation: '',
  manageIp: '',
  purchaseDate: '',
  expireDate: '',
  specPayload: '',
  remark: ''
});

const form = ref<PhysicalResourceForm & { specPayload: string }>(initFormData());

const queryParams = reactive<PhysicalResourceQuery>({
  pageNum: 1,
  pageSize: 10,
  supplierId: undefined,
  deviceType: '',
  idcLocation: '',
  keyword: ''
});

const hasBoundSupplier = computed(() => !!userStore.supplierId);
const validationScene = computed(() => (form.value.resourceId !== undefined ? 'edit' : 'add'));
const { rules, isFieldRequired, normalizePayload } = createSupplyValidation(
  'physicalResource',
  validationScene,
  form,
  computed(() => ({
    hasBoundSupplier: hasBoundSupplier.value
  }))
);

const deviceTypeOptions = computed<DictDataOption[]>(() => supply_device_type.value || []);

const resourceStatusOptions: DictDataOption[] = [
  { label: '在库', value: 'inventory' },
  { label: '运行中', value: 'running' },
  { label: '停用', value: 'disabled' },
  { label: '报废', value: 'scrapped' }
];

const getOptionLabel = (options: DictDataOption[], value?: string) => {
  if (!value) return '-';
  return options.find((item) => item.value === value)?.label || value;
};

const normalizeSupplierOptions = (rows: any[]): SupplierOption[] => {
  return rows.map((item) => ({
    supplierId: item.supplierId ?? item.id ?? item.value,
    supplierName: item.supplierName ?? item.label ?? item.name ?? '-'
  }));
};

const resetForm = () => {
  form.value = initFormData();
  formRef.value?.resetFields();
};

const getSupplierOptionList = async () => {
  const response = await listSupplierOptions();
  supplierOptions.value = normalizeSupplierOptions(resolveRows(response));
};

const getList = async () => {
  loading.value = true;
  try {
    const response = await listPhysicalResource(proxy?.addDateRange(queryParams, dateRange.value, 'CreateTime'));
    const rows = resolveRows<PhysicalResourceVO>(response);
    resourceList.value = rows;
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
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  getList();
};

const handleSelectionChange = (selection: PhysicalResourceVO[]) => {
  ids.value = selection.map((item) => item.resourceId);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  resetForm();
  dialog.visible = true;
  dialog.title = '新增物理资源';
};

const handleUpdate = async (row?: PhysicalResourceVO) => {
  const resourceId = row?.resourceId || ids.value[0];
  if (!resourceId) return;
  resetForm();
  const response = await getPhysicalResource(resourceId);
  const detail = resolveData<PhysicalResourceVO>(response);
  if (detail) {
    Object.assign(form.value, detail, {
      specPayload: stringifyJsonValue(detail.specPayload)
    });
  }
  dialog.visible = true;
  dialog.title = '修改物理资源';
};

const handleDelete = async (row?: PhysicalResourceVO) => {
  const resourceIds = row?.resourceId || ids.value.join(',');
  if (!resourceIds) return;
  await proxy?.$modal.confirm(`是否确认删除物理资源编号为“${resourceIds}”的数据项？`);
  await delPhysicalResource(resourceIds);
  if (resourceList.value.length === 1 && queryParams.pageNum > 1) {
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
      const payload = normalizePayload() as PhysicalResourceForm;
      if (payload.resourceId !== undefined) {
        await updatePhysicalResource(payload);
      } else {
        await addPhysicalResource(payload);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    } finally {
      submitting.value = false;
    }
  });
};

const handleImport = () => {
  upload.title = '物理资源导入';
  upload.open = true;
};

const handleExport = () => {
  proxy?.download(
    'supply/physical-resources/export',
    {
      ...queryParams
    },
    `physical_resources_${new Date().getTime()}.xlsx`
  );
};

const importTemplate = () => {
  proxy?.download('supply/physical-resources/importTemplate', {}, `physical_resource_template_${new Date().getTime()}.xlsx`);
};

const handleFileUploadProgress = () => {
  upload.isUploading = true;
};

const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow:auto;overflow-x:hidden;max-height:70vh;padding:10px 20px 0;'>" + response.msg + '</div>', '导入结果', {
    dangerouslyUseHTMLString: true
  });
  getList();
};

const submitFileForm = () => {
  uploadRef.value?.submit();
};

onMounted(async () => {
  await Promise.all([getSupplierOptionList(), getList()]);
});
</script>

<style scoped lang="scss">
.supplier-query-item {
  :deep(.el-form-item__label) {
    text-align: left;
    white-space: nowrap;
  }
}

.query-actions {
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
    justify-content: flex-start;
  }
}
</style>
