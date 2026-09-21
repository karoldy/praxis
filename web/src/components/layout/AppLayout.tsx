import { NavLink, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { NotebookPen, GraduationCap, FolderOpen, LogOut, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/auth/auth-context';

interface NavItem {
  to: string;
  /** i18n 资源键（如 common.tab.notes） */
  labelKey: string;
  icon: LucideIcon;
}

const NAV: readonly NavItem[] = [
  { to: '/notes', labelKey: 'common.tab.notes', icon: NotebookPen },
  { to: '/exams', labelKey: 'common.tab.exams', icon: GraduationCap },
  { to: '/documents', labelKey: 'common.tab.documents', icon: FolderOpen },
];

const baseCls =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ' +
  'text-muted-foreground hover:bg-muted hover:text-foreground';

/** 桌面侧边栏 / 手机底部 tab 共用的导航项。 */
function NavItemLink({ item, nav }: { item: NavItem; nav: boolean }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        cn(baseCls, nav && 'flex-col py-2 text-xs', isActive && 'bg-primary/10 text-primary')
      }
    >
      <Icon className="size-5" aria-hidden />
      <span>{t(item.labelKey)}</span>
    </NavLink>
  );
}

/**
 * 响应式外壳（设计 §8.3）：顶部 AppBar + 桌面（md+）左侧边栏 / 手机底部 tab 栏。
 */
export default function AppLayout() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg font-bold text-on-primary">
            知
          </span>
          <span className="text-lg font-semibold">{t('common.brand')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {t('common.motto')}
          </span>
          <div className="flex items-center gap-2">
            <span className="max-w-40 truncate text-sm font-medium">{user?.name}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              title={t('auth.signOut')}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">{t('auth.signOut')}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 桌面 / iPad 侧边栏 */}
        <aside className="hidden w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r p-3 md:flex">
          {NAV.map((item) => (
            <NavItemLink key={item.to} item={item} nav={false} />
          ))}
        </aside>

        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* 手机底部 tab */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t bg-surface p-1 md:hidden">
        {NAV.map((item) => (
          <NavItemLink key={item.to} item={item} nav />
        ))}
      </nav>
    </div>
  );
}