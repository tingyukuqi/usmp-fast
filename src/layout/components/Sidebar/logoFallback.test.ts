import { describe, expect, it, vi } from 'vitest';
import { EMPTY_SIDEBAR_LOGO, getSidebarLogoStyle, loadSidebarLogo } from './logoFallback';

describe('logoFallback', () => {
  it('在没有 logo 模块时返回透明占位图', async () => {
    await expect(loadSidebarLogo({})).resolves.toEqual({
      src: EMPTY_SIDEBAR_LOGO,
      hasLogo: false
    });
  });

  it('在 logo 模块存在时返回实际地址', async () => {
    const loader = vi.fn().mockResolvedValue('/assets/logo.png');

    await expect(loadSidebarLogo({ logo: loader })).resolves.toEqual({
      src: '/assets/logo.png',
      hasLogo: true
    });
  });

  it('在 logo 模块加载失败时静默回退', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('missing logo'));

    await expect(loadSidebarLogo({ logo: loader })).resolves.toEqual({
      src: EMPTY_SIDEBAR_LOGO,
      hasLogo: false
    });
  });

  it('在 logo 缺失时将尺寸压缩为 1px', () => {
    expect(getSidebarLogoStyle(false, false)).toEqual({
      width: '1px',
      height: '1px',
      marginLeft: '0px',
      marginRight: '0px',
      opacity: '0'
    });
  });

  it('在折叠状态下保留真实 logo 的右边距规则', () => {
    expect(getSidebarLogoStyle(true, true)).toEqual({
      width: '32px',
      height: '32px',
      marginLeft: '12px',
      marginRight: '0px',
      opacity: '1'
    });
  });
});
