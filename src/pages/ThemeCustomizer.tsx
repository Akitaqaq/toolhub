import React, { useState, useEffect } from 'react'
import { toast } from '../components/Toast'

interface ThemeColors {
  primaryStart: string
  primaryEnd: string
  secondaryStart: string
  secondaryEnd: string
  accentStart: string
  accentEnd: string
  bgColor1: string
  bgColor2: string
  bgColor3: string
}

const DEFAULT_COLORS: ThemeColors = {
  primaryStart: '#667eea',
  primaryEnd: '#764ba2',
  secondaryStart: '#f093fb',
  secondaryEnd: '#f5576c',
  accentStart: '#4facfe',
  accentEnd: '#00f2fe',
  bgColor1: '#0f172a',  // 深蓝背景
  bgColor2: '#1e293b',  // 次要背景
  bgColor3: '#334155',  // 强调背景
}

const ThemeCustomizer: React.FC = () => {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS)
  const [showPreview, setShowPreview] = useState(true)

  // 从本地存储加载主题
  useEffect(() => {
    const saved = localStorage.getItem('toolhub-theme')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setColors(parsed)
        applyTheme(parsed)
      } catch (e) {
        console.error('Failed to load theme:', e)
      }
    }
  }, [])

  // 应用主题到CSS变量
  const applyTheme = (themeColors: ThemeColors) => {
    const root = document.documentElement
    // 渐变色
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${themeColors.primaryStart} 0%, ${themeColors.primaryEnd} 100%)`)
    root.style.setProperty('--gradient-secondary', `linear-gradient(135deg, ${themeColors.secondaryStart} 0%, ${themeColors.secondaryEnd} 100%)`)
    root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${themeColors.accentStart} 0%, ${themeColors.accentEnd} 100%)`)
    // 背景色
    root.style.setProperty('--bg-color-1', themeColors.bgColor1)
    root.style.setProperty('--bg-color-2', themeColors.bgColor2)
    root.style.setProperty('--bg-color-3', themeColors.bgColor3)

    // 同时更新body背景
    document.body.style.background = `linear-gradient(135deg, ${themeColors.bgColor1} 0%, ${themeColors.bgColor2} 50%, ${themeColors.bgColor3} 100%)`
  }

  // 保存主题
  const saveTheme = () => {
    localStorage.setItem('toolhub-theme', JSON.stringify(colors))
    applyTheme(colors)
    toast.success('主题已保存并应用！')
  }

  // 重置主题
  const resetTheme = () => {
    setColors(DEFAULT_COLORS)
    applyTheme(DEFAULT_COLORS)
    localStorage.removeItem('toolhub-theme')
    toast.info('主题已重置为默认值')
  }

  // 复制CSS代码
  const copyCSS = () => {
    const css = `:root {
  /* 渐变配色 */
  --gradient-primary: linear-gradient(135deg, ${colors.primaryStart} 0%, ${colors.primaryEnd} 100%);
  --gradient-secondary: linear-gradient(135deg, ${colors.secondaryStart} 0%, ${colors.secondaryEnd} 100%);
  --gradient-accent: linear-gradient(135deg, ${colors.accentStart} 0%, ${colors.accentEnd} 100%);

  /* 背景色 */
  --bg-color-1: ${colors.bgColor1};
  --bg-color-2: ${colors.bgColor2};
  --bg-color-3: ${colors.bgColor3};
}

/* Body背景 */
body {
  background: linear-gradient(135deg, ${colors.bgColor1} 0%, ${colors.bgColor2} 50%, ${colors.bgColor3} 100%);
}`
    navigator.clipboard.writeText(css)
    toast.success('CSS代码已复制！')
  }

  // 预设主题
  const presetThemes = [
    {
      name: '默认紫蓝',
      colors: { ...DEFAULT_COLORS }
    },
    {
      name: '日落橙',
      colors: {
        primaryStart: '#ff9a56', primaryEnd: '#ff6a88',
        secondaryStart: '#fbc2eb', secondaryEnd: '#a6c1ee',
        accentStart: '#f6d365', accentEnd: '#fda085',
        bgColor1: '#2d1b2e', bgColor2: '#4a2545', bgColor3: '#6b3e5c'
      }
    },
    {
      name: '森林绿',
      colors: {
        primaryStart: '#0ba360', primaryEnd: '#3cba92',
        secondaryStart: '#a8edea', secondaryEnd: '#fed6e3',
        accentStart: '#d4fc79', accentEnd: '#96e6a1',
        bgColor1: '#0a1f14', bgColor2: '#133824', bgColor3: '#1d5434'
      }
    },
    {
      name: '赛博粉',
      colors: {
        primaryStart: '#ff00cc', primaryEnd: '#333399',
        secondaryStart: '#00f2fe', secondaryEnd: '#4facfe',
        accentStart: '#f093fb', accentEnd: '#f5576c',
        bgColor1: '#0a0015', bgColor2: '#1a0530', bgColor3: '#2a0a45'
      }
    },
    {
      name: '午夜蓝',
      colors: {
        primaryStart: '#1e3c72', primaryEnd: '#2a5298',
        secondaryStart: '#7f7fd5', secondaryEnd: '#86a8e7',
        accentStart: '#91eae4', accentEnd: '#86a8e7',
        bgColor1: '#0a0e1a', bgColor2: '#151d33', bgColor3: '#1f2a4d'
      }
    },
    {
      name: '极简黑',
      colors: {
        primaryStart: '#434343', primaryEnd: '#000000',
        secondaryStart: '#666666', secondaryEnd: '#333333',
        accentStart: '#999999', accentEnd: '#666666',
        bgColor1: '#000000', bgColor2: '#0a0a0a', bgColor3: '#1a1a1a'
      }
    }
  ]

  const applyPreset = (preset: any) => {
    setColors(preset.colors)
    applyTheme(preset.colors)
  }

  // 颜色输入组件
  const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded cursor-pointer border border-slate-600 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">主题自定义</h2>
        <p className="text-slate-400">自定义ToolHub的配色方案，打造专属风格</p>
      </div>

      {/* 预设主题 */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          🎨 快速预设
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {presetThemes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="p-3 rounded-lg text-sm font-medium transition-all bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-indigo-500"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 自定义颜色 */}
      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          ⚙️ 自定义配色
        </h3>

        {/* 主渐变 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-indigo-400">主渐变 (Primary)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorInput
              label="起始色"
              value={colors.primaryStart}
              onChange={(v) => setColors(prev => ({ ...prev, primaryStart: v }))}
            />
            <ColorInput
              label="结束色"
              value={colors.primaryEnd}
              onChange={(v) => setColors(prev => ({ ...prev, primaryEnd: v }))}
            />
          </div>
        </div>

        {/* 次要渐变 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-purple-400">次要渐变 (Secondary)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorInput
              label="起始色"
              value={colors.secondaryStart}
              onChange={(v) => setColors(prev => ({ ...prev, secondaryStart: v }))}
            />
            <ColorInput
              label="结束色"
              value={colors.secondaryEnd}
              onChange={(v) => setColors(prev => ({ ...prev, secondaryEnd: v }))}
            />
          </div>
        </div>

        {/* 强调渐变 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-pink-400">强调渐变 (Accent)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorInput
              label="起始色"
              value={colors.accentStart}
              onChange={(v) => setColors(prev => ({ ...prev, accentStart: v }))}
            />
            <ColorInput
              label="结束色"
              value={colors.accentEnd}
              onChange={(v) => setColors(prev => ({ ...prev, accentEnd: v }))}
            />
          </div>
        </div>

        {/* 背景颜色 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-green-400">网站背景 (Background)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorInput
              label="主背景"
              value={colors.bgColor1}
              onChange={(v) => setColors(prev => ({ ...prev, bgColor1: v }))}
            />
            <ColorInput
              label="次背景"
              value={colors.bgColor2}
              onChange={(v) => setColors(prev => ({ ...prev, bgColor2: v }))}
            />
            <ColorInput
              label="强调背景"
              value={colors.bgColor3}
              onChange={(v) => setColors(prev => ({ ...prev, bgColor3: v }))}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            这三个颜色会形成渐变背景，从主背景 → 次背景 → 强调背景
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={saveTheme}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-lg"
          >
            💾 保存并应用
          </button>
          <button
            onClick={resetTheme}
            className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
          >
            🔄 重置
          </button>
          <button
            onClick={copyCSS}
            className="px-6 py-3 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
          >
            📋 复制CSS
          </button>
        </div>
      </div>

      {/* 预览区域 */}
      {showPreview && (
        <div className="glass rounded-xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-lg font-semibold text-white">
              👁️ 实时预览
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              隐藏
            </button>
          </div>

          <div className="space-y-4">
            {/* 渐变预览 */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">渐变效果</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 rounded-lg bg-gradient-to-r from-[var(--gradient-primary)] via-transparent to-transparent border border-white/10 flex items-center justify-center text-xs font-medium">
                  Primary
                </div>
                <div className="h-16 rounded-lg bg-gradient-to-r from-[var(--gradient-secondary)] via-transparent to-transparent border border-white/10 flex items-center justify-center text-xs font-medium">
                  Secondary
                </div>
                <div className="h-16 rounded-lg bg-gradient-to-r from-[var(--gradient-accent)] via-transparent to-transparent border border-white/10 flex items-center justify-center text-xs font-medium">
                  Accent
                </div>
              </div>
            </div>

            {/* 按钮预览 */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">按钮样式</label>
              <div className="flex gap-3 flex-wrap">
                <button className="px-6 py-3 bg-gradient-to-r from-[var(--gradient-primary)] text-white rounded-lg font-medium shadow-lg">
                  主要按钮
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-[var(--gradient-secondary)] text-white rounded-lg font-medium shadow-lg">
                  次要按钮
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-[var(--gradient-accent)] text-white rounded-lg font-medium shadow-lg">
                  强调按钮
                </button>
              </div>
            </div>

            {/* 文字预览 */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">渐变文字</label>
              <div className="text-2xl font-bold gradient-text">
                这是渐变文字效果
              </div>
            </div>

            {/* 玻璃拟态预览 */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">玻璃拟态卡片</label>
              <div className="glass rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[var(--gradient-primary)]"></div>
                  <div>
                    <div className="font-semibold text-white">预览卡片</div>
                    <div className="text-xs text-slate-400">使用当前主题配色</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 背景预览 */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">背景渐变预览</label>
              <div className="h-20 rounded-lg border border-white/10" style={{
                background: `linear-gradient(135deg, var(--bg-color-1, #0f172a) 0%, var(--bg-color-2, #1e293b) 50%, var(--bg-color-3, #334155) 100%)`
              }}></div>
              <div className="flex gap-2 text-xs text-slate-400 font-mono">
                <span>主: {colors.bgColor1}</span>
                <span>次: {colors.bgColor2}</span>
                <span>强: {colors.bgColor3}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          💡 使用说明
        </h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span>选择颜色：点击颜色选择器或输入HEX颜色值</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span>保存主题：点击保存后会存储到浏览器本地存储</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span>持久化：主题会在下次访问时自动加载</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span>导出CSS：复制生成的CSS变量到你的项目</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ThemeCustomizer
