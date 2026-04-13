<template>
  <div
    class="sidebar-logo-container"
    :class="{ collapse: collapse }"
  >
    <transition :enter-active-class="proxy?.animate.logoAnimate.enter" mode="out-in">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img :src="logoSrc" class="sidebar-logo" :style="logoStyle" @error="handleLogoError" />
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img :src="logoSrc" class="sidebar-logo" :style="logoStyle" @error="handleLogoError" />
        <h1 class="sidebar-title">
          {{ title }}
        </h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts">
import variables from '@/assets/styles/variables.module.scss';
import { EMPTY_SIDEBAR_LOGO, getSidebarLogoStyle, loadSidebarLogo } from './logoFallback';
import { useSettingsStore } from '@/store/modules/settings';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { NavTypeEnum } from '@/enums/NavTypeEnum';

const props = defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
});

const title = import.meta.env.VITE_APP_LOGO_TITLE;
const settingsStore = useSettingsStore();
const sideTheme = computed(() => settingsStore.sideTheme);
const logoSrc = ref(EMPTY_SIDEBAR_LOGO);
const hasLogo = ref(false);
const logoModules = import.meta.glob('../../../assets/logo/logo.png', { import: 'default' });

const logoStyle = computed(() => getSidebarLogoStyle(hasLogo.value, props.collapse));

// 获取Logo背景色
const getLogoBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)'
  }
  if (settingsStore.navType == NavTypeEnum.TOP) {
    return variables.menuLightBackground
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBackground
})

// 获取Logo文字颜色
const getLogoTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-text)'
  }
  if (settingsStore.navType == NavTypeEnum.TOP) {
    return variables.logoLightTitleColor
  }
  return sideTheme.value === 'theme-dark' ? variables.logoTitleColor : variables.logoLightTitleColor
})

const handleLogoError = () => {
  hasLogo.value = false;
  logoSrc.value = EMPTY_SIDEBAR_LOGO;
};

onMounted(async () => {
  const result = await loadSidebarLogo(logoModules);
  hasLogo.value = result.hasLogo;
  logoSrc.value = result.src;
});
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  height: 50px;
  line-height: 50px;
  background: v-bind(getLogoBackground);
  text-align: left;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
      margin-left: 12px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: v-bind(getLogoTextColor);
      font-weight: 700;
      line-height: 50px;
      font-size: 16px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
      padding-left: 20px;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
