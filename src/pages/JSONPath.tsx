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

  // JSON输入显示模式: 'edit' | 'preview'
  const [jsonDisplayMode, setJsonDisplayMode] = useState<'edit' | 'preview'>('edit')

  // 示例数据
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

  // JSONPath 查询实现 - 使用jsonpath库
  const executeJSONPath = useCallback((json: string, path: string): { result: any; metrics: QueryMetrics } => {
    const startTime = performance.now()

    try {
      const data = JSON.parse(json)

      // 使用jsonpath库执行查询
      let result: any
      let resultCount = 0

      // 处理根路径
      if (path === '$' || path.trim() === '') {
        result = data
        resultCount = 1
      } else {
        // 使用jsonpath查询
        try {
          result = jsonpath.query(data, path)
          resultCount = Array.isArray(result) ? result.length : 1
        } catch (err) {
          // 如果jsonpath查询失败，尝试使用nodes获取更多信息
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

  // 计算路径深度
  const calculatePathDepth = (path: string): number => {
    // 移除 $ 符号和特殊字符，计算实际的路径深度
    const cleanPath = path.replace(/^\\$/, '').replace(/[?@().><=!+\\-\\[\\]'\"`]/g, ' ')
    return cleanPath.split(/[.\\s]+/).filter(p => p && p !== '*' && p.length > 0).length
  }

  // 执行查询
  const handleQuery = () => {
    if (!state.jsonInput.trim() || !state.pathExpression.trim()) {
      setState(prev => ({ ...prev, error: '请输入JSON数据和JSONPath表达式' }))
      return
    }

    setState(prev => ({ ...prev, isQuerying: true, error: '' }))

    // 使用 setTimeout 避免阻塞UI
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

  // 快速填充示例
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

  // 使用历史记录
  const useHistory = (path: string) => {
    setState(prev => ({ ...prev, pathExpression: path }))
    pathInputRef.current?.focus()
  }

  // 复制结果
  const handleCopy = () => {
    if (state.queryResult) {
      navigator.clipboard.writeText(state.queryResult)
      toast.success('已复制到剪贴板！')
    }
  }

  // 清空所有
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

  // 交换输入输出
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

  // 格式化JSON - 显示高亮预览
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

  // 压缩JSON
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

  // 验证JSON
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

  // 清空JSON输入
  const handleClearJSON = () => {
    setState(prev => ({ ...prev, jsonInput: '', error: '' }))
    setJsonDisplayMode('edit')
  }

  // 切换到编辑模式
  const handleEdit = () => {
    setJsonDisplayMode('edit')
  }

  // 切换到预览模式
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

  // 监听输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setState(prev => ({ ...prev, jsonInput: value }))
  }

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter 执行查询
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleQuery()
      }
      // Ctrl/Cmd + K 清空
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        handleClearAll()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state.jsonInput, state.pathExpression])

  // 自动聚焦
  useEffect(() => {
    if (!state.jsonInput && jsonInputRef.current) {
      jsonInputRef.current.focus()
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* 标题区域 */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text neon-text">JSONPath查询工具</h2>
        <p className="text-slate-400">强大的JSON数据查询和提取工具，支持实时查询和历史记录</p>
      </div>

      {/* 三面板布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-4 gap-3">

        {/* 左侧面板 - JSON输入 */}
        <div className="glass rounded-xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-indigo-400">📄</span>JSON数据
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => loadSample(0)}
                className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30 text-xs transition-colors"
                title="加载示例1"
              >
                示例1
              </button>
              <button
                onClick={() => loadSample(1)}
                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 text-xs transition-colors"
                title="加载示例2"
              >
                示例2
              </button>
            </div>
          </div>

          {/* 输入区域 - 根据模式显示编辑器或预览 */}
          <div className="w-full h-[18rem] relative">
            {jsonDisplayMode === 'preview' ? (
              <div className="w-full h-full glass-code rounded-lg p-3 overflow-auto border border-blue-500/30 relative group">
                <JSONSyntaxHighlight
                  json={state.jsonInput}
                  className="text-xs"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleEdit}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 text-xs transition-colors"
                    title="切换到编辑模式"
                  >
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
                className="w-full h-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-200 focus:outline-none input-glow transition-all resize-none"
                spellCheck={false}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFormatJSON}
              className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 text-sm transition-colors"
              title="格式化JSON并显示高亮预览"
            >
              格式化
            </button>
            <button
              onClick={handleMinifyJSON}
              className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 text-sm transition-colors"
              title="压缩JSON"
            >
              压缩
            </button>
            <button
              onClick={handleValidateJSON}
              className="px-3 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 text-sm transition-colors"
              title="验证JSON格式"
            >
              验证
            </button>
            <button
              onClick={handleClearJSON}
              className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm transition-colors"
              title="清空JSON输入"
            >
              清空
            </button>
            <button
              onClick={handleSwap}
              disabled={!state.queryResult}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                state.queryResult
                  ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
              title="将查询结果交换到输入框"
            >
              交换
            </button>
            {/* 预览/编辑切换按钮 */}
            {jsonDisplayMode === 'edit' && state.jsonInput.trim() && (
              <button
                onClick={handlePreview}
                className="px-3 py-2 bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/30 text-sm transition-colors"
                title="切换到预览模式"
              >
                预览
              </button>
            )}
          </div>
        </div>

        {/* 中间面板 - 路径操作 */}
        <div className="glass rounded-xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-cyan-400">🔍</span>JSONPath表达式
            </label>
            <span className="text-xs text-slate-400">Ctrl+Enter 查询 | Ctrl+K 清空</span>
          </div>

          <input
            ref={pathInputRef}
            type="text"
            value={state.pathExpression}
            onChange={(e) => setState(prev => ({ ...prev, pathExpression: e.target.value }))}
            placeholder="例如: $.users[*].name 或 $.data[0].id"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-200 focus:outline-none input-glow transition-all"
          />

          {/* 查询按钮和状态 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuery}
              disabled={state.isQuerying}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                state.isQuerying
                  ? 'bg-slate-600/50 text-slate-400 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
              }`}
            >
              {state.isQuerying ? '查询中...' : '执行查询'}
            </button>

            {/* 指标显示 */}
            {metrics.resultCount > 0 && (
              <div className="flex gap-1 text-xs">
                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
                  {metrics.resultCount}项
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                  {metrics.executionTime.toFixed(2)}ms
                </span>
              </div>
            )}
          </div>

          {/* 常用路径模板 */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">常用路径模板:</div>
            <div className="flex flex-wrap gap-2">
              {[
                '$.projects[*].name',
                '$.users[*].profile.name',
                '$..id',
                '$.*',
                '$[0:2]',
                '$.users[0].profile.tags[*]',
                '$.projects[?(@.stars > 1000)]',
                '$.users[?(@.profile.name)]'
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => setState(prev => ({ ...prev, pathExpression: template }))}
                  className="px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-slate-300 transition-colors border border-slate-600/50 font-mono"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* 历史记录 */}
          {state.history.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-xs text-slate-400 font-medium">历史记录:</div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {state.history.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => useHistory(item)}
                    className="w-full text-left px-2 py-1 bg-slate-800/50 hover:bg-slate-700/50 rounded text-xs text-slate-300 transition-colors font-mono truncate"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 错误/状态提示 */}
          {state.error && (
            <div className={`p-3 rounded-lg text-sm border ${
              state.error.startsWith('✅') || state.error.includes('成功')
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {state.error}
            </div>
          )}
        </div>

        {/* 右侧面板 - 查询结果 */}
        <div className="glass rounded-xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-emerald-400">📊</span>查询结果
            </label>
            {state.queryResult && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 text-sm transition-colors"
                  title="复制结果到剪贴板"
                >
                  复制
                </button>
              </div>
            )}
          </div>

          <div className="w-full h-[18rem] glass-code rounded-lg p-3 overflow-auto relative">
            {state.queryResult ? (
              <JSONSyntaxHighlight
                json={state.queryResult}
                className="text-xs"
              />
            ) : (
              <div className="text-slate-500 text-sm opacity-60 flex items-center justify-center h-full">
                查询结果将显示在这里...
              </div>
            )}
          </div>

          {/* 路径语法帮助 */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="text-xs text-slate-400 font-medium">jsonpath语法说明:</div>
            <div className="text-xs text-slate-300 space-y-1 opacity-80">
              <div className="flex justify-between">
                <span>$</span>
                <span className="text-slate-500">根对象</span>
              </div>
              <div className="flex justify-between">
                <span>$.key</span>
                <span className="text-slate-500">子节点</span>
              </div>
              <div className="flex justify-between">
                <span>$..key</span>
                <span className="text-slate-500">递归后代</span>
              </div>
              <div className="flex justify-between">
                <span>$.*</span>
                <span className="text-slate-500">通配符</span>
              </div>
              <div className="flex justify-between">
                <span>$[0]</span>
                <span className="text-slate-500">数组下标</span>
              </div>
              <div className="flex justify-between">
                <span>$[start:end:step]</span>
                <span className="text-slate-500">数组切片</span>
              </div>
              <div className="flex justify-between">
                <span>$[0,1]</span>
                <span className="text-slate-500">联合操作</span>
              </div>
              <div className="flex justify-between">
                <span>$[?(@.price {`>`} 100)]</span>
                <span className="text-slate-500">过滤表达式</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 性能统计和说明 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">性能统计</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">{metrics.resultCount}</div>
              <div className="text-xs text-slate-400 mt-1">结果数量</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{metrics.executionTime.toFixed(2)}ms</div>
              <div className="text-xs text-slate-400 mt-1">执行时间</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{metrics.pathDepth}</div>
              <div className="text-xs text-slate-400 mt-1">路径深度</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">完整语法参考</h3>
          <div className="space-y-3 text-sm text-slate-300 opacity-90">
            <div>
              <div className="font-semibold text-cyan-300 mb-1">基本操作符:</div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div><code>$</code> - 根对象/元素</div>
                <div><code>.</code> - 子成员操作符</div>
                <div><code>..</code> - 递归后代操作符</div>
                <div><code>*</code> - 通配符，匹配所有对象/元素</div>
                <div><code>[]</code> - 下标操作符</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-purple-300 mb-1">数组操作:</div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div><code>$[0]</code> - 第一个元素</div>
                <div><code>$[0,1]</code> - 前两个元素（联合）</div>
                <div><code>$[-1]</code> - 最后一个元素</div>
                <div><code>$[0:3]</code> - 前三个元素（切片）</div>
                <div><code>$[1:4:2]</code> - 从索引1开始，步长2，取4个</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-300 mb-1">过滤表达式:</div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div><code>$[?(@.price {`>`} 100)]</code> - 价格大于100</div>
                <div><code>$[?(@.isbn)]</code> - 包含isbn字段</div>
                <div><code>$..book[?(@.price {`<`} 10)]</code> - 便宜的书</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-yellow-300 mb-1">实用技巧:</div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div>• 格式化后显示高亮预览，点击"编辑"按钮切换回编辑</div>
                <div>• 预览模式下内容为只读，点击右上角"编辑"按钮修改</div>
                <div>• 使用模板快速填充常用路径</div>
                <div>• 历史记录保存最近10条查询</div>
                <div>• Ctrl+Enter 查询 | Ctrl+K 清空</div>
                <div>• jsonpath库支持完整标准语法</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JSONPath
