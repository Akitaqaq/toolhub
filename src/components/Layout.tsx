import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

const Layout: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/json', label: 'JSON格式化' },
    { path: '/timestamp', label: '时间戳转换' },
    { path: '/encoder', label: '编码解码' },
    { path: '/aes', label: 'AES密钥' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 动态渐变背景 */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh opacity-20"></div>
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-primary opacity-10 transform rotate-45"></div>
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