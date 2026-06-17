import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { toast } from '../components/Toast'

const ThemeCustomizer: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const modes = [
    {
      key: 'light' as const,
      label: '浅色模式',
      desc: '白色背景 + 清晰边框，适合白天使用',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ),
    },
    {
      key: 'dark' as const,
      label: '深色模式',
      desc: '深色背景 + 柔和光影，适合夜间使用',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ),
    },
  ]

  const tokens = [
    { label: '背景', var: '--bg', desc: '页面主背景' },
    { label: '表面', var: '--surface', desc: '卡片/面板背景' },
    { label: '前景', var: '--fg', desc: '主要文字' },
    { label: '次要文字', var: '--fg-muted', desc: '辅助说明文字' },
    { label: '边框', var: '--border', desc: '分隔线和边框' },
    { label: '强调色', var: '--accent', desc: '按钮和高亮' },
    { label: '强调色2', var: '--accent-2', desc: '渐变第二色' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">主题设置</h2>
        <p style={{ color: 'var(--fg-muted)' }}>切换浅色/深色模式，查看当前设计令牌</p>
      </div>

      {/* 模式切换 */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="th-section-header text-lg font-semibold">外观模式</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => {
                setTheme(mode.key)
                toast.success(`已切换到${mode.label}`)
              }}
              className="p-5 rounded-xl text-left transition-all"
              style={{
                background: theme === mode.key ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-hover)',
                border: `2px solid ${theme === mode.key ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span style={{ color: theme === mode.key ? 'var(--accent)' : 'var(--fg-muted)' }}>{mode.icon}</span>
                <span className="font-semibold text-base" style={{ color: 'var(--fg)' }}>{mode.label}</span>
                {theme === mode.key && (
                  <span className="th-badge-valid px-2 py-0.5 rounded-full text-xs font-medium ml-auto">当前</span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Token 预览 */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="th-section-header text-lg font-semibold">设计令牌</h3>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          当前主题使用的 CSS 变量，所有组件通过这些令牌保持视觉一致。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tokens.map((t) => (
            <div
              key={t.var}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: 'var(--surface-hover)' }}
            >
              <div
                className="w-10 h-10 rounded-lg shrink-0"
                style={{
                  background: `var(${t.var})`,
                  border: '1px solid var(--border)',
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{t.label}</div>
                <div className="text-xs font-mono truncate" style={{ color: 'var(--fg-faint)' }}>{t.var}</div>
              </div>
              <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 组件预览 */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="th-section-header text-lg font-semibold">组件预览</h3>

        {/* 按钮 */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>按钮样式</label>
          <div className="flex flex-wrap gap-3">
            <button className="th-btn-accent px-4 py-2 text-sm">主要按钮</button>
            <button className="th-btn-ghost px-4 py-2 text-sm">次要按钮</button>
            <button className="th-btn-soft px-4 py-2 text-sm">柔和按钮</button>
            <button className="th-btn-danger px-4 py-2 text-sm">危险按钮</button>
          </div>
        </div>

        {/* 输入框 */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>输入框</label>
          <input
            type="text"
            placeholder="这是一个输入框..."
            className="w-full th-input rounded-lg px-4 py-3 text-sm"
            readOnly
          />
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>标签/标记</label>
          <div className="flex flex-wrap gap-2">
            <span className="th-badge-valid px-2 py-1 rounded-full text-xs font-medium">有效</span>
            <span className="th-badge-invalid px-2 py-1 rounded-full text-xs font-medium">无效</span>
            <span className="th-tag px-2 py-1 text-xs">标签示例</span>
          </div>
        </div>

        {/* 渐变文字 */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>渐变文字</label>
          <div className="text-2xl font-bold gradient-text">ToolHub 渐变文字效果</div>
        </div>

        {/* 面板 */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>信息面板</label>
          <div className="space-y-2">
            <div className="th-panel-success p-3 text-sm">成功提示面板</div>
            <div className="th-panel-error p-3 text-sm">错误提示面板</div>
            <div className="th-panel-info p-3 text-sm" style={{ color: 'var(--accent)' }}>信息提示面板</div>
            <div className="th-panel-warning p-3 text-sm">警告提示面板</div>
          </div>
        </div>
      </div>

      {/* 说明 */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="th-section-header text-lg font-semibold">设计系统说明</h3>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--fg-secondary)' }}>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--accent)' }}>*</span>
            <span>灵感来源于 Lingo Showcase 的 token 化设计体系</span>
          </li>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--accent)' }}>*</span>
            <span>所有颜色通过 CSS 变量定义，支持一键切换浅色/深色</span>
          </li>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--accent)' }}>*</span>
            <span>组件使用语义化 CSS 类名（th-btn-accent、th-input 等）</span>
          </li>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--accent)' }}>*</span>
            <span>主题偏好自动保存到浏览器，下次访问自动恢复</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ThemeCustomizer
