import React, { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from '../components/Toast'
import * as jsonpath from 'jsonpath'
import JSONSyntaxHighlight from '../components/JSONSyntaxHighlight'

interface JSONPathState {
  jsonInput: string
  pathExpression: string
  queryResult: string
  error: string
  history: string[]
  isQuerying: boolean
}

interface QueryMetrics {
  executionTime: number
  resultCount: number
  pathDepth: number
}

const JSONPath: React.FC = () => {
  const [state, setState] = useState<JSONPathState>({
    jsonInput: '',
    pathExpression: '',
    queryResult: '',
    error: '',
    history: [],
    isQuerying: false
  })

  const [metrics, setMetrics] = useState<QueryMetrics>({
    executionTime: 0,
    resultCount: 0,
    pathDepth: 0
  })

  const jsonInputRef = useRef<HTMLTextAreaElement>(null)
  const pathInputRef = useRef<HTMLInputElement>(null)

  const [jsonDisplayMode, setJsonDisplayMode] = useState<'edit' | 'preview'>('edit')

  const sampleData = [
    {
      name: "张三",
      age: 25,
      skills: ["JavaScript", "React", "Node.js"],
      address: {
        city: "北京",
        street: "朝阳区建国路88号"
      },
      projects: [
        { id: 1, name: "ToolHub", stars: 1250 },
        { id: 2, name: "JSONPath工具", stars: 890 }
      ]
    },
    {
      users: [
        { id: 1, profile: { name: "Alice", tags: ["developer", "admin"] } },
        { id: 2, profile: { name: "Bob", tags: ["user", "tester"] } }
      ],
      metadata: { version: "1.0.0", timestamp: 1703836800000 }
    }
  ]

  const executeJSONPath = useCallback((json: string, path: string): { result: any; metrics: QueryMetrics } => {
    const startTime = performance.now()

    try {
      const data = JSON.parse(json)

      let result: any
      let resultCount = 0

      if (path === '$' || path.trim() === '') {
        result = data
        resultCount = 1
      } else {
        try {
          result = jsonpath.query(data, path)
          resultCount = Array.isArray(result) ? result.length : 1
        } catch (err) {
          try {
            const nodes = jsonpath.nodes(data, path)
            if (nodes.length > 0) {
              result = nodes.map((n: any) => n.value)
              resultCount = nodes.length
            } else {
              result = []
              resultCount = 0
            }
          } catch (nodesErr) {
            throw new Error(`JSONPath语法错误: ${(nodesErr as Error).message}`)
          }
        }
      }

      return {
        result,
        metrics: {
          executionTime: performance.now() - startTime,
          resultCount: resultCount,
          pathDepth: calculatePathDepth(path)
        }
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(`JSON解析失败: ${err.message}`)
      }
      throw new Error(`查询失败: ${(err as Error).message}`)
    }
  }, [])

  const calculatePathDepth = (path: string): number => {
    const cleanPath = path.replace(/^\\$/, '').replace(/[?@().><=!+\\-\\[\\]'\"`]/g, ' ')
    return cleanPath.split(/[.\\s]+/).filter(p => p && p !== '*' && p.length > 0).length
  }

  const handleQuery = () => {
    if (!state.jsonInput.trim() || !state.pathExpression.trim()) {
      setState(prev => ({ ...prev, error: '请输入JSON数据和JSONPath表达式' }))
      return
    }

    setState(prev => ({ ...prev, isQuerying: true, error: '' }))

    setTimeout(() => {
      try {
        const { result, metrics: newMetrics } = executeJSONPath(state.jsonInput, state.pathExpression)

        setState(prev => ({
          ...prev,
          queryResult: JSON.stringify(result, null, 2),
          error: '',
          isQuerying: false,
          history: prev.history.includes(prev.pathExpression)
            ? prev.history
            : [prev.pathExpression, ...prev.history].slice(0, 10)
        }))

        setMetrics(newMetrics)
        toast.success('查询成功！')
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: (err as Error).message,
          queryResult: '',
          isQuerying: false
        }))
        toast.error('查询失败')
      }
    }, 100)
  }

  const loadSample = (index: number) => {
    const sample = sampleData[index]
    setState(prev => ({
      ...prev,
      jsonInput: JSON.stringify(sample, null, 2),
      pathExpression: index === 0 ? '$.projects[*].name' : '$.users[*].profile.name',
      queryResult: '',
      error: ''
    }))
    setTimeout(() => pathInputRef.current?.focus(), 100)
  }

  const useHistory = (path: string) => {
    setState(prev => ({ ...prev, pathExpression: path }))
    pathInputRef.current?.focus()
  }

  const handleCopy = () => {
    if (state.queryResult) {
      navigator.clipboard.writeText(state.queryResult)
      toast.success('已复制到剪贴板！')
    }
  }

  const handleClearAll = () => {
    setState(prev => ({
      ...prev,
      jsonInput: '',
      pathExpression: '',
      queryResult: '',
      error: ''
    }))
    setMetrics({ executionTime: 0, resultCount: 0, pathDepth: 0 })
  }

  const handleSwap = () => {
    if (state.queryResult) {
      setState(prev => ({
        ...prev,
        jsonInput: prev.queryResult,
        queryResult: '',
        error: ''
      }))
    }
  }

  const handleFormatJSON = () => {
    if (!state.jsonInput.trim()) {
      toast.error('请输入JSON数据')
      return
    }

    try {
      const parsed = JSON.parse(state.jsonInput)
      const formatted = JSON.stringify(parsed, null, 2)
      setState(prev => ({ ...prev, jsonInput: formatted, error: '' }))
      setJsonDisplayMode('preview')
      toast.success('格式化成功！')
    } catch (err) {
      setState(prev => ({ ...prev, error: `格式化失败: ${(err as Error).message}` }))
      toast.error('JSON格式错误')
    }
  }

  const handleMinifyJSON = () => {
    if (!state.jsonInput.trim()) {
      toast.error('请输入JSON数据')
      return
    }

    try {
      const parsed = JSON.parse(state.jsonInput)
      const minified = JSON.stringify(parsed)
      setState(prev => ({ ...prev, jsonInput: minified, error: '' }))
      setJsonDisplayMode('edit')
      toast.success('压缩成功！')
    } catch (err) {
      setState(prev => ({ ...prev, error: `压缩失败: ${(err as Error).message}` }))
      toast.error('JSON格式错误')
    }
  }

  const handleValidateJSON = () => {
    if (!state.jsonInput.trim()) {
      toast.error('请输入JSON数据')
      return
    }

    try {
      JSON.parse(state.jsonInput)
      setState(prev => ({ ...prev, error: '✅ JSON格式正确！' }))
      toast.success('JSON格式正确！')
    } catch (err) {
      setState(prev => ({ ...prev, error: `❌ 格式错误: ${(err as Error).message}` }))
      toast.error('JSON格式错误')
    }
  }

  const handleClearJSON = () => {
    setState(prev => ({ ...prev, jsonInput: '', error: '' }))
    setJsonDisplayMode('edit')
  }

  const handleEdit = () => {
    setJsonDisplayMode('edit')
  }

  const handlePreview = () => {
    if (!state.jsonInput.trim()) {
      toast.error('请输入JSON数据')
      return
    }
    try {
      const parsed = JSON.parse(state.jsonInput)
      const formatted = JSON.stringify(parsed, null, 2)
      setState(prev => ({ ...prev, jsonInput: formatted, error: '' }))
      setJsonDisplayMode('preview')
      toast.success('已切换到预览模式')
    } catch (err) {
      setState(prev => ({ ...prev, error: `JSON格式错误: ${(err as Error).message}` }))
      toast.error('JSON格式错误')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setState(prev => ({ ...prev, jsonInput: value }))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleQuery()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        handleClearAll()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state.jsonInput, state.pathExpression])

  useEffect(() => {
    if (!state.jsonInput && jsonInputRef.current) {
      jsonInputRef.current.focus()
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">JSONPath查询工具</h2>
        <p style={{ color: 'var(--fg-muted)' }}>强大的JSON数据查询和提取工具，支持实时查询和历史记录</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-4 gap-3">
        {/* 左侧面板 - JSON输入 */}
        <div className="glass rounded-xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              JSON数据
            </label>
            <div className="flex gap-2">
              <button onClick={() => loadSample(0)} className="th-tag px-2 py-1 text-xs">
                示例1
              </button>
              <button onClick={() => loadSample(1)} className="th-tag px-2 py-1 text-xs">
                示例2
              </button>
            </div>
          </div>

          <div className="w-full h-[22rem] relative">
            {jsonDisplayMode === 'preview' ? (
              <div className="w-full h-full glass-code rounded-lg p-3 overflow-auto relative group" style={{ border: '1px solid var(--border-accent)' }}>
                <JSONSyntaxHighlight json={state.jsonInput} className="text-xs" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={handleEdit} className="th-btn-soft px-2 py-1 text-xs">
                    编辑
                  </button>
                </div>
              </div>
            ) : (
              <textarea
                ref={jsonInputRef}
                value={state.jsonInput}
                onChange={handleInputChange}
                placeholder="在此粘贴JSON数据..."
                className="w-full h-full th-input rounded-lg p-3 text-sm resize-none"
                spellCheck={false}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={handleFormatJSON} className="th-btn-soft px-3 py-2 text-sm">格式化</button>
            <button onClick={handleMinifyJSON} className="th-btn-ghost px-3 py-2 text-sm">压缩</button>
            <button onClick={handleValidateJSON} className="th-btn-ghost px-3 py-2 text-sm">验证</button>
            <button onClick={handleClearJSON} className="th-btn-danger px-3 py-2 text-sm">清空</button>
            <button
              onClick={handleSwap}
              disabled={!state.queryResult}
              className={`px-3 py-2 rounded-xl text-sm transition-all ${state.queryResult ? 'th-btn-ghost' : ''}`}
              style={!state.queryResult ? { background: 'var(--surface-hover)', color: 'var(--fg-faint)', cursor: 'not-allowed' } : undefined}
            >
              交换
            </button>
            {jsonDisplayMode === 'edit' && state.jsonInput.trim() && (
              <button onClick={handlePreview} className="th-btn-soft px-3 py-2 text-sm">预览</button>
            )}
          </div>
        </div>

        {/* 中间面板 - 路径操作 */}
        <div className="glass rounded-xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              JSONPath表达式
            </label>
            <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>Ctrl+Enter 查询 | Ctrl+K 清空</span>
          </div>

          <input
            ref={pathInputRef}
            type="text"
            value={state.pathExpression}
            onChange={(e) => setState(prev => ({ ...prev, pathExpression: e.target.value }))}
            placeholder="例如: $.users[*].name 或 $.data[0].id"
            className="w-full th-input rounded-lg px-3 py-2 text-sm"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuery}
              disabled={state.isQuerying}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                state.isQuerying ? '' : 'th-btn-accent'
              }`}
              style={state.isQuerying ? { background: 'var(--surface-hover)', color: 'var(--fg-faint)', cursor: 'wait' } : undefined}
            >
              {state.isQuerying ? '查询中...' : '执行查询'}
            </button>

            {metrics.resultCount > 0 && (
              <div className="flex gap-1 text-xs">
                <span className="th-badge-valid px-2 py-1 rounded">{metrics.resultCount}项</span>
                <span className="th-btn-soft px-2 py-1 rounded text-xs">{metrics.executionTime.toFixed(2)}ms</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium" style={{ color: 'var(--fg-faint)' }}>常用路径模板:</div>
            <div className="flex flex-wrap gap-2">
              {[
                '$.projects[*].name', '$.users[*].profile.name', '$..id', '$.*',
                '$[0:2]', '$.users[0].profile.tags[*]', '$.projects[?(@.stars > 1000)]', '$.users[?(@.profile.name)]'
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => setState(prev => ({ ...prev, pathExpression: template }))}
                  className="th-tag px-2 py-1 text-xs font-mono"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {state.history.length > 0 && (
            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-xs font-medium" style={{ color: 'var(--fg-faint)' }}>历史记录:</div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {state.history.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => useHistory(item)}
                    className="w-full text-left px-2 py-1 rounded text-xs font-mono truncate transition-all"
                    style={{ background: 'var(--surface-hover)', color: 'var(--fg-secondary)' }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.error && (
            <div className={`p-3 rounded-lg text-sm ${
              state.error.startsWith('✅') || state.error.includes('成功')
                ? 'th-panel-success' : 'th-panel-error'
            }`}>
              {state.error}
            </div>
          )}
        </div>

        {/* 右侧面板 - 查询结果 */}
        <div className="glass rounded-xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              查询结果
            </label>
            {state.queryResult && (
              <button onClick={handleCopy} className="th-btn-soft px-3 py-1 text-sm">复制</button>
            )}
          </div>

          <div className="w-full h-[22rem] glass-code rounded-lg p-3 overflow-auto relative">
            {state.queryResult ? (
              <JSONSyntaxHighlight json={state.queryResult} className="text-xs" />
            ) : (
              <div className="text-sm opacity-60 flex items-center justify-center h-full" style={{ color: 'var(--fg-faint)' }}>
                查询结果将显示在这里...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--fg)' }}>性能统计</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface-hover)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{metrics.resultCount}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>结果数量</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface-hover)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{metrics.executionTime.toFixed(2)}ms</div>
              <div className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>执行时间</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface-hover)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-2)' }}>{metrics.pathDepth}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>路径深度</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--fg)' }}>完整语法参考</h3>
          <div className="space-y-3 text-sm opacity-90" style={{ color: 'var(--fg-secondary)' }}>
            <div>
              <div className="font-semibold mb-1" style={{ color: 'var(--accent)' }}>基本操作符:</div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div><code>$</code> - 根对象/元素</div>
                <div><code>.</code> - 子成员操作符</div>
                <div><code>..</code> - 递归后代操作符</div>
                <div><code>*</code> - 通配符，匹配所有对象/元素</div>
                <div><code>[]</code> - 下标操作符</div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1" style={{ color: 'var(--accent-2)' }}>数组操作:</div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div><code>$[0]</code> - 第一个元素</div>
                <div><code>$[0,1]</code> - 前两个元素（联合）</div>
                <div><code>$[-1]</code> - 最后一个元素</div>
                <div><code>$[0:3]</code> - 前三个元素（切片）</div>
                <div><code>$[1:4:2]</code> - 从索引1开始，步长2，取4个</div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1" style={{ color: 'var(--success)' }}>过滤表达式:</div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div><code>$[?(@.price {`>`} 100)]</code> - 价格大于100</div>
                <div><code>$[?(@.isbn)]</code> - 包含isbn字段</div>
                <div><code>$..book[?(@.price {`<`} 10)]</code> - 便宜的书</div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1" style={{ color: 'var(--warning)' }}>实用技巧:</div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div>格式化后显示高亮预览，点击"编辑"按钮切换回编辑</div>
                <div>使用模板快速填充常用路径</div>
                <div>Ctrl+Enter 查询 | Ctrl+K 清空</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JSONPath
