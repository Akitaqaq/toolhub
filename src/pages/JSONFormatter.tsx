import React, { useState, useEffect, useRef, useMemo } from 'react'
import JSONSyntaxHighlight from '../components/JSONSyntaxHighlight'
import CollapsibleJSONTree from '../components/CollapsibleJSONTree'
import { toast } from '../components/Toast'

interface JSONState {
  input: string
  output: string
  error: string
  indent: 2 | 4 | 8
  viewMode: 'highlight' | 'tree'
}

type JSONValidity = 'empty' | 'valid' | 'invalid'

const JSONFormatter: React.FC = () => {
  const [state, setState] = useState<JSONState>({
    input: '',
    output: '',
    error: '',
    indent: 2,
    viewMode: 'highlight',
  })
  const [validity, setValidity] = useState<JSONValidity>('empty')
  const debounceTimerRef = useRef<number | null>(null)

  // 实时验证JSON有效性（防抖）
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!state.input.trim()) {
      setValidity('empty')
      return
    }

    debounceTimerRef.current = window.setTimeout(() => {
      try {
        smartParseJSON(state.input)
        setValidity('valid')
      } catch {
        setValidity('invalid')
      }
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [state.input])

  /**
   * 智能解析JSON，支持转义字符串形式的JSON
   * 例如: "{\n  \"name\": \"test\"}" 可以正确解析
   */
  const smartParseJSON = (input: string): unknown => {
    const trimmed = input.trim()

    try {
      // 第一次尝试：直接解析
      const result = JSON.parse(trimmed)

      // 如果解析结果是字符串，且看起来像JSON，尝试再次解析
      if (typeof result === 'string' && result.length > 0) {
        const trimmedResult = result.trim()
        // 检查是否以 { 或 [ 开头（常见JSON开头）
        if (trimmedResult.startsWith('{') || trimmedResult.startsWith('[')) {
          try {
            return JSON.parse(result)
          } catch {
            // 如果二次解析失败，返回原始字符串
            return result
          }
        }
      }

      return result
    } catch (err) {
      throw err
    }
  }

  const handleFormat = () => {
    try {
      const parsed = smartParseJSON(state.input)
      const formatted = JSON.stringify(parsed, null, state.indent)
      const lineCount = formatted.split('\n').length
      const charCount = formatted.length
      setState(prev => ({ ...prev, output: formatted, error: '' }))
      toast.success(`格式化完成，共 ${lineCount} 行，${charCount} 字符`)
    } catch (err) {
      setState(prev => ({ ...prev, error: (err as Error).message, output: '' }))
    }
  }

  const handleMinify = () => {
    try {
      const parsed = smartParseJSON(state.input)
      const minified = JSON.stringify(parsed)
      const originalSize = state.input.length
      const minifiedSize = minified.length
      const ratio = ((1 - minifiedSize / originalSize) * 100).toFixed(1)
      setState(prev => ({ ...prev, output: minified, error: '' }))
      toast.success(`压缩完成，减少 ${ratio}%（${originalSize} → ${minifiedSize} 字符）`)
    } catch (err) {
      setState(prev => ({ ...prev, error: (err as Error).message, output: '' }))
    }
  }

  const handleValidate = () => {
    try {
      smartParseJSON(state.input)
      setState(prev => ({ ...prev, error: '✅ JSON格式正确！', output: '' }))
    } catch (err) {
      setState(prev => ({ ...prev, error: `❌ 错误: ${(err as Error).message}`, output: '' }))
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板！')
  }

  const handleClear = () => {
    setState({ input: '', output: '', error: '', indent: 2, viewMode: state.viewMode })
  }

  const toggleViewMode = () => {
    setState(prev => ({ ...prev, viewMode: prev.viewMode === 'tree' ? 'highlight' : 'tree' }))
  }

  const handleIndentChange = (value: string) => {
    setState(prev => ({ ...prev, indent: parseInt(value) as 2 | 4 | 8 }))
  }

  // 缓存解析后的JSON对象，避免重复解析
  const parsedOutput = useMemo(() => {
    if (!state.output) return null
    try {
      return JSON.parse(state.output)
    } catch {
      return null
    }
  }, [state.output])

  return (
    <div className="max-w-[90rem] mx-auto space-y-6 animate-fade-in px-4">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">JSON格式化工具</h2>
        <p style={{ color: 'var(--fg-muted)' }}>支持JSON格式化、验证、压缩和转换</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-8 gap-4">
        {/* 输入区域 */}
        <div className="glass rounded-xl p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>输入JSON</label>
            <div className="flex items-center space-x-2">
              <select
                value={state.indent}
                onChange={(e) => handleIndentChange(e.target.value)}
                className="th-select px-2 py-1 rounded text-sm"
              >
                <option value="2">2空格</option>
                <option value="4">4空格</option>
                <option value="8">8空格</option>
              </select>
              <button
                onClick={handleClear}
                className="th-btn-danger px-3 py-1 rounded text-sm transition-colors"
              >
                清空
              </button>
            </div>
          </div>

          {/* 示例数据 - 紧凑显示 */}
          {!state.input && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs self-center mr-1" style={{ color: 'var(--fg-faint)' }}>示例:</span>
              {[
                '{"name":"张三","age":25,"skills":["JavaScript","React","Node.js"]}',
                '[{"id":1,"title":"测试","completed":false},{"id":2,"title":"开发","completed":true}]',
                '{"user":{"id":123,"profile":{"nickname":"小明","tags":["开发者","开源爱好者"]}}}',
              ].map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setState(prev => ({ ...prev, input: sample, error: '', output: '' }))}
                  className="th-tag px-2.5 py-1 rounded-md text-xs transition-all"
                >
                  示例{index + 1}
                </button>
              ))}
              <button
                onClick={() => setState(prev => ({
                  ...prev,
                  input: '"{\\n  \\"name\\": \\"AlphaGo\\",\\n  \\"year\\": 2016,\\n  \\"tags\\": [\\"AI\\", \\"Go\\", \\"DeepMind\\"],\\n  \\"won\\": true,\\n  \\"score\\": 4.5\\n}"',
                  error: '',
                  output: ''
                }))}
                className="th-tag px-2.5 py-1 rounded-md text-xs transition-all"
              >
                转义字符串
              </button>
            </div>
          )}

          {/* JSON有效性状态指示器 */}
          {state.input && (
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                validity === 'valid'
                  ? 'th-badge-valid'
                  : validity === 'invalid'
                  ? 'th-badge-invalid'
                  : ''
              }`} style={validity === 'empty' ? { background: 'var(--surface)', color: 'var(--fg-faint)', border: '1px solid var(--border)' } : undefined}>
                <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: validity === 'valid' ? 'var(--success)' : validity === 'invalid' ? 'var(--error)' : 'var(--fg-faint)' }} />
                {validity === 'valid' ? '有效JSON' : validity === 'invalid' ? '无效JSON' : '空'}
              </div>
            </div>
          )}

          <textarea
            value={state.input}
            onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
            placeholder="在此粘贴JSON数据..."
            className="th-input w-full h-[28rem] xl:h-[38rem] rounded-lg p-4 text-sm font-mono transition-all resize-y"
            spellCheck={false}
          />

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleFormat}
              className="th-btn-accent px-6 py-2.5 text-sm font-semibold"
            >
              ✨ 格式化
            </button>
            <button
              onClick={handleMinify}
              className="th-btn-ghost px-4 py-2.5 text-sm font-medium"
            >
              压缩
            </button>
            <button
              onClick={handleValidate}
              className="th-btn-ghost px-4 py-2.5 text-sm font-medium"
            >
              验证
            </button>
          </div>
        </div>

        {/* 输出区域 */}
        <div className="glass rounded-xl p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>输出结果</label>
            <div className="flex gap-2 items-center">
              {state.output && (
                <button
                  onClick={() => handleCopy(state.output)}
                  className="th-btn-ghost px-3 py-1 text-sm"
                >
                  复制
                </button>
              )}
              {state.output && (
                <button
                  onClick={toggleViewMode}
                  className="th-btn-soft px-3 py-1 rounded text-sm transition-colors"
                >
                  {state.viewMode === 'highlight' ? '🔍 高亮视图' : '📋 树形视图'}
                </button>
              )}
            </div>
          </div>

          {state.error && (
            <div className={`p-3 rounded-lg text-sm border ${
              state.error.startsWith('✅')
                ? 'th-panel-success'
                : 'th-panel-error'
            }`}>
              {state.error}
            </div>
          )}

          <div className="w-full h-[28rem] xl:h-[38rem] glass-code rounded-lg p-4 overflow-auto resize-y">
            {state.output ? (
              state.viewMode === 'tree' && parsedOutput ? (
                <CollapsibleJSONTree
                  data={parsedOutput}
                  className="h-full"
                />
              ) : (
                <JSONSyntaxHighlight
                  json={state.output}
                  className="h-full json-highlight"
                />
              )
            ) : (
              <div className="text-sm opacity-60" style={{ color: 'var(--fg-faint)' }}>格式化后的结果将显示在这里...</div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

export default JSONFormatter
