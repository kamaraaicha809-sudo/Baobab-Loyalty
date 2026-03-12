"use client";

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/common/Icons';
import config from '@/config';
import Logo from '@/components/common/Logo';
import { isDemoMode } from '@/src/lib/demo';
import { User } from '@/types';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
}

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

const Sidebar = ({ user, onLogout }: SidebarProps) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Vérifier si l'utilisateur est admin (ou en mode démo)
  const isAdmin = isDemoMode || user?.role === "admin";

  // Navigation principale
  const mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Icons.Home />, href: '/dashboard' },
    { id: 'configuration', label: 'Configuration', icon: <Icons.Settings />, href: '/dashboard/configuration' },
    { id: 'templates', label: 'Templates', icon: <Icons.Template />, href: '/dashboard/templates' },
    { id: 'segments', label: 'Segments', icon: <Icons.Users />, href: '/dashboard/segments' },
  ];

  // Navigation admin (visible uniquement pour les admins)
  const adminNavItems: NavItem[] = [
    { id: 'admin', label: 'Vue d\'ensemble', icon: <Icons.Home />, href: '/admin' },
    { id: 'admin-ia', label: 'Configuration IA', icon: <Icons.Sparkles />, href: '/admin/ia' },
  ];

  const isActive = (href: string): boolean => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-40">
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center p-1.5">
              <Logo size={20} variant="white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{config.appName}</span>
          </Link>

          {/* Navigation principale */}
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Section Admin */}
          {isAdmin && (
            <div className="mt-8">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Administration
              </p>
              <nav className="space-y-1">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* User Profile - Desktop */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-slate-50">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {isAdmin ? 'Administrateur' : 'Utilisateur'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Icons.Logout />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header - Hamburger à GAUCHE */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center z-50">
        {/* Hamburger à gauche */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>

        {/* Logo centré */}
        <Link href="/" className="flex items-center gap-2 flex-1 justify-center">
          <div className="w-7 h-7 rounded gradient-primary flex items-center justify-center p-1">
            <Logo size={18} variant="white" />
          </div>
          <span className="font-bold text-lg text-slate-900">{config.appName}</span>
        </Link>

        {/* Espace pour équilibrer */}
        <div className="w-10"></div>
      </header>

      {/* Mobile Menu Overlay - Slide depuis la gauche */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20"
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        {/* Sidebar mobile */}
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 flex-1 overflow-y-auto h-full flex flex-col">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 mb-8"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center p-1.5">
                <Logo size={20} variant="white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">{config.appName}</span>
            </Link>

            {/* Navigation principale */}
            <nav className="space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Section Admin - Mobile */}
            {isAdmin && (
              <div className="mt-8">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Administration
                </p>
                <nav className="space-y-1">
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* User Profile - Mobile */}
            <div className="mt-auto pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-slate-50">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {isAdmin ? 'Administrateur' : 'Utilisateur'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <Icons.Logout />
                Déconnexion
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
