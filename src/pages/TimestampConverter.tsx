import React, { useState } from 'react'

interface TimestampState {
  timestamp: string
  datetime: string
  timezone: string
  result: string
  error: string
}

const TimestampConverter: React.FC = () => {
  const [state, setState] = useState<TimestampState>({
    timestamp: '',
    datetime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    result: '',
    error: '',
  })

  const timezones = [
    'UTC', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore', 'America/New_York',
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Australia/Sydney'
  ]

  // 时间戳转日期
  const timestampToDateTime = () => {
    try {
      const ts = state.timestamp.trim()
      let timestamp = parseInt(ts)

      // 判断是秒级还是毫秒级
      if (ts.length > 10) {
        timestamp = timestamp / 1000
      }

      if (isNaN(timestamp)) {
        throw new Error('时间戳格式不正确')
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
        timeZone: state.timezone
      }

      const formatted = new Intl.DateTimeFormat('zh-CN', options).format(date)

      // 获取时间戳详情
      const details = [
        `ISO格式: ${date.toISOString()}`,
        `时间戳: ${Math.floor(date.getTime() / 1000)} (秒)`,
        `时间戳: ${date.getTime()} (毫秒)`,
        `时区: ${state.timezone}`
      ]

      setState(prev => ({
        ...prev,
        result: `${formatted}\n\n${details.join('\n')}`,
        error: ''
      }))
    } catch (err) {
      setState(prev => ({ ...prev, error: (err as Error).message, result: '' }))
    }
  }

  // 日期转时间戳
  const dateTimeToTimestamp = () => {
    try {
      const dateStr = state.datetime.trim()
      if (!dateStr) {
        throw new Error('请输入日期时间')
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
        throw new Error('日期格式不支持，请使用标准格式如：2025-12-19 10:30:00')
      }

      const timestampSec = Math.floor(date.getTime() / 1000)
      const timestampMs = date.getTime()

      const details = [
        `秒级时间戳: ${timestampSec}`,
        `毫秒时间戳: ${timestampMs}`,
        `ISO格式: ${date.toISOString()}`,
        `UTC时间: ${date.toUTCString()}`
      ]

      setState(prev => ({
        ...prev,
        result: details.join('\n'),
        error: ''
      }))
    } catch (err) {
      setState(prev => ({ ...prev, error: (err as Error).message, result: '' }))
    }
  }

  // 获取当前时间
  const getCurrentTime = () => {
    const now = new Date()
    const tsSec = Math.floor(now.getTime() / 1000)
    const tsMs = now.getTime()

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: state.timezone
    }

    const formatted = new Intl.DateTimeFormat('zh-CN', options).format(now)

    setState(prev => ({
      ...prev,
      timestamp: tsSec.toString(),
      datetime: `${formatted.replace(/\//g, '-').replace(' ', ' ')}`,
      result: `当前时间 (${state.timezone}):\n${formatted}\n\n秒级时间戳: ${tsSec}\n毫秒时间戳: ${tsMs}`,
      error: ''
    }))
  }

  const handleCopy = () => {
    if (state.result) {
      navigator.clipboard.writeText(state.result)
      alert('已复制到剪贴板！')
    }
  }

  const handleClear = () => {
    setState({
      timestamp: '',
      datetime: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      result: '',
      error: '',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">时间戳转换工具</h2>
        <p className="text-slate-400">支持时间戳与日期格式互转，多时区支持</p>
      </div>

      {/* 时区选择 */}
      <div className="glass rounded-xl p-4">
        <label className="text-sm text-slate-300 mb-2 block">时区选择</label>
        <select
          value={state.timezone}
          onChange={(e) => setState(prev => ({ ...prev, timezone: e.target.value }))}
          className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
        >
          {timezones.map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 时间戳转日期 */}
        <div className="glass rounded-xl p-4 space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center justify-between">
            <span>时间戳 → 日期</span>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">秒/毫秒</span>
          </h3>

          <input
            type="text"
            value={state.timestamp}
            onChange={(e) => setState(prev => ({ ...prev, timestamp: e.target.value }))}
            placeholder="输入时间戳 (1734594600 或 1734594600000)"
            className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />

          <button
            onClick={timestampToDateTime}
            className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium"
          >
            转换
          </button>
        </div>

        {/* 日期转时间戳 */}
        <div className="glass rounded-xl p-4 space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center justify-between">
            <span>日期 → 时间戳</span>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">日期格式</span>
          </h3>

          <input
            type="text"
            value={state.datetime}
            onChange={(e) => setState(prev => ({ ...prev, datetime: e.target.value }))}
            placeholder="输入日期 (2025-12-19 10:30:00)"
            className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />

          <button
            onClick={dateTimeToTimestamp}
            className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
          >
            转换
          </button>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={getCurrentTime}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all text-sm font-medium"
        >
          获取当前时间
        </button>
        {state.result && (
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all text-sm font-medium border border-white/20"
          >
            复制结果
          </button>
        )}
        {(state.timestamp || state.datetime || state.result) && (
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium border border-red-500/30"
          >
            清空
          </button>
        )}
      </div>

      {/* 结果展示 */}
      {(state.result || state.error) && (
        <div className="glass rounded-xl p-4">
          <label className="text-lg font-semibold text-white mb-2 block">结果</label>
          {state.error && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {state.error}
            </div>
          )}
          {state.result && (
            <pre className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-200 whitespace-pre-wrap overflow-x-auto">
              {state.result}
            </pre>
          )}
        </div>
      )}

      {/* 常用时间戳 */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">常用示例</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            onClick={() => {
              const now = new Date()
              setState(prev => ({
                ...prev,
                timestamp: Math.floor(now.getTime() / 1000).toString(),
                datetime: now.toISOString().slice(0, 19).replace('T', ' ')
              }))
            }}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-slate-300 transition-colors text-left border border-slate-600/50"
          >
            设置为当前时间
          </button>
          <button
            onClick={() => {
              setState(prev => ({
                ...prev,
                timestamp: '1734594600',
                datetime: '2024-12-19 10:30:00'
              }))
            }}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-slate-300 transition-colors text-left border border-slate-600/50"
          >
            2024-12-19 10:30:00 ↔ 1734594600
          </button>
          <button
            onClick={() => {
              setState(prev => ({
                ...prev,
                timestamp: Date.now().toString(),
                datetime: new Date().toISOString().replace('T', ' ').slice(0, 19)
              }))
            }}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-slate-300 transition-colors text-left border border-slate-600/50"
          >
            毫秒级当前时间戳
          </button>
          <button
            onClick={() => {
              setState(prev => ({
                ...prev,
                timestamp: '0',
                datetime: '1970-01-01 00:00:00'
              }))
            }}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-slate-300 transition-colors text-left border border-slate-600/50"
          >
            1970-01-01 (时间戳0点)
          </button>
        </div>
      </div>

      {/* 说明 */}
      <div className="glass rounded-xl p-4 text-sm text-slate-300">
        <h3 className="font-semibold text-white mb-2">使用说明</h3>
        <ul className="space-y-1 opacity-80">
          <li>• 支持秒级 (10位) 和毫秒级 (13位) 时间戳自动识别</li>
          <li>• 日期格式支持：2025-12-19 10:30:00、2025-12-19T10:30:00Z 等</li>
          <li>• 可选择不同时区进行转换</li>
          <li>• 所有计算均在浏览器本地完成</li>
        </ul>
      </div>
    </div>
  )
}

export default TimestampConverter