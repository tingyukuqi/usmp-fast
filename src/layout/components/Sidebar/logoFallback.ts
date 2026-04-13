export const EMPTY_SIDEBAR_LOGO = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';

type LogoModuleLoader = () => Promise<unknown>;

export interface SidebarLogoLoadResult {
  src: string;
  hasLogo: boolean;
}

export interface SidebarLogoStyle {
  width: string;
  height: string;
  marginLeft: string;
  marginRight: string;
  opacity: string;
}

export async function loadSidebarLogo(loaders: Record<string, LogoModuleLoader>): Promise<SidebarLogoLoadResult> {
  const loader = Object.values(loaders)[0];
  if (!loader) {
    return {
      src: EMPTY_SIDEBAR_LOGO,
      hasLogo: false
    };
  }

  try {
    const module = await loader();
    if (typeof module === 'string' && module) {
      return {
        src: module,
        hasLogo: true
      };
    }
  } catch {
    // 静默回退，避免因为 logo 缺失影响侧栏渲染
  }

  return {
    src: EMPTY_SIDEBAR_LOGO,
    hasLogo: false
  };
}

export function getSidebarLogoStyle(hasLogo: boolean, collapse: boolean): SidebarLogoStyle {
  if (!hasLogo) {
    return {
      width: '1px',
      height: '1px',
      marginLeft: '0px',
      marginRight: '0px',
      opacity: '0'
    };
  }

  return {
    width: '32px',
    height: '32px',
    marginLeft: '12px',
    marginRight: collapse ? '0px' : '12px',
    opacity: '1'
  };
}
