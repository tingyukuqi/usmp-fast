<template>
  <div class="p-2">
    <el-card shadow="hover" class="mb-[10px]">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-lg font-semibold">{{ currentPlatform.platformName || '云租户管理' }}</div>
          <div class="mt-2 text-sm text-[var(--el-text-color-secondary)]">
            平台编码：{{ currentPlatform.platformCode || '-' }}
            <span class="mx-2">|</span>
            平台类型：{{ currentPlatform.platformType || '-' }}
            <span class="mx-2">|</span>
            供应商代码：{{ currentPlatform.providerCode || '-' }}
            <span class="mx-2">|</span>
            资源池：{{ currentPlatform.resourcePoolCode || '-' }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button icon="Back" @click="handleBack">返回</el-button>
          <el-button v-if="activeTab === 'snapshot'" type="primary" icon="Refresh" :loading="refreshing" @click="handleRefreshSnapshot">
            刷新云租户快照
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="云租户快照" name="snapshot">
          <CloudTenantSnapshotTab ref="snapshotTabRef" :platform-id="platformId" />
        </el-tab-pane>
        <el-tab-pane label="云租户绑定" name="binding">
          <OrgTenantBindingTab :platform-id="platformId" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup name="CloudTenantManage" lang="ts">
import { resolveData } from '@/api/supply/common';
import { refreshCloudTenantSnapshot } from '@/api/supply/cloudTenant';
import { getCloudPlatform } from '@/api/supply/cloudPlatform';
import { CloudPlatformVO } from '@/api/supply/cloudPlatform/types';
import CloudTenantSnapshotTab from './components/CloudTenantSnapshotTab.vue';
import OrgTenantBindingTab from './components/OrgTenantBindingTab.vue';

interface SnapshotTabExpose {
  reload: () => Promise<void>;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const route = useRoute();
const router = useRouter();

const activeTab = ref('snapshot');
const refreshing = ref(false);
const currentPlatform = ref<CloudPlatformVO>({
  platformId: '',
  platformCode: '',
  platformName: ''
});
const snapshotTabRef = ref<SnapshotTabExpose | null>(null);

const platformId = computed(() => route.params.platformId as string);

const loadPlatform = async () => {
  if (!platformId.value) {
    proxy?.$modal.msgError('缺少云平台参数');
    handleBack();
    return;
  }
  const response = await getCloudPlatform(platformId.value);
  const detail = resolveData<CloudPlatformVO>(response);
  if (detail) {
    currentPlatform.value = detail;
  }
};

const handleBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push('/index');
};

const handleRefreshSnapshot = async () => {
  if (!platformId.value) return;
  await proxy?.$modal.confirm(`是否确认刷新平台“${currentPlatform.value.platformName || platformId.value}”的云租户快照？`);
  refreshing.value = true;
  try {
    await refreshCloudTenantSnapshot(platformId.value);
    proxy?.$modal.msgSuccess('刷新任务已提交');
    await snapshotTabRef.value?.reload();
  } finally {
    refreshing.value = false;
  }
};

onMounted(() => {
  loadPlatform();
});
</script>
