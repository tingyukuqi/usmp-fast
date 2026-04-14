<template>
  <div>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="0">
      <el-form-item prop="userIds" :required="isFieldRequired('userIds')" class="mb-0">
        <div class="w-full">
          <div class="mb-[12px] flex justify-between">
            <div class="text-sm text-[var(--el-text-color-secondary)]">当前绑定用户</div>
            <el-button type="primary" plain icon="User" :disabled="!supplierId || submitting" @click="handleOpenSelector">选择用户</el-button>
          </div>

          <el-empty v-if="bindingList.length === 0" description="暂无绑定用户" />

          <el-table v-else :data="bindingList" border>
            <el-table-column label="用户名称" prop="userName" min-width="120" show-overflow-tooltip />
            <el-table-column label="用户昵称" prop="nickName" min-width="120" show-overflow-tooltip />
            <el-table-column label="手机号" prop="phonenumber" min-width="120" />
            <el-table-column label="邮箱" prop="email" min-width="180" show-overflow-tooltip />
            <el-table-column label="状态" prop="status" width="90" align="center">
              <template #default="scope">
                <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
              </template>
            </el-table-column>
            <el-table-column label="绑定时间" prop="createTime" min-width="160" show-overflow-tooltip />
            <el-table-column label="操作" width="90" align="center" fixed="right">
              <template #default="scope">
                <el-button link type="danger" icon="Delete" :disabled="submitting" @click="handleRemoveUser(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-form>

    <UserSelect ref="userSelectRef" :multiple="true" :model-value="selectedUserRows" :data="selectedUserIds" :list-method="listBindableUsers" @confirm-call-back="handleConfirmUsers" />
  </div>
</template>

<script setup name="SupplierUserBindingPanel" lang="ts">
import { listBindableSupplierUsers, listSupplierUsers, updateSupplierUsers } from '@/api/supply/supplier';
import { SupplierBoundUser, SupplierUserBindingVO } from '@/api/supply/supplier/types';
import { UserQuery, UserVO } from '@/api/system/user/types';
import { createSupplyValidation } from '@/views/supply/common/validationEngine';
import { getBoundUserIds, getRemainingUserIds, openUserSelectorWithSelection, toBoundUsers } from './supplierUserBinding';
import { normalizeSupplierUserBindings, toBoundUsersFromBindings } from './supplierUserList';

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
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const formRef = ref<ElFormInstance>();
const userSelectRef = ref<InstanceType<typeof UserSelect>>();
const userList = ref<SupplierBoundUser[]>([]);
const bindingList = ref<SupplierUserBindingVO[]>([]);
const selectedUserRows = ref<UserVO[]>([]);
const selectedUserIds = ref<Array<string | number>>([]);
const submitting = ref(false);
const form = ref<{ userIds: Array<string | number> }>({
  userIds: []
});
const { rules, isFieldRequired } = createSupplyValidation('supplierUserBinding', 'submit', form);

const syncUsers = (users: SupplierBoundUser[]) => {
  userList.value = users;
  selectedUserRows.value = users.map(
    (item) =>
      ({
        userId: item.userId,
        userName: item.userName || '',
        nickName: item.nickName || String(item.userId)
      }) as UserVO
  );
  selectedUserIds.value = getBoundUserIds(users);
  form.value.userIds = [...selectedUserIds.value];
};

const listBindableUsers = (query: UserQuery) => {
  if (!props.supplierId) {
    return Promise.resolve({ rows: [], total: 0 });
  }
  return listBindableSupplierUsers(props.supplierId, query);
};

const loadBindingList = async (fallbackUsers: UserVO[] = []) => {
  if (!props.supplierId) {
    bindingList.value = [];
    const users = toBoundUsers(fallbackUsers);
    syncUsers(users);
    return users;
  }
  const resp = await listSupplierUsers(props.supplierId);
  const rows = normalizeSupplierUserBindings(resp);
  bindingList.value = rows;
  const users = rows.length > 0 ? toBoundUsersFromBindings(rows) : toBoundUsers(fallbackUsers);
  syncUsers(users);
  return users;
};

const loadLatestBoundUsers = async (fallbackUsers: UserVO[] = []) => {
  return loadBindingList(fallbackUsers);
};

const handleOpenSelector = async () => {
  await openUserSelectorWithSelection(
    userList.value,
    (ids) => {
      selectedUserIds.value = ids;
      form.value.userIds = [...ids];
    },
    () => userSelectRef.value?.open(),
    nextTick
  );
};

const handleConfirmUsers = async (users: UserVO[]) => {
  if (!props.supplierId) return;
  form.value.userIds = users.map((item) => item.userId);
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await updateSupplierUsers(props.supplierId, {
        userIds: form.value.userIds
      });
      const latestUsers = await loadLatestBoundUsers(users);
      proxy?.$modal.msgSuccess('绑定成功');
      emit('updated', latestUsers);
    } finally {
      submitting.value = false;
    }
  });
};

const handleRemoveUser = async (row: SupplierUserBindingVO) => {
  if (!props.supplierId) return;
  const remainingUserIds = getRemainingUserIds(userList.value, row.userId);
  await proxy?.$modal.confirm(`是否确认解除用户“${row.nickName || row.userName || row.userId}”的绑定关系？`);
  submitting.value = true;
  try {
    await updateSupplierUsers(props.supplierId, {
      userIds: remainingUserIds
    });
    const latestUsers = await loadLatestBoundUsers();
    proxy?.$modal.msgSuccess('删除成功');
    emit('updated', latestUsers);
  } finally {
    submitting.value = false;
  }
};

watch(
  () => props.users,
  (value) => {
    if (bindingList.value.length === 0) {
      syncUsers(toBoundUsers(value));
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.supplierId,
  (value) => {
    if (!value) {
      bindingList.value = [];
      syncUsers([]);
      return;
    }
    loadBindingList();
  },
  { immediate: true }
);
</script>
