import React, { useState } from 'react'

interface ConvertItem {
  id: string
  timestamp: string
  datetime: string
  result: string
  error: string
}

interface TimestampConverterProps {}

const TimestampConverter: React.FC<TimestampConverterProps> = () => {
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const [items, setItems] = useState<ConvertItem[]>([
    { id: `item-${Date.now()}`, timestamp: '', datetime: '', result: '', error: '' }
  ])

  const timezones = [
    'UTC', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore', 'America/New_York',
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Australia/Sydney'
  ]

  // 添加新的输入组
  const addConvertItem = () => {
    const newItem: ConvertItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: '',
      datetime: '',
      result: '',
      error: ''
    }
    setItems(prev => [...prev, newItem])
  }

  // 删除指定输入组
  const removeItem = (id: string) => {
    if (items.length <= 1) {
      alert('至少需要保留一个输入组')
      return
    }
    setItems(prev => prev.filter(item => item.id !== id))
  }

  // 单组转换：时间戳 → 日期
  const convertTimestampToDateTime = (item: ConvertItem): ConvertItem => {
    try {
      const ts = item.timestamp.trim()
      if (!ts) {
        return { ...item, error: '请输入时间戳', result: '' }
      }

      let timestamp = parseInt(ts)
      if (isNaN(timestamp)) {
        return { ...item, error: '时间戳格式不正确', result: '' }
      }

      // 判断是秒级还是毫秒级
      if (ts.length > 10) {
        timestamp = timestamp / 1000
      }

      const date = new Date(timestamp * 1000)

      // 格式化日期
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: timezone
      }

      const formatted = new Intl.DateTimeFormat('zh-CN', options).format(date)

      // 获取时间戳详情
      const details = [
        `📅 ${formatted}`,
        `🕒 原始: ${item.timestamp}`,
        `📊 秒缀: ${Math.floor(date.getTime() / 1000)}`,
        `📈 毫秒: ${date.getTime()}`,
        `🌐 ISO: ${date.toISOString()}`,
        `🌍 时区: ${timezone}`
      ]

      return {
        ...item,
        result: details.join('\n'),
        error: ''
      }
    } catch (err) {
      return {
        ...item,
        result: '',
        error: (err as Error).message
      }
    }
  }

  // 单组转换：日期 → 时间戳
  const convertDateTimeToTimestamp = (item: ConvertItem): ConvertItem => {
    try {
      const dateStr = item.datetime.trim()
      if (!dateStr) {
        return { ...item, error: '请输入日期时间', result: '' }
      }

      // 尝试多种日期格式
      let date = new Date(dateStr)

      if (isNaN(date.getTime())) {
        // 尝试处理常见格式：2025-12-19 10:30:00
        const parts = dateStr.replace(/[-:]/g, ' ').split(' ')
        if (parts.length >= 3) {
          const [year, month, day, hour = 0, minute = 0, second = 0] = parts.map(Number)
          date = new Date(year, month - 1, day, hour, minute, second)
        }
      }

      if (isNaN(date.getTime())) {
        return { ...item, error: '日期格式不支持，请使用标准格式', result: '' }
      }

      const timestampSec = Math.floor(date.getTime() / 1000)
      const timestampMs = date.getTime()

      const details = [
        `📅 原始: ${item.datetime}`,
        `📊 秒缀: ${timestampSec}`,
        `📈 毫秒: ${timestampMs}`,
        `🌐 ISO: ${date.toISOString()}`,
        `🌍 UTC: ${date.toUTCString()}`
      ]

      return {
        ...item,
        result: details.join('\n'),
        error: ''
      }
    } catch (err) {
      return {
        ...item,
        result: '',
        error: (err as Error).message
      }
    }
  }

  // 批量转换所有
  const convertAll = () => {
    setItems(prev => prev.map(item => {
      // 如果有时间戳，优先转日期；如果有日期，优先转时间戳
      if (item.timestamp.trim()) {
        return convertTimestampToDateTime(item)
      } else if (item.datetime.trim()) {
        return convertDateTimeToTimestamp(item)
      } else {
        return { ...item, error: '请填写时间戳或日期', result: '' }
      }
    }))
  }

  // 更新单项数据
  const updateItem = (id: string, field: 'timestamp' | 'datetime', value: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value, result: '', error: '' } : item
    ))
  }

  // 清空所有
  const clearAll = () => {
    setItems(prev => prev.map(item => ({
      ...item,
      timestamp: '',
      datetime: '',
      result: '',
      error: ''
    })))
  }

  // 获取当前时间并添加
  const addCurrentTime = () => {
    const now = new Date()
    const tsSec = Math.floor(now.getTime() / 1000)

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: timezone
    }

    const formatted = new Intl.DateTimeFormat('zh-CN', options).format(now)

    const newItem: ConvertItem = {
      id: `item-${Date.now()}`,
      timestamp: tsSec.toString(),
      datetime: formatted.replace(/\//g, '-'),
      result: '',
      error: ''
    }

    setItems(prev => [...prev, newItem])
  }

  // 从剪贴板批量导入
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text) {
        alert('剪贴板为空')
        return
      }

      const lines = text.split('\n').filter(line => line.trim() !== '')
      if (lines.length === 0) {
        alert('剪贴板内容不包含有效文本')
        return
      }

      const newItems: ConvertItem[] = lines.map((line, index) => {
        const value = line.trim()
        // 自动判断是时间戳还是日期
        const isTimestamp = /^\d+$/.test(value) && (value.length === 10 || value.length === 13)

        return {
          id: `item-${Date.now()}-${index}`,
          timestamp: isTimestamp ? value : '',
          datetime: isTimestamp ? '' : value,
          result: '',
          error: ''
        }
      })

      setItems(prev => [...prev, ...newItems])

      alert(`成功导入 ${newItems.length} 个输入项`)
    } catch (err) {
      alert('无法读取剪贴板，请确保授予相应权限')
    }
  }

  // 单个转换
  const convertSingle = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item

      // 如果有时间戳，优先转日期；如果有日期，优先转时间戳
      if (item.timestamp.trim()) {
        return convertTimestampToDateTime(item)
      } else if (item.datetime.trim()) {
        return convertDateTimeToTimestamp(item)
      } else {
        return { ...item, error: '请填写时间戳或日期', result: '' }
      }
    }))
  }

  // 复制单个结果
  const copySingleResult = (item: ConvertItem) => {
    if (item.result) {
      navigator.clipboard.writeText(item.result).then(() => {
        alert('已复制到剪贴板！')
      })
    }
  }

  // 复制所有结果
  const copyAllResults = () => {
    const results = items
      .filter(item => item.result && !item.error)
      .map((item, index) => {
        const origin = item.timestamp || item.datetime
        return `【${index + 1}. ${origin}】\n${item.result}`
      })
      .join('\n\n')

    if (!results) {
      alert('没有可复制的结果')
      return
    }

    navigator.clipboard.writeText(results).then(() => {
      alert('所有结果已复制到剪贴板！')
    })
  }

  // 导出对比结果
  const exportCompareResults = () => {
    const results = items
      .filter(item => item.result && !item.error)
      .map(item => {
        const lines = item.result.split('\n')
        const dateLine = lines.find(l => l.includes('📅')) || ''
        const tsLine = lines.find(l => l.includes('秒缀') || l.includes('毫秒')) || ''
        const origin = item.timestamp || item.datetime
        return `[${origin}] -> ${dateLine.replace('📅 ', '')} | ${tsLine}`
      })
      .join('\n')

    if (!results) {
      alert('没有可导出的结果')
      return
    }

    navigator.clipboard.writeText(results).then(() => {
      alert('对比结果已复制到剪贴板！')
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">批量时间戳转换</h2>
        <p className="text-slate-400">支持添加多个输入框，同时转换多个时间戳或日期</p>
      </div>

      {/* 统计信息 */}
      <div className="glass rounded-xl p-4 grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-indigo-400">{items.length}</div>
          <div className="text-xs text-slate-400 mt-1">输入组</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">
            {items.filter(i => i.result && !i.error).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">已转换</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-400">
            {items.filter(i => i.error).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">错误</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-400">
            {items.filter(i => !i.timestamp && !i.datetime).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">待填写</div>
        </div>
      </div>

      {/* 控制区域 */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={addConvertItem}
            className="px-4 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-sm font-medium transition-colors"
          >
            ➕ 添加输入组
          </button>
          <button
            onClick={addCurrentTime}
            className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 text-sm font-medium transition-colors"
          >
            🌟 添加当前时间
          </button>
          <button
            onClick={pasteFromClipboard}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-sm font-medium transition-colors"
          >
            📋 从剪贴板导入
          </button>
          <button
            onClick={convertAll}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 text-sm font-medium transition-colors"
          >
            ⚡ 批量转换
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm font-medium transition-colors"
          >
            🗑️ 清空内容
          </button>
        </div>

        {items.filter(i => i.result).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
            <button
              onClick={copyAllResults}
              className="px-3 py-1.5 bg-white/10 text-white rounded hover:bg-white/20 text-xs transition-colors border border-white/20"
            >
              📤 复制所有结果
            </button>
            <button
              onClick={exportCompareResults}
              className="px-3 py-1.5 bg-white/10 text-white rounded hover:bg-white/20 text-xs transition-colors border border-white/20"
            >
              💾 导出对比格式
            </button>
          </div>
        )}
      </div>

      {/* 时区控制 */}
      <div className="glass rounded-xl p-4">
        <label className="text-sm text-slate-300 mb-2 block">时区选择</label>
        <div className="flex gap-2 flex-wrap">
          {timezones.map(tz => (
            <button
              key={tz}
              onClick={() => setTimezone(tz)}
              className={`px-3 py-1.5 rounded text-xs transition-all ${
                timezone === tz
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {tz}
            </button>
          ))}
        </div>
      </div>

      {/* 输入输出区域 */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="glass rounded-xl p-4 border border-slate-700 hover:border-indigo-500 transition-all animate-fade-in">
            {/* 顶部栏 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs font-bold">
                  输入组 #{index + 1}
                </span>
                <span className="text-xs text-slate-400">
                  {item.timestamp ? '时间戳输入' : item.datetime ? '日期输入' : '空输入'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => convertSingle(item.id)}
                  className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30 text-xs transition-colors"
                >
                  转换
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 text-xs transition-colors"
                >
                  删除
                </button>
              </div>
            </div>

            {/* 输入区域 - 双输入框 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
              {/* 时间戳输入 */}
              <div className="space-y-1">
                <label className="text-xs text-blue-300 font-semibold">时间戳 → 日期</label>
                <input
                  type="text"
                  value={item.timestamp}
                  onChange={(e) => updateItem(item.id, 'timestamp', e.target.value)}
                  placeholder="输入时间戳 (秒/毫秒)"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 日期输入 */}
              <div className="space-y-1">
                <label className="text-xs text-green-300 font-semibold">日期 → 时间戳</label>
                <input
                  type="text"
                  value={item.datetime}
                  onChange={(e) => updateItem(item.id, 'datetime', e.target.value)}
                  placeholder="输入日期时间"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            {/* 结果展示 */}
            {item.result || item.error ? (
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                {item.error ? (
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-red-400 flex-1">{item.error}</div>
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">错误</span>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-slate-300 space-y-0.5">
                        {item.result.split('\n').map((line, i) => (
                          <div key={i} className="leading-relaxed">{line}</div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => copySingleResult(item)}
                      className="flex-shrink-0 px-2 py-1 bg-white/10 text-white rounded hover:bg-white/20 text-xs transition-colors"
                      title="复制结果"
                    >
                      📋
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/30 rounded-lg p-3 border border-dashed border-slate-700 text-xs text-slate-500 text-center">
                填写时间戳或日期后点击"转换"按钮
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 使用说明 */}
      <div className="glass rounded-xl p-4 text-sm text-slate-300">
        <h3 className="font-semibold text-white mb-2">📖 使用说明</h3>
        <ul className="space-y-1 opacity-80">
          <li>• <strong>添加组</strong>：点击"添加输入组"增加新的转换框</li>
          <li>• <strong>双输入</strong>：每组都包含时间戳输入和日期输入，可填写任意一个</li>
          <li>• <strong>批量操作</strong>：支持批量导入、批量转换和结果批量复制</li>
          <li>• <strong>智能识别</strong>：自动判断秒/毫秒时间戳和多种日期格式</li>
          <li>• <strong>个性管理</strong>：可单独转换、删除某个输入组，或清空所有内容</li>
          <li>• <strong>时区同步</strong>：修改时区后重新转换即可应用到所有结果</li>
        </ul>
      </div>
    </div>
  )
}

export default TimestampConverter