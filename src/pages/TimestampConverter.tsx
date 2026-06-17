import React, { useState, useEffect, useRef, useMemo } from 'react'
import { toast } from '../components/Toast'

interface ConversionResult {
  formatted: string
  seconds: number
  milliseconds: number
  iso: string
  utc: string
  rfc2822: string
  chineseReadable: string
  relative: string
  dayOfWeek: string
}

type TsValidity = 'empty' | 'valid_seconds' | 'valid_milliseconds' | 'invalid'
type DtValidity = 'empty' | 'valid' | 'invalid'
type ConvertMode = 'single' | 'batch'

interface BatchResult {
  input: string
  output: string
  seconds?: number
  error?: string
}

const WEEKDAY_CN = ['日', '一', '二', '三', '四', '五', '六']

const TIMEZONE_GROUPS = [
  {
    label: '亚洲',
    zones: [
      { value: 'Asia/Shanghai', label: '北京/上海 (CST)' },
      { value: 'Asia/Tokyo', label: '东京 (JST)' },
      { value: 'Asia/Seoul', label: '首尔 (KST)' },
      { value: 'Asia/Singapore', label: '新加坡 (SGT)' },
      { value: 'Asia/Kolkata', label: '孟买 (IST)' },
      { value: 'Asia/Dubai', label: '迪拜 (GST)' },
    ],
  },
  {
    label: '美洲',
    zones: [
      { value: 'America/New_York', label: '纽约 (EST/EDT)' },
      { value: 'America/Chicago', label: '芝加哥 (CST/CDT)' },
      { value: 'America/Los_Angeles', label: '洛杉矶 (PST/PDT)' },
      { value: 'America/Sao_Paulo', label: '圣保罗 (BRT)' },
    ],
  },
  {
    label: '欧洲',
    zones: [
      { value: 'Europe/London', label: '伦敦 (GMT/BST)' },
      { value: 'Europe/Paris', label: '巴黎 (CET/CEST)' },
      { value: 'Europe/Berlin', label: '柏林 (CET/CEST)' },
      { value: 'Europe/Moscow', label: '莫斯科 (MSK)' },
    ],
  },
  {
    label: '大洋洲',
    zones: [
      { value: 'Australia/Sydney', label: '悉尼 (AEST/AEDT)' },
      { value: 'Pacific/Auckland', label: '奥克兰 (NZST/NZDT)' },
    ],
  },
  {
    label: 'UTC',
    zones: [{ value: 'UTC', label: 'UTC 协调世界时' }],
  },
]

const QUICK_TIMEZONES = [
  { value: 'Asia/Shanghai', label: '北京' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: '纽约' },
  { value: 'Europe/London', label: '伦敦' },
  { value: 'Asia/Tokyo', label: '东京' },
  { value: 'America/Los_Angeles', label: '洛杉矶' },
]

const SHORTCUTS = [
  { label: '今日零点', compute: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return Math.floor(d.getTime() / 1000) } },
  { label: '昨日零点', compute: () => { const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0); return Math.floor(d.getTime() / 1000) } },
  { label: '本周一', compute: () => { const d = new Date(); const day = d.getDay() || 7; d.setDate(d.getDate() - day + 1); d.setHours(0, 0, 0, 0); return Math.floor(d.getTime() / 1000) } },
  { label: '本月1号', compute: () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return Math.floor(d.getTime() / 1000) } },
  { label: '今年1月1日', compute: () => { const d = new Date(); d.setMonth(0, 1); d.setHours(0, 0, 0, 0); return Math.floor(d.getTime() / 1000) } },
]

const EXAMPLE_TIMESTAMPS = [
  { label: '当前时间', value: () => Math.floor(Date.now() / 1000).toString() },
  { label: '2024-01-01', value: () => '1704067200' },
  { label: '2025-01-01', value: () => '1735689600' },
  { label: 'Unix纪元', value: () => '0' },
  { label: '2038问题', value: () => '2147483647' },
]

