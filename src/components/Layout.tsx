import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const Layout: React.FC = () => {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/json', label: 'JSON' },
    { path: '/jsonpath', label: 'JSONPath' },
    { path: '/timestamp', label: '时间戳' },
    { path: '/encoder', label: '编码解码' },
    { path: '/aes', label: 'AES密钥' },
    { path: '/md5', label: 'MD5' },
    { path: '/sql', label: 'SQL' },
    { path: '/cron', label: 'Cron' },
    { path: '/theme', label: '主题' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Navigation */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'saturate(180%) blur(14px)',
          borderBottom: '1px solid var(--nav-border)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center h-16 gap-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-[17px] tracking-tight shrink-0" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display)' }}>
            <span
              className="w-7 h-7 rounded-lg"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
            />
            ToolHub
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  color: location.pathname === item.path ? 'var(--fg)' : 'var(--fg-muted)',
                  fontWeight: location.pathname === item.path ? 500 : 400,
                  background: location.pathname === item.path ? 'var(--surface-active)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.color = 'var(--fg)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.color = 'var(--fg-muted)'
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all"
            style={{
              color: 'var(--fg-muted)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
            title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              color: 'var(--fg-muted)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileMenuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden px-4 pb-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="flex flex-wrap gap-1.5 pt-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    color: location.pathname === item.path ? 'var(--fg)' : 'var(--fg-muted)',
                    fontWeight: location.pathname === item.path ? 500 : 400,
                    background: location.pathname === item.path ? 'var(--surface-active)' : 'transparent',
                    border: '1px solid ' + (location.pathname === item.path ? 'var(--border)' : 'transparent'),
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="w-full max-w-[1200px] mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2.5">
              <span
                className="w-5 h-5 rounded-md"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
              />
              <span style={{ fontWeight: 600, color: 'var(--fg)' }}>ToolHub</span>
              <span className="hidden md:inline" style={{ color: 'var(--fg-faint)' }}>|</span>
              <span className="hidden md:inline">多功能在线工具集合</span>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--fg-faint)' }}>
              <span>数据本地处理</span>
              <span>隐私安全</span>
              <span>免费使用</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
