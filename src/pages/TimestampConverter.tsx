import React, { useState, useEffect } from 'react'
import { toast } from '../components/Toast'

const TimestampConverter: React.FC = () => {
  const [timestamp, setTimestamp] = useState('')
  const [datetime, setDatetime] = useState('')
  const [result, setResult] = useState<{
    formatted: string
    seconds: number
    milliseconds: number
    iso: string
    utc: string
  } | null>(null)
  const [error, setError] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai')

  const timezones = [
    { value: 'Asia/Shanghai', label: '北京时间' },
    { value: 'UTC', label: 'UTC' },
    { value: 'Asia/Tokyo', label: '东京' },
    { value: 'America/New_York', label: '纽约' },
    { value: 'America/Los_Angeles', label: '洛杉矶' },
    { value: 'Europe/London', label: '伦敦' },
  ]

  // 页面加载时自动填充当前时间
  useEffect(() => {
    loadCurrentTime()
  }, [timezone])

  const loadCurrentTime = () => {
    const now = new Date()
    const tsSec = Math.floor(now.getTime() / 1000)
    setTimestamp(tsSec.toString())
    convertTimestamp(tsSec.toString())
  }

  // 时间戳转日期
  const convertTimestamp = (ts: string) => {
    try {
      const trimmed = ts.trim()
      if (!trimmed) {
        setResult(null)
        setError('')
        return
      }

      let tsNum = parseInt(trimmed)
      if (isNaN(tsNum)) {
        setError('时间戳格式不正确')
        setResult(null)
        return
      }

      // 判断是秒级还是毫秒级
      if (trimmed.length > 10) {
        tsNum = Math.floor(tsNum / 1000)
      }

      const date = new Date(tsNum * 1000)

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

      setResult({
        formatted: formatted.replace(/\//g, '-'),
        seconds: tsNum,
        milliseconds: tsNum * 1000,
        iso: date.toISOString(),
        utc: date.toUTCString()
      })
      setDatetime(formatted.replace(/\//g, '-'))
      setError('')
    } catch (err) {
      setError((err as Error).message)
      setResult(null)
    }
  }

  // 日期转时间戳
  const convertDatetime = (dt: string) => {
    try {
      const trimmed = dt.trim()
      if (!trimmed) {
        setResult(null)
        setError('')
        return
      }

      let date = new Date(trimmed)

      if (isNaN(date.getTime())) {
        // 尝试处理常见格式：2025-12-19 10:30:00
        const parts = trimmed.replace(/[-:]/g, ' ').split(' ')
        if (parts.length >= 3) {
          const [year, month, day, hour = 0, minute = 0, second = 0] = parts.map(Number)
          date = new Date(year, month - 1, day, hour, minute, second)
        }
      }

      if (isNaN(date.getTime())) {
        setError('日期格式不支持')
        setResult(null)
        return
      }

      const tsSec = Math.floor(date.getTime() / 1000)

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

      setResult({
        formatted: formatted.replace(/\//g, '-'),
        seconds: tsSec,
        milliseconds: tsSec * 1000,
        iso: date.toISOString(),
        utc: date.toUTCString()
      })
      setTimestamp(tsSec.toString())
      setError('')
    } catch (err) {
      setError((err as Error).message)
      setResult(null)
    }
  }

  const handleTimestampChange = (value: string) => {
    setTimestamp(value)
    setDatetime('')
    convertTimestamp(value)
  }

  const handleDatetimeChange = (value: string) => {
    setDatetime(value)
    setTimestamp('')
    convertDatetime(value)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制！')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* 标题 */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">时间戳转换</h2>
        <p className="text-slate-400">时间戳与日期时间相互转换</p>
      </div>

      {/* 输入区域 */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 时间戳输入 */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium">时间戳</label>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => handleTimestampChange(e.target.value)}
              placeholder="秒或毫秒"
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg text-base focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* 日期输入 */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium">日期时间</label>
            <input
              type="text"
              value={datetime}
              onChange={(e) => handleDatetimeChange(e.target.value)}
              placeholder="2024-01-01 12:00:00"
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg text-base focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={loadCurrentTime}
            className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 text-sm font-medium transition-colors border border-indigo-500/30"
          >
            当前时间
          </button>
          <button
            onClick={() => { setTimestamp(''); setDatetime(''); setResult(null); setError(''); }}
            className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 text-sm font-medium transition-colors"
          >
            清空
          </button>
        </div>
      </div>

      {/* 结果展示 */}
      {error ? (
        <div className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/10">
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      ) : result ? (
        <div className="glass rounded-xl p-6 space-y-4">
          {/* 主要结果 - 格式化日期 */}
          <div className="text-center pb-4 border-b border-slate-700/50">
            <div className="text-sm text-slate-400 mb-1">转换结果</div>
            <div className="text-2xl md:text-3xl font-mono text-white font-bold">
              {result.formatted}
            </div>
          </div>

          {/* 详细信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">秒级时间戳</div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-slate-200">{result.seconds}</span>
                <button
                  onClick={() => handleCopy(result.seconds.toString())}
                  className="text-xs px-2 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                >
                  复制
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">毫秒级时间戳</div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-slate-200">{result.milliseconds}</span>
                <button
                  onClick={() => handleCopy(result.milliseconds.toString())}
                  className="text-xs px-2 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                >
                  复制
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3 md:col-span-2">
              <div className="text-xs text-slate-400 mb-1">ISO 格式</div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-slate-200 text-sm truncate">{result.iso}</span>
                <button
                  onClick={() => handleCopy(result.iso)}
                  className="text-xs px-2 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors flex-shrink-0"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 时区选择 */}
      <div className="glass rounded-xl p-4">
        <label className="text-sm text-slate-300 mb-3 block">时区</label>
        <div className="flex gap-2 flex-wrap">
          {timezones.map(tz => (
            <button
              key={tz.value}
              onClick={() => setTimezone(tz.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                timezone === tz.value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {tz.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimestampConverter
