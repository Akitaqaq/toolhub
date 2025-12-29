import React, { useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

const Layout: React.FC = () => {
  const location = useLocation()

  // 页面加载时应用保存的主题
  useEffect(() => {
    const saved = localStorage.getItem('toolhub-theme')
    if (saved) {
      try {
        const colors = JSON.parse(saved)
        const root = document.documentElement
        // 渐变色
        root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${colors.primaryStart} 0%, ${colors.primaryEnd} 100%)`)
        root.style.setProperty('--gradient-secondary', `linear-gradient(135deg, ${colors.secondaryStart} 0%, ${colors.secondaryEnd} 100%)`)
        root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${colors.accentStart} 0%, ${colors.accentEnd} 100%)`)
        // 背景色
        root.style.setProperty('--bg-color-1', colors.bgColor1)
        root.style.setProperty('--bg-color-2', colors.bgColor2)
        root.style.setProperty('--bg-color-3', colors.bgColor3)
        // 应用到body
        document.body.style.background = `linear-gradient(135deg, ${colors.bgColor1} 0%, ${colors.bgColor2} 50%, ${colors.bgColor3} 100%)`
      } catch (e) {
        console.error('Failed to load theme:', e)
      }
    }
  }, [])

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/json', label: 'JSON格式化' },
    { path: '/jsonpath', label: 'JSONPath查询' },
    { path: '/timestamp', label: '时间戳转换' },
    { path: '/encoder', label: '编码解码' },
    { path: '/aes', label: 'AES密钥' },
    { path: '/md5', label: 'MD5加密' },
    { path: '/theme', label: '主题设置' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 动态渐变背景 - 使用CSS变量 */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 animate-pulse" style={{
          animationDuration: '8s',
          background: 'linear-gradient(135deg, var(--bg-color-1, #0f172a) 0%, var(--bg-color-2, #1e293b) 50%, var(--bg-color-3, #334155) 100%)'
        }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh opacity-20"></div>
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-10 transform rotate-45" style={{
          background: 'var(--gradient-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%))'
        }}></div>
      </div>

      {/* 主容器 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 头部导航 */}
        <header className="glass sticky top-0 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold neon-text gradient-text">
                ToolHub
              </Link>

              <nav className="hidden md:flex space-x-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* 移动端导航 */}
        <div className="md:hidden glass border-b border-white/10">
          <div className="container mx-auto px-4 py-2 flex overflow-x-auto space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 主要内容区域 */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Outlet />
        </main>

        {/* 页脚 */}
        <footer className="glass border-t border-white/10 mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-slate-400 text-sm">
            <p>© 2025 ToolHub. 多功能在线工具集合</p>
            <p className="mt-2 text-xs opacity-70">数据本地处理 · 隐私安全 · 免费使用</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout