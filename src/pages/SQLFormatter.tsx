import React, { useState } from 'react'
import { format } from 'sql-formatter'
import SQLSyntaxHighlight from '../components/SQLSyntaxHighlight'
import { toast } from '../components/Toast'

interface SQLState {
  input: string
  output: string
  error: string
  language: 'sql' | 'mysql' | 'postgresql' | 'sqlite' | 'tsql' | 'bigquery'
  indent: 2 | 4 | 8
  keywordCase: 'upper' | 'lower' | 'preserve'
}

const SQLFormatter: React.FC = () => {
  const [state, setState] = useState<SQLState>({
    input: '',
    output: '',
    error: '',
    language: 'sql',
    indent: 2,
    keywordCase: 'upper',
  })

  const handleFormat = () => {
    try {
      if (!state.input.trim()) {
        setState(prev => ({ ...prev, error: '请输入SQL语句', output: '' }))
        return
      }
      const formatted = format(state.input, {
        language: state.language,
        tabWidth: state.indent,
        keywordCase: state.keywordCase,
      })
      setState(prev => ({ ...prev, output: formatted, error: '' }))
    } catch (err) {
      setState(prev => ({ ...prev, error: `❌ 格式化错误: ${(err as Error).message}`, output: '' }))
    }
  }

  const handleMinify = () => {
    try {
      if (!state.input.trim()) {
        setState(prev => ({ ...prev, error: '请输入SQL语句', output: '' }))
        return
      }
      // 先格式化，再移除多余空白和换行
      const formatted = format(state.input, {
        language: state.language,
        tabWidth: 0,
        keywordCase: state.keywordCase,
      })
      // 压缩：移除换行和多余空格，保留关键字之间的单个空格
      const minified = formatted
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      setState(prev => ({ ...prev, output: minified, error: '' }))
    } catch (err) {
      // 如果格式化失败，尝试简单压缩
      const minified = state.input
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      setState(prev => ({ ...prev, output: minified, error: '' }))
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板！')
  }

  const handleClear = () => {
    setState(prev => ({ ...prev, input: '', output: '', error: '' }))
  }

  const setLanguage = (language: SQLState['language']) => {
    setState(prev => ({ ...prev, language }))
  }

  const setIndent = (indent: SQLState['indent']) => {
    setState(prev => ({ ...prev, indent }))
  }

  const setKeywordCase = (keywordCase: SQLState['keywordCase']) => {
    setState(prev => ({ ...prev, keywordCase }))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">SQL格式化工具</h2>
        <p className="text-slate-400">支持SQL美化、压缩和多数据库方言</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 gap-4">
        {/* 输入区域 */}
        <div className="glass rounded-xl p-4 space-y-3 h-fit">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-lg font-semibold text-white">输入SQL</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClear}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm transition-colors"
              >
                清空
              </button>
            </div>
          </div>

          {/* 配置选项 */}
          <div className="flex flex-wrap gap-2">
            <select
              value={state.language}
              onChange={(e) => setLanguage(e.target.value as SQLState['language'])}
              className="bg-slate-800 text-white px-2 py-1 rounded text-sm border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              <option value="sql">标准SQL</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="sqlite">SQLite</option>
              <option value="tsql">T-SQL</option>
              <option value="bigquery">BigQuery</option>
            </select>
            <select
              value={state.indent}
              onChange={(e) => setIndent(parseInt(e.target.value) as SQLState['indent'])}
              className="bg-slate-800 text-white px-2 py-1 rounded text-sm border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              <option value="2">2空格</option>
              <option value="4">4空格</option>
              <option value="8">8空格</option>
            </select>
            <select
              value={state.keywordCase}
              onChange={(e) => setKeywordCase(e.target.value as SQLState['keywordCase'])}
              className="bg-slate-800 text-white px-2 py-1 rounded text-sm border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              <option value="upper">关键字大写</option>
              <option value="lower">关键字小写</option>
              <option value="preserve">保持原样</option>
            </select>
          </div>

          <textarea
            value={state.input}
            onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
            placeholder="在此粘贴SQL语句..."
            className="w-full h-[22rem] lg:h-[30rem] bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-200 focus:outline-none input-glow transition-all"
            spellCheck={false}
          />

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFormat}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm font-medium"
            >
              格式化
            </button>
            <button
              onClick={handleMinify}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all text-sm font-medium"
            >
              压缩
            </button>
          </div>
        </div>

        {/* 输出区域 */}
        <div className="glass rounded-xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-lg font-semibold text-white">输出结果</label>
            {state.output && (
              <button
                onClick={() => handleCopy(state.output)}
                className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 text-sm transition-colors"
              >
                复制
              </button>
            )}
          </div>

          {state.error && (
            <div className={`p-3 rounded-lg text-sm border ${
              state.error.startsWith('❌')
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}>
              {state.error}
            </div>
          )}

          <div className="w-full h-[22rem] lg:h-[30rem] glass-code rounded-lg p-3 overflow-auto">
            {state.output ? (
              <SQLSyntaxHighlight sql={state.output} className="h-full" />
            ) : (
              <div className="text-slate-500 text-sm opacity-60">格式化后的结果将显示在这里...</div>
            )}
          </div>
        </div>
      </div>

      {/* 示例数据 */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">示例SQL数据</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'SELECT u.id, u.name, u.email FROM users u WHERE u.status = "active" AND u.created_at > "2024-01-01" ORDER BY u.created_at DESC LIMIT 10',
            'SELECT p.id, p.title, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.price > 100',
            'INSERT INTO users (name, email, password, status) VALUES ("张三", "zhangsan@example.com", "secret123", "active")',
            'UPDATE orders SET status = "shipped", shipped_at = NOW() WHERE id = 123 AND status = "paid"'
          ].map((sample, index) => (
            <button
              key={index}
              onClick={() => setState(prev => ({ ...prev, input: sample, error: '', output: '' }))}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-slate-300 transition-colors border border-slate-600/50"
            >
              {['查询示例', '联表查询', '插入示例', '更新示例'][index]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SQLFormatter