const HISTORY_KEY = 'timestamp_converter_history'
const MAX_HISTORY = 5

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const absDiff = Math.abs(diffMs)
  const isFuture = diffMs < 0

  if (absDiff < 60_000) return '刚刚'

  const minutes = Math.floor(absDiff / 60_000)
  const hours = Math.floor(absDiff / 3_600_000)
  const days = Math.floor(absDiff / 86_400_000)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  const suffix = isFuture ? '后' : '前'

  if (minutes < 60) return `${minutes}分钟${suffix}`
  if (hours < 24) return `${hours}小时${suffix}`
  if (days === 1 && !isFuture) return '昨天'
  if (days === 1 && isFuture) return '明天'
  if (days < 7) return `${days}天${suffix}`
  if (weeks < 5) return `${weeks}周${suffix}`
  if (months < 12) return `${months}个月${suffix}`
  return `${years}年${suffix}`
}

function formatChineseReadable(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: tz, weekday: 'short',
  }).formatToParts(date)

  const get = (type: string) => parts.find(p => p.type === type)?.value || ''
  return `${get('year')}年${get('month')}月${get('day')}日 ${get('hour')}时${get('minute')}分${get('second')}秒 ${get('weekday')}`
}

function formatRFC2822(date: Date): string {
  return date.toUTCString()
}

function smartParseDate(input: string): Date | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let date = new Date(trimmed)
  if (!isNaN(date.getTime())) return date

  // 2025-01-01 12:00:00 / 2025/01/01 12:00:00
  const parts = trimmed.replace(/[\/\-:T]/g, ' ').split(/\s+/)
  if (parts.length >= 3) {
    const nums = parts.map(Number)
    const [year, month, day, hour = 0, minute = 0, second = 0] = nums
    date = new Date(year, month - 1, day, hour, minute, second)
    if (!isNaN(date.getTime())) return date
  }

  return null
}

const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false,
}

