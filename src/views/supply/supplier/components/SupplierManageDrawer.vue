<template>
  <el-drawer v-model="visible" :title="drawerTitle" size="60%" append-to-body destroy-on-close>
    <div class="mb-[16px] rounded border border-[var(--el-border-color)] p-4">
      <div class="text-base font-medium">{{ supplier?.supplierName || '-' }}</div>
      <div class="mt-[8px] text-sm text-[var(--el-text-color-secondary)]">
        编码：{{ supplier?.supplierCode || '-' }} / 联系人：{{ supplier?.contactName || '-' }} / 联系电话：{{ supplier?.contactPhone || '-' }}
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="平台账号" name="account">
        <SupplierPlatformAccountPanel v-if="loadedTabs.account" :supplier-id="supplier?.supplierId" @refresh-stats="emit('refreshStats')" />
      </el-tab-pane>
      <el-tab-pane label="绑定用户" name="user">
        <SupplierUserBindingPanel v-if="loadedTabs.user" :supplier-id="supplier?.supplierId" :users="boundUsers" @updated="handleUsersUpdated" />
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup name="SupplierManageDrawer" lang="ts">
import { SupplierBoundUser, SupplierVO } from '@/api/supply/supplier/types';
import SupplierPlatformAccountPanel from './SupplierPlatformAccountPanel.vue';
import SupplierUserBindingPanel from './SupplierUserBindingPanel.vue';

interface Props {
  modelValue: boolean;
  supplier?: SupplierVO | null;
  users?: SupplierBoundUser[];
}

const props = withDefaults(defineProps<Props>(), {
  supplier: null,
  users: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  refreshStats: [];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const drawerTitle = computed(() => `${props.supplier?.supplierName || '供应商'}管理`);
const activeTab = ref<'account' | 'user'>('account');
const loadedTabs = reactive({
  account: false,
  user: false
});
const boundUsers = ref<SupplierBoundUser[]>([]);

const handleUsersUpdated = (users: SupplierBoundUser[]) => {
  boundUsers.value = users;
};

watch(
  () => props.users,
  (value) => {
    boundUsers.value = Array.isArray(value) ? value : [];
  },
  { immediate: true, deep: true }
);

watch(
  () => visible.value,
  (opened) => {
    if (opened) {
      loadedTabs.account = true;
      return;
    }
    activeTab.value = 'account';
    loadedTabs.account = false;
    loadedTabs.user = false;
  }
);

watch(
  () => activeTab.value,
  (tab) => {
    loadedTabs[tab] = true;
  }
);
</script>
