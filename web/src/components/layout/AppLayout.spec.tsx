import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import '@/i18n';
import AppLayout from './AppLayout';

describe('AppLayout', () => {
  it('渲染品牌与三大中心导航项', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<div>outlet-content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('知行')).toBeInTheDocument();

    // jsdom 不应用 Tailwind 断点类：桌面侧边栏 + 手机底栏都会渲染，故用 getAllByText
    for (const label of ['学习中心', '考试中心', '文档中心']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });
});