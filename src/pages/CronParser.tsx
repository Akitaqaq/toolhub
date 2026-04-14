import React, { useState, useEffect } from 'react'
import CronExpressionParser from 'cron-parser'
import cronstrue from 'cronstrue/i18n'
import { toast } from '../components/Toast'

interface CronState {
  input: string
  description: string
  nextRuns: string[]
  error: string
}

const presetMap: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
}

const normalizeExpression = (expr: string): string => {
  const trimmed = expr.trim()
  if (presetMap[trimmed]) {
    return presetMap[trimmed]
  }
  return trimmed
}

const CronParser: React.FC = () => {
  const [state, setState] = useState<CronState>({
    input: '',
    description: '',
    nextRuns: [],
    error: '',
  })

  useEffect(() => {
    if (!state.input.trim()) {
      setState(prev => ({ ...prev, description: '', nextRuns: [], error: '' }))
      return
    }

    try {
      const normalized = normalizeExpression(state.input)

      // 验证并计算下次执行时间
      const interval = CronExpressionParser.parse(normalized)
      const runs: string[] = []
      for (let i = 0; i < 5; i++) {
        const next = interval.next()
        runs.push(next.toDate().toLocaleString('zh-CN'))
      }

      // 生成可读描述
      const description = cronstrue.toString(normalized, { locale: 'zh_CN' })

      setState(prev => ({
        ...prev,
        description,
        nextRuns: runs,
        error: '',
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        description: '',
        nextRuns: [],
        error: `❌ 解析错误: ${(err as Error).message}`,
      }))
    }
  }, [state.input])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板！')
  }

  const examples = [
    { label: '每分钟', value: '* * * * *' },
    { label: '每小时', value: '0 * * * *' },
    { label: '每天9点', value: '0 9 * * *' },
    { label: '每周一9点', value: '0 9 * * 1' },
    { label: '每5分钟', value: '*/5 * * * *' },
    { label: '每天午夜', value: '@daily' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">Cron 表达式解析</h2>
        <p className="text-slate-400">解析 Cron 表达式，查看可读描述和下次执行时间</p>
      </div>

      <div className="glass rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-lg font-semibold text-white">Cron 表达式</label>
          <button
            onClick={() => setState(prev => ({ ...prev, input: '', description: '', nextRuns: [], error: '' }))}
            className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm transition-colors"
          >
            清空
          </button>
        </div>

        <input
          type="text"
          value={state.input}
          onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
          placeholder="例如: */5 * * * *"
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-base font-mono text-slate-200 focus:outline-none input-glow transition-all"
          spellCheck={false}
        />

        {state.error && (
          <div className="p-3 rounded-lg text-sm border bg-red-500/10 border-red-500/30 text-red-400">
            {state.error}
          </div>
        )}

        {state.description && !state.error && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="text-sm text-slate-400 mb-1">含义描述</div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-lg md:text-xl font-medium text-white">
                {state.description}
              </div>
              <button
                onClick={() => handleCopy(state.description)}
                className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 text-sm transition-colors shrink-0"
              >
                复制
              </button>
            </div>
          </div>
        )}

        {state.nextRuns.length > 0 && !state.error && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-sm text-slate-400 mb-2">未来 5 次执行时间</div>
            <ul className="space-y-2">
              {state.nextRuns.map((run, index) => (
                <li key={index} className="flex items-center justify-between gap-4">
                  <span className="text-slate-200 font-mono text-sm">{run}</span>
                  <button
                    onClick={() => handleCopy(run)}
                    className="px-2 py-1 bg-white/10 text-white rounded hover:bg-white/20 text-xs transition-colors shrink-0"
                  >
                    复制
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">常用示例</h3>
        <div className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example.value}
              onClick={() => setState(prev => ({ ...prev, input: example.value }))}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-slate-300 transition-colors border border-slate-600/50"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CronParser
