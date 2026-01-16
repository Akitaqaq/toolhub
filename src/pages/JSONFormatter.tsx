import React, { useState } from 'react'
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

const JSONFormatter: React.FC = () => {
  const [state, setState] = useState<JSONState>({
    input: '',
    output: '',
    error: '',
    indent: 2,
    viewMode: 'highlight',
  })

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
      setState(prev => ({ ...prev, output: formatted, error: '' }))
    } catch (err) {
      setState(prev => ({ ...prev, error: (err as Error).message, output: '' }))
    }
  }

  const handleMinify = () => {
    try {
      const parsed = smartParseJSON(state.input)
      const minified = JSON.stringify(parsed)
      setState(prev => ({ ...prev, output: minified, error: '' }))
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">JSON格式化工具</h2>
        <p className="text-slate-400">支持JSON格式化、验证、压缩和转换</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 gap-4">
        {/* 输入区域 */}
        <div className="glass rounded-xl p-4 space-y-3 h-fit">
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold text-white">输入JSON</label>
            <div className="flex items-center space-x-2">
              <select
                value={state.indent}
                onChange={(e) => handleIndentChange(e.target.value)}
                className="bg-slate-800 text-white px-2 py-1 rounded text-sm border border-slate-600 focus:outline-none focus:border-indigo-500"
              >
                <option value="2">2空格</option>
                <option value="4">4空格</option>
                <option value="8">8空格</option>
              </select>
              <button
                onClick={handleClear}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm transition-colors"
              >
                清空
              </button>
            </div>
          </div>
          <textarea
            value={state.input}
            onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
            placeholder="在此粘贴JSON数据..."
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
            <button
              onClick={handleValidate}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium"
            >
              验证
            </button>
          </div>
        </div>

        {/* 输出区域 */}
        <div className="glass rounded-xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-lg font-semibold text-white">输出结果</label>
            <div className="flex gap-2 items-center">
              {state.output && (
                <button
                  onClick={() => handleCopy(state.output)}
                  className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 text-sm transition-colors"
                >
                  复制
                </button>
              )}
              {state.output && (
                <button
                  onClick={toggleViewMode}
                  className={`px-3 py-1 rounded text-sm transition-colors border ${
                    state.viewMode === 'highlight'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
                  }`}
                >
                  {state.viewMode === 'highlight' ? '🔍 高亮视图' : '📋 树形视图'}
                </button>
              )}
            </div>
          </div>

          {state.error && (
            <div className={`p-3 rounded-lg text-sm border ${
              state.error.startsWith('✅')
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {state.error}
            </div>
          )}

          <div className="w-full h-[22rem] lg:h-[30rem] glass-code rounded-lg p-3 overflow-auto">
            {state.output ? (
              state.viewMode === 'tree' ? (
                <CollapsibleJSONTree
                  data={JSON.parse(state.output)}
                  className="h-full"
                />
              ) : (
                <JSONSyntaxHighlight
                  json={state.output}
                  className="h-full json-highlight"
                />
              )
            ) : (
              <div className="text-slate-500 text-sm opacity-60">格式化后的结果将显示在这里...</div>
            )}
          </div>
        </div>
      </div>

      {/* 示例数据 */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">示例JSON数据</h3>
        <div className="flex flex-wrap gap-2">
          {[
            '{"name":"张三","age":25,"skills":["JavaScript","React","Node.js"]}',
            '[{"id":1,"title":"测试","completed":false},{"id":2,"title":"开发","completed":true}]',
            '{"user":{"id":123,"profile":{"nickname":"小明","tags":["开发者","开源爱好者"]}}}',
            '"{\\n  \\"name\\": \\"AlphaGo\\",\\n  \\"year\\": 2016,\\n  \\"tags\\": [\\"AI\\", \\"Go\\", \\"DeepMind\\"],\\n  \\"won\\": true,\\n  \\"score\\": 4.5\\n}"'
          ].map((sample, index) => (
            <button
              key={index}
              onClick={() => setState(prev => ({ ...prev, input: sample, error: '', output: '' }))}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-slate-300 transition-colors border border-slate-600/50"
            >
              {index < 3 ? `示例 ${index + 1}` : '转义字符串'}
            </button>
          ))}
        </div>
      </div>

      {/* 功能说明 */}
      <div className="glass rounded-xl p-4 text-sm text-slate-300">
        <h3 className="font-semibold text-white mb-2">功能说明</h3>
        <ul className="space-y-1 opacity-80">
          <li>• <strong>格式化</strong>：美化压缩的JSON，添加缩进和换行</li>
          <li>• <strong>压缩</strong>：将格式化的JSON去除所有空白字符</li>
          <li>• <strong>验证</strong>：检查JSON语法是否正确</li>
          <li>• <strong>智能解析</strong>：支持转义字符串形式的JSON（如带转义字符的字符串）</li>
          <li>• <strong>树形视图</strong>：可折叠的JSON结构，数组显示元素数量 [x项]，对象显示字段数量 {'{x个字段}'}</li>
          <li>• <strong>视图切换</strong>：支持树形视图和语法高亮视图自由切换</li>
          <li>• <strong>行号显示</strong>：高亮视图自动显示行号，方便代码定位和调试</li>
          <li>• <strong>本地处理</strong>：所有操作在浏览器本地完成，数据安全</li>
        </ul>
      </div>
    </div>
  )
}

export default JSONFormatter