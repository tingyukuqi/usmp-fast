<template>
  <div>
    <div class="mb-[12px] flex justify-between">
      <div class="text-sm text-[var(--el-text-color-secondary)]">当前绑定用户</div>
      <el-button type="primary" plain icon="User" :disabled="!supplierId || submitting" @click="handleOpenSelector">选择用户</el-button>
    </div>

    <el-empty v-if="userList.length === 0" description="暂无绑定用户" />

    <div v-else class="rounded border border-[var(--el-border-color)] p-3">
      <el-tag v-for="item in userList" :key="item.userId" class="mb-2 mr-2">
        {{ item.nickName || item.userName || item.userId }}
      </el-tag>
    </div>

    <UserSelect ref="userSelectRef" :multiple="true" :data="selectedUserIds" @confirm-call-back="handleConfirmUsers" />
  </div>
</template>

<script setup name="SupplierUserBindingPanel" lang="ts">
import { updateSupplierUsers } from '@/api/supply/supplier';
import { SupplierBoundUser } from '@/api/supply/supplier/types';
import { UserVO } from '@/api/system/user/types';

interface Props {
  supplierId?: string | number;
  users?: SupplierBoundUser[];
}

const props = withDefaults(defineProps<Props>(), {
  users: () => []
});

const emit = defineEmits<{
  updated: [users: SupplierBoundUser[]];
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const userSelectRef = ref<InstanceType<typeof UserSelect>>();
const userList = ref<SupplierBoundUser[]>([]);
const selectedUserIds = ref<Array<string | number>>([]);
const submitting = ref(false);

const mapUsers = (list: UserVO[] | SupplierBoundUser[]): SupplierBoundUser[] => {
  return list.map((item: any) => ({
    userId: item.userId,
    userName: item.userName,
    nickName: item.nickName
  }));
};

const handleOpenSelector = () => {
  selectedUserIds.value = userList.value.map((item) => item.userId);
  userSelectRef.value?.open();
};

const handleConfirmUsers = async (users: UserVO[]) => {
  if (!props.supplierId) return;
  submitting.value = true;
  try {
    await updateSupplierUsers(props.supplierId, {
      userIds: users.map((item) => item.userId)
    });
    userList.value = mapUsers(users);
    selectedUserIds.value = userList.value.map((item) => item.userId);
    proxy?.$modal.msgSuccess('绑定成功');
    emit('updated', userList.value);
  } finally {
    submitting.value = false;
  }
};

watch(
  () => props.users,
  (value) => {
    userList.value = mapUsers(value);
    selectedUserIds.value = userList.value.map((item) => item.userId);
  },
  { immediate: true, deep: true }
);
</script>