function buildResult(date: Date, timezone: string): ConversionResult {
  const tsSec = Math.floor(date.getTime() / 1000)
  const formatted = new Intl.DateTimeFormat('zh-CN', { ...FORMAT_OPTIONS, timeZone: timezone })
    .format(date).replace(/\//g, '-')
  const dayParts = new Intl.DateTimeFormat('zh-CN', { weekday: 'long', timeZone: timezone }).formatToParts(date)
  const dayOfWeek = dayParts.find(p => p.type === 'weekday')?.value || `星期${WEEKDAY_CN[date.getDay()]}`

  return {
    formatted,
    seconds: tsSec,
    milliseconds: tsSec * 1000,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    rfc2822: formatRFC2822(date),
    chineseReadable: formatChineseReadable(date, timezone),
    relative: getRelativeTime(date),
    dayOfWeek,
  }
}

const TimestampConverter: React.FC = () => {
  const [timestamp, setTimestamp] = useState('')
  const [datetime, setDatetime] = useState('')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai')
  const [tsValidity, setTsValidity] = useState<TsValidity>('empty')
  const [dtValidity, setDtValidity] = useState<DtValidity>('empty')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [mode, setMode] = useState<ConvertMode>('single')
  const [batchInput, setBatchInput] = useState('')
  const [batchResults, setBatchResults] = useState<BatchResult[]>([])
  const [now, setNow] = useState(Date.now())
  const [calcOffset, setCalcOffset] = useState('')
  const [calcResult, setCalcResult] = useState<ConversionResult | null>(null)
  const [calcError, setCalcError] = useState('')

  const debounceTsRef = useRef<number | null>(null)
  const debounceDtRef = useRef<number | null>(null)

  const [history, setHistory] = useState<Array<{ value: string; type: 'timestamp' | 'datetime' }>>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const liveTimestamp = useMemo(() => Math.floor(now / 1000), [now])
  const liveFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('zh-CN', { ...FORMAT_OPTIONS, timeZone: timezone }).format(new Date(now)).replace(/\//g, '-')
  }, [now, timezone])

  // Debounced timestamp validation
  useEffect(() => {
    if (debounceTsRef.current) clearTimeout(debounceTsRef.current)
    if (!timestamp.trim()) { setTsValidity('empty'); return }
    debounceTsRef.current = window.setTimeout(() => {
      const num = parseInt(timestamp.trim())
      if (isNaN(num)) {
        setTsValidity('invalid')
      } else if (timestamp.trim().length > 10) {
        setTsValidity('valid_milliseconds')
      } else {
        setTsValidity('valid_seconds')
      }
    }, 300)
    return () => { if (debounceTsRef.current) clearTimeout(debounceTsRef.current) }
  }, [timestamp])

  // Debounced datetime validation
  useEffect(() => {
    if (debounceDtRef.current) clearTimeout(debounceDtRef.current)
    if (!datetime.trim()) { setDtValidity('empty'); return }
    debounceDtRef.current = window.setTimeout(() => {
      setDtValidity(smartParseDate(datetime) ? 'valid' : 'invalid')
    }, 300)
    return () => { if (debounceDtRef.current) clearTimeout(debounceDtRef.current) }
  }, [datetime])

  // Auto-reconvert on timezone change
  useEffect(() => {
    if (timestamp) {
      convertTimestamp(timestamp)
    } else if (datetime) {
      convertDatetime(datetime)
    } else {
      loadCurrentTime()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timezone])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        if (timestamp) convertTimestamp(timestamp)
        else if (datetime) convertDatetime(datetime)
        else loadCurrentTime()
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault()
        if (result) handleCopy(result.formatted, 'formatted', '转换结果')
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClear()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamp, datetime, result])

  const addToHistory = (value: string, type: 'timestamp' | 'datetime') => {
    if (!value.trim()) return
    setHistory(prev => {
      const filtered = prev.filter(h => h.value !== value.trim())
      const next = [{ value: value.trim(), type }, ...filtered].slice(0, MAX_HISTORY)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      return next
    })
  }

  const loadCurrentTime = () => {
    const nowDate = new Date()
    const tsSec = Math.floor(nowDate.getTime() / 1000)
    setTimestamp(tsSec.toString())
    const res = buildResult(nowDate, timezone)
    setResult(res)
    setDatetime(res.formatted)
    setError('')
  }

  const convertTimestamp = (ts: string) => {
    try {
      const trimmed = ts.trim()
      if (!trimmed) { setResult(null); setError(''); return }
      let tsNum = parseInt(trimmed)
      if (isNaN(tsNum)) { setError('时间戳格式不正确'); setResult(null); return }
      if (trimmed.length > 10) tsNum = Math.floor(tsNum / 1000)
      const date = new Date(tsNum * 1000)
      const res = buildResult(date, timezone)
      setResult(res)
      setDatetime(res.formatted)
      setError('')
      addToHistory(trimmed, 'timestamp')
    } catch (err) {
      setError((err as Error).message)
      setResult(null)
    }
  }

  const convertDatetime = (dt: string) => {
    try {
      const date = smartParseDate(dt)
      if (!date) {
        if (!dt.trim()) { setResult(null); setError(''); return }
        setError('日期格式不支持，请使用 YYYY-MM-DD HH:mm:ss')
        setResult(null)
        return
      }
      const res = buildResult(date, timezone)
      setResult(res)
      setTimestamp(res.seconds.toString())
      setError('')
      addToHistory(dt.trim(), 'datetime')
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

  const handleSwap = () => {
    const oldTs = timestamp
    const oldDt = datetime
    if (oldDt) {
      const date = smartParseDate(oldDt)
      if (date) {
        const ts = Math.floor(date.getTime() / 1000).toString()
        setTimestamp(ts)
        convertTimestamp(ts)
      }
    }
    if (oldTs) {
      const num = parseInt(oldTs)
      if (!isNaN(num)) {
        const ms = oldTs.length > 10 ? num : num * 1000
        const date = new Date(ms)
        if (!isNaN(date.getTime())) {
          const formatted = new Intl.DateTimeFormat('zh-CN', { ...FORMAT_OPTIONS, timeZone: timezone }).format(date).replace(/\//g, '-')
          setDatetime(formatted)
        }
      }
    }
  }

  const handleCopy = (text: string, field: string, label?: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success(label ? `已复制${label}: ${text.length > 40 ? text.substring(0, 40) + '...' : text}` : '已复制到剪贴板！')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleClear = () => {
    setTimestamp(''); setDatetime(''); setResult(null); setError('')
  }

  // Batch conversion
  const processBatch = () => {
    const lines = batchInput.split('\n').filter(line => line.trim())
    const results: BatchResult[] = lines.map(line => {
      try {
        const trimmed = line.trim()
        const tsNum = parseInt(trimmed)
        if (isNaN(tsNum)) return { input: trimmed, output: '', error: '格式不正确' }
        const normalized = trimmed.length > 10 ? Math.floor(tsNum / 1000) : tsNum
        const date = new Date(normalized * 1000)
        const formatted = new Intl.DateTimeFormat('zh-CN', { ...FORMAT_OPTIONS, timeZone: timezone }).format(date).replace(/\//g, '-')
        return { input: trimmed, output: formatted, seconds: normalized }
      } catch (err) {
        return { input: line.trim(), output: '', error: (err as Error).message }
      }
    })
    setBatchResults(results)
    const successCount = results.filter(r => !r.error).length
    toast.success(`批量转换完成：${successCount}/${results.length} 成功`)
  }

  // Timestamp calculator
  const handleCalcOffset = () => {
    if (!result) {
      setCalcError('请先转换一个时间戳')
      return
    }
    const match = calcOffset.trim().match(/^([+-])(\d+)([smhdwMy])$/)
    if (!match) {
      setCalcError('格式不正确，请使用如 +3h, -2d, +30m')
      return
    }
    const [, sign, numStr, unit] = match
    const num = parseInt(numStr) * (sign === '-' ? -1 : 1)
    const base = new Date(result.seconds * 1000)

    const unitMs: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 }
    if (unit === 'M') {
      base.setMonth(base.getMonth() + num)
    } else if (unit === 'y') {
      base.setFullYear(base.getFullYear() + num)
    } else {
      const ms = unitMs[unit]
      if (ms) base.setTime(base.getTime() + num * ms)
    }

    setCalcResult(buildResult(base, timezone))
    setCalcError('')
  }

  const ValidityBadge: React.FC<{ validity: string }> = ({ validity }) => {
    if (validity === 'empty') return null
    const config: Record<string, { dot: string; bg: string; border: string; text: string; label: string }> = {
      valid_seconds: { dot: 'bg-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-400', label: '秒级时间戳' },
      valid_milliseconds: { dot: 'bg-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', label: '毫秒级时间戳' },
      valid: { dot: 'bg-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-400', label: '有效日期' },
      invalid: { dot: 'bg-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', label: '格式无效' },
    }
    const c = config[validity]
    if (!c) return null
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.border} border`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        <span className={c.text}>{c.label}</span>
      </div>
    )
  }

  const ResultCard: React.FC<{ label: string; value: string; field: string; copyLabel: string; small?: boolean }> = ({ label, value, field, copyLabel, small }) => (
    <div
      onClick={() => handleCopy(value, field, copyLabel)}
      className={`rounded-lg p-3 border transition-all cursor-pointer ${
        copiedField === field
          ? 'border-green-500/40 bg-green-500/5 scale-[1.01]'
          : 'hover:bg-[var(--bg-hover)]'
      }`}
      style={{
        backgroundColor: copiedField === field ? undefined : 'color-mix(in srgb, var(--bg-card) 50%, transparent)',
        borderColor: copiedField === field ? undefined : 'var(--border)',
      }}
    >
      <div className="text-xs mb-1.5" style={{ color: 'var(--fg-faint)' }}>{label}</div>
      <div className="flex items-center justify-between gap-2">
        <span className={`font-mono truncate ${small ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--fg-secondary)' }}>{value}</span>
        <span className={`text-xs px-2 py-0.5 rounded transition-all flex-shrink-0 ${
          copiedField === field ? 'bg-green-500/20 text-green-400' : ''
        }`} style={copiedField !== field ? { color: 'var(--fg-muted)', backgroundColor: 'color-mix(in srgb, var(--fg) 10%, transparent)' } : undefined}>
          {copiedField === field ? '已复制' : '复制'}
        </span>
      </div>
    </div>
  )

  return (
    <div className="max-w-[90rem] mx-auto space-y-6 animate-fade-in px-4">
      {/* Header + Live Clock */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">时间戳转换</h2>
        <p style={{ color: 'var(--fg-muted)' }}>时间戳与日期时间相互转换</p>
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 40%, transparent)', border: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--fg-faint)' }}>当前:</span>
          <span className="font-mono" style={{ color: 'var(--accent)' }}>{liveTimestamp}</span>
          <span style={{ color: 'var(--fg-faint)' }}>|</span>
          <span className="font-mono" style={{ color: 'var(--fg-secondary)' }}>{liveFormatted}</span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setMode('single')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'single'
              ? 'th-btn-accent shadow-md'
              : 'th-btn-ghost'
          }`}
        >
          单个转换
        </button>
        <button
          onClick={() => setMode('batch')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'batch'
              ? 'th-btn-accent shadow-md'
              : 'th-btn-ghost'
          }`}
        >
          批量转换
        </button>
      </div>

      {mode === 'single' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-8 gap-4">
          {/* ===== Input Panel ===== */}
          <div className="glass rounded-xl p-5 space-y-4 h-fit">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>输入</label>
              <button
                onClick={handleClear}
                className="th-btn-danger px-3 py-1 rounded text-sm transition-colors"
              >
                清空
              </button>
            </div>

            {/* Example chips */}
            {!timestamp && !datetime && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs self-center mr-1" style={{ color: 'var(--fg-faint)' }}>示例:</span>
                {EXAMPLE_TIMESTAMPS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleTimestampChange(ex.value())}
                    className="th-tag px-2.5 py-1 rounded-md text-xs transition-all"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}

            {/* Timestamp input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>时间戳</label>
                <ValidityBadge validity={tsValidity} />
              </div>
              <input
                type="text"
                value={timestamp}
                onChange={(e) => handleTimestampChange(e.target.value)}
                placeholder="输入秒级或毫秒级时间戳"
                className={`w-full th-input rounded-lg px-4 py-3 text-base font-mono transition-all ${
                  tsValidity === 'invalid' ? 'border-red-500/50' :
                  tsValidity !== 'empty' ? 'border-green-500/30' : ''
                }`}
              />
            </div>

            {/* Swap button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="px-3 py-1.5 rounded-lg transition-all text-sm"
                style={{ color: 'var(--fg-faint)' }}
                title="交换时间戳和日期"
              >
                ↕ 交换
              </button>
            </div>

            {/* Datetime input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>日期时间</label>
                <ValidityBadge validity={dtValidity} />
              </div>
              <input
                type="text"
                value={datetime}
                onChange={(e) => handleDatetimeChange(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm:ss"
                className={`w-full th-input rounded-lg px-4 py-3 text-base font-mono transition-all ${
                  dtValidity === 'invalid' ? 'border-red-500/50' :
                  dtValidity === 'valid' ? 'border-green-500/30' : ''
                }`}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadCurrentTime}
                className="th-btn-accent px-6 py-2.5 rounded-lg transition-all text-sm font-semibold shadow-lg"
              >
                当前时间
              </button>
              <button
                onClick={() => { if (timestamp) convertTimestamp(timestamp); else if (datetime) convertDatetime(datetime) }}
                className="th-btn-ghost px-4 py-2.5 rounded-lg transition-all text-sm font-medium"
              >
                转换
              </button>
            </div>

            {/* Shortcut hints */}
            <div className="flex gap-4 text-xs flex-wrap" style={{ color: 'var(--fg-faint)' }}>
              <span><kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 80%, transparent)', color: 'var(--fg-faint)' }}>Ctrl</kbd>+<kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 80%, transparent)', color: 'var(--fg-faint)' }}>Enter</kbd> 转换</span>
              <span><kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 80%, transparent)', color: 'var(--fg-faint)' }}>Esc</kbd> 清空</span>
            </div>

            {/* Quick shortcuts */}
            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>快捷时间:</span>
              <div className="flex flex-wrap gap-2">
                {SHORTCUTS.map((sc, i) => (
                  <button
                    key={i}
                    onClick={() => handleTimestampChange(sc.compute().toString())}
                    className="th-tag px-2.5 py-1 rounded-md text-xs transition-all"
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>最近输入:</span>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => h.type === 'timestamp' ? handleTimestampChange(h.value) : handleDatetimeChange(h.value)}
                      className="th-tag px-2.5 py-1 rounded-md text-xs transition-all font-mono truncate max-w-[160px]"
                      title={h.value}
                    >
                      {h.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timezone */}
            <div className="space-y-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>时区</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="th-select px-2 py-1 rounded text-sm max-w-[220px]"
                >
                  {TIMEZONE_GROUPS.map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.zones.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 flex-wrap">
                {QUICK_TIMEZONES.map(tz => (
                  <button
                    key={tz.value}
                    onClick={() => setTimezone(tz.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      timezone === tz.value
                        ? 'th-btn-accent shadow-md'
                        : 'th-btn-ghost'
                    }`}
                  >
                    {tz.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== Result Panel ===== */}
          <div className="glass rounded-xl p-5 space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>转换结果</label>
              {result && (
                <button
                  onClick={() => {
                    const all = [
                      `本地时间: ${result.formatted}`,
                      `相对时间: ${result.relative}`,
                      `秒级时间戳: ${result.seconds}`,
                      `毫秒级时间戳: ${result.milliseconds}`,
                      `ISO 8601: ${result.iso}`,
                      `UTC: ${result.utc}`,
                      `中文格式: ${result.chineseReadable}`,
                      `时区: ${timezone}`,
                    ].join('\n')
                    handleCopy(all, 'all', '全部信息')
                  }}
                  className={`px-3 py-1 text-sm transition-all ${
                    copiedField === 'all'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 rounded'
                      : 'th-btn-ghost'
                  }`}
                >
                  {copiedField === 'all' ? '已复制' : '复制全部'}
                </button>
              )}
            </div>

            {error ? (
              <div className="th-panel-error p-4 rounded-lg text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </div>
            ) : result ? (
              <div className="space-y-4 flex-1">
                {/* Primary display */}
                <div className="text-center py-6 px-4 rounded-xl" style={{ background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent) 10%, transparent), color-mix(in srgb, var(--accent) 5%, transparent))', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
                  <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--fg-faint)' }}>{timezone}</div>
                  <div className="text-2xl md:text-3xl font-mono font-bold tracking-wide" style={{ color: 'var(--fg)' }}>
                    {result.formatted}
                  </div>
                  <div className="mt-2 text-sm font-medium" style={{ color: 'var(--accent)', opacity: 0.8 }}>
                    {result.relative} · {result.dayOfWeek}
                  </div>
                </div>

                {/* Detail cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ResultCard label="秒级时间戳" value={result.seconds.toString()} field="seconds" copyLabel="秒级时间戳" />
                  <ResultCard label="毫秒级时间戳" value={result.milliseconds.toString()} field="milliseconds" copyLabel="毫秒级时间戳" />
                  <ResultCard label="ISO 8601" value={result.iso} field="iso" copyLabel="ISO格式" small />
                  <ResultCard label="UTC" value={result.utc} field="utc" copyLabel="UTC格式" small />
                  <ResultCard label="RFC 2822" value={result.rfc2822} field="rfc2822" copyLabel="RFC 2822" small />
                  <ResultCard label="中文可读格式" value={result.chineseReadable} field="chinese" copyLabel="中文格式" small />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-[200px]">
                <div className="text-center" style={{ color: 'var(--fg-faint)' }}>
                  <div className="text-4xl mb-3 opacity-40">&#9201;</div>
                  <div className="text-sm">输入时间戳或日期开始转换</div>
                </div>
              </div>
            )}

            {/* Timestamp Calculator */}
            {result && (
              <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <label className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>时间计算器</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={calcOffset}
                    onChange={e => { setCalcOffset(e.target.value); setCalcError('') }}
                    placeholder="+3h, -2d, +30m, +1M"
                    className="flex-1 th-input rounded-lg px-3 py-2 text-sm font-mono transition-all"
                    onKeyDown={e => { if (e.key === 'Enter') handleCalcOffset() }}
                  />
                  <button
                    onClick={handleCalcOffset}
                    className="th-btn-soft px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    计算
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['+1h', '-1h', '+1d', '-1d', '+7d', '-7d', '+1M', '-1M'].map(offset => (
                    <button
                      key={offset}
                      onClick={() => { setCalcOffset(offset); }}
                      className="th-tag px-2 py-1 rounded text-xs transition-all"
                    >
                      {offset}
                    </button>
                  ))}
                </div>
                {calcError && (
                  <div className="text-xs text-red-400">{calcError}</div>
                )}
                {calcResult && (
                  <div
                    className="rounded-lg p-3 cursor-pointer transition-all"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 50%, transparent)', border: '1px solid var(--border)' }}
                    onClick={() => handleCopy(`${calcResult.seconds}`, 'calc', '计算结果时间戳')}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--fg-muted)' }}>计算结果:</span>
                      <span className="font-mono" style={{ color: 'var(--accent)' }}>{calcResult.formatted}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span style={{ color: 'var(--fg-faint)' }}>时间戳: {calcResult.seconds}</span>
                      <span style={{ color: 'var(--fg-faint)' }}>{calcResult.relative}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ===== Batch Mode ===== */
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-8 gap-4">
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>批量输入</label>
              <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>每行一个时间戳</span>
            </div>
            <textarea
              value={batchInput}
              onChange={e => setBatchInput(e.target.value)}
              placeholder={"每行一个时间戳，例如：\n1704067200\n1735689600\n1703980800000\n2147483647"}
              rows={12}
              className="w-full h-[28rem] th-input rounded-lg p-4 text-sm font-mono transition-all resize-y"
              spellCheck={false}
            />
            <div className="flex flex-wrap gap-3">
              <button
                onClick={processBatch}
                className="th-btn-accent px-6 py-2.5 rounded-lg transition-all text-sm font-semibold shadow-lg"
              >
                批量转换
              </button>
              <button
                onClick={() => {
                  if (batchResults.length > 0) {
                    const text = batchResults.map(r => `${r.input}\t${r.output || r.error}`).join('\n')
                    handleCopy(text, 'batchAll', '批量结果')
                  }
                }}
                className="th-btn-ghost px-4 py-2.5 rounded-lg transition-all text-sm font-medium"
              >
                复制全部结果
              </button>
              <button
                onClick={() => { setBatchInput(''); setBatchResults([]) }}
                className="px-4 py-2.5 rounded-lg transition-all text-sm"
                style={{ color: 'var(--fg-faint)' }}
              >
                清空
              </button>
            </div>

            {/* Timezone for batch */}
            <div className="flex gap-2 flex-wrap pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              {QUICK_TIMEZONES.map(tz => (
                <button
                  key={tz.value}
                  onClick={() => setTimezone(tz.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    timezone === tz.value
                      ? 'th-btn-accent shadow-md'
                      : 'th-btn-ghost'
                  }`}
                >
                  {tz.label}
                </button>
              ))}
            </div>
          </div>

          {/* Batch Results */}
          <div className="glass rounded-xl p-5 space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>批量结果</label>
              {batchResults.length > 0 && (
                <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>
                  {batchResults.filter(r => !r.error).length}/{batchResults.length} 成功
                </span>
              )}
            </div>

            {batchResults.length > 0 ? (
              <div className="space-y-2 overflow-y-auto max-h-[36rem]">
                {batchResults.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (r.output) handleCopy(r.output, `batch-${i}`, '转换结果')
                    }}
                    className={`flex items-center justify-between gap-4 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      r.error
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                        : copiedField === `batch-${i}`
                        ? 'bg-green-500/10 border border-green-500/30 cursor-pointer'
                        : 'cursor-pointer'
                    }`}
                    style={!r.error && copiedField !== `batch-${i}` ? { backgroundColor: 'color-mix(in srgb, var(--bg-card) 50%, transparent)', border: '1px solid var(--border)' } : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: 'var(--fg-faint)' }}>{i + 1}</span>
                      <span className="font-mono text-xs truncate" style={{ color: 'var(--fg-muted)' }}>{r.input}</span>
                    </div>
                    <span className={`font-mono flex-shrink-0 ${r.error ? 'text-red-400 text-xs' : ''}`} style={!r.error ? { color: 'var(--fg-secondary)' } : undefined}>
                      {r.output || r.error}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-[200px]">
                <div className="text-center" style={{ color: 'var(--fg-faint)' }}>
                  <div className="text-4xl mb-3 opacity-40">&#128203;</div>
                  <div className="text-sm">批量转换结果将显示在这里</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TimestampConverter
