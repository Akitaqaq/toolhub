import React, { useState } from 'react'
import { toast } from '../components/Toast'

type EncodeType = 'url' | 'base64' | 'unicode'

interface EncodeState {
  input: string
  output: string
  type: EncodeType
  error: string
}

const EncoderDecoder: React.FC = () => {
  const [state, setState] = useState<EncodeState>({
    input: '',
    output: '',
    type: 'url',
    error: '',
  })

  const tools = {
    url: {
      name: 'URL编码/解码',
      encode: (text: string) => encodeURIComponent(text),
      decode: (text: string) => decodeURIComponent(text),
      placeholder: '输入URL或文本进行编解码...',
      examples: ['hello world', 'https://example.com/search?q=test&lang=zh', '你好，世界']
    },
    base64: {
      name: 'Base64编解码',
      encode: (text: string) => btoa(unescape(encodeURIComponent(text))),
      decode: (text: string) => decodeURIComponent(escape(atob(text))),
      placeholder: '输入文本或Base64字符串...',
      examples: ['Hello World', '测试文本', 'JSON数据']
    },
    unicode: {
      name: 'Unicode转换',
      encode: (text: string) => {
        let result = ''
        for (let i = 0; i < text.length; i++) {
          const char = text.charAt(i)
          const code = text.charCodeAt(i)
          if (code > 127) {
            result += '\\u' + code.toString(16).padStart(4, '0')
          } else {
            result += char
          }
        }
        return result
      },
      decode: (text: string) => {
        return text.replace(/\\u([a-fA-F0-9]{4})/g, (_match, hex) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
      },
      placeholder: '输入文本或Unicode转义序列...',
      examples: ['你好世界', 'Hello 世界', '\\u4f60\\u597d']
    },
  }

  const handleEncode = () => {
    try {
      const tool = tools[state.type]
      const result = tool.encode(state.input)
      setState(prev => ({ ...prev, output: result, error: '' }))
    } catch (err) {
      setState(prev => ({ ...prev, error: (err as Error).message, output: '' }))
    }
  }

  const handleDecode = () => {
    try {
      const tool = tools[state.type]
      const result = tool.decode(state.input)
      setState(prev => ({ ...prev, output: result, error: '' }))
    } catch (err) {
      setState(prev => ({ ...prev, error: (err as Error).message, output: '' }))
    }
  }

  const handleSwap = () => {
    setState(prev => ({ ...prev, input: prev.output, output: prev.input }))
  }

  const handleCopy = () => {
    if (state.output) {
      navigator.clipboard.writeText(state.output)
      toast.success('已复制到剪贴板！')
    }
  }

  const handleClear = () => {
    setState(prev => ({ ...prev, input: '', output: '', error: '' }))
  }

  const loadExample = (example: string) => {
    setState(prev => ({ ...prev, input: example, output: '', error: '' }))
  }

  const currentTool = tools[state.type]

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">编码解码工具集</h2>
        <p style={{ color: 'var(--fg-muted)' }}>支持URL、Base64、Unicode等格式转换</p>
      </div>

      {/* 工具类型选择 */}
      <div className="glass rounded-xl p-3">
        <div className="flex flex-wrap gap-2">
          {Object.entries(tools).map(([key, tool]) => (
            <button
              key={key}
              onClick={() => setState(prev => ({ ...prev, type: key as EncodeType, input: '', output: '', error: '' }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                state.type === key
                  ? 'th-btn-accent'
                  : 'th-tag'
              }`}
              >
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      {/* 当前工具说明 */}
      <div className="glass rounded-xl p-4" style={{ borderLeft: '4px solid var(--accent)' }}>
        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--fg)' }}>{currentTool.name}</h3>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          {state.type === 'url' && '支持URL编码和解码，处理特殊字符和中文'}
          {state.type === 'base64' && 'Base64编码解码，支持中文文本处理'}
          {state.type === 'unicode' && 'Unicode与中文互转，支持\\u格式转义序列'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入区域 */}
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>输入</label>
            <button
              onClick={handleClear}
              className="th-btn-danger px-3 py-1 rounded text-sm transition-colors"
            >
              清空
            </button>
          </div>

          <textarea
            value={state.input}
            onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
            placeholder={currentTool.placeholder}
            className="th-input w-full h-48 rounded-lg p-3 text-sm font-mono transition-all"
            spellCheck={false}
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleEncode}
              className="th-btn-accent flex-1 py-2 rounded-lg transition-all text-sm font-medium"
            >
              编码
            </button>
            <button
              onClick={handleDecode}
              className="th-btn-soft flex-1 py-2 rounded-lg transition-all text-sm font-medium"
            >
              解码
            </button>
          </div>
        </div>

        {/* 输出区域 */}
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>输出</label>
            <div className="flex gap-2">
              {state.output && (
                <button
                  onClick={handleCopy}
                  className="th-btn-ghost px-3 py-1 text-sm rounded transition-colors"
                >
                  复制
                </button>
              )}
              {state.output && state.input && (
                <button
                  onClick={handleSwap}
                  className="th-btn-ghost px-3 py-1 text-sm rounded transition-colors"
                >
                  交换
                </button>
              )}
            </div>
          </div>

          {state.error && (
            <div className="th-panel-error p-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          <textarea
            value={state.output}
            readOnly
            placeholder="编解码结果将显示在这里..."
            className="th-input w-full h-48 rounded-lg p-3 text-sm font-mono"
          />
        </div>
      </div>

      {/* 示例数据 */}
      {currentTool.examples && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>示例数据</h3>
          <div className="flex flex-wrap gap-2">
            {currentTool.examples.map((example, index) => (
              <button
                key={index}
                onClick={() => loadExample(example)}
                className="th-tag px-3 py-1.5 rounded text-xs transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => {
            if (state.output) {
              setState(prev => ({ ...prev, input: prev.output, output: '' }))
            }
          }}
          className="th-tag px-3 py-2 rounded text-xs transition-colors"
        >
          输出变输入
        </button>
        <button
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.readText().then(text => {
                setState(prev => ({ ...prev, input: text, output: '', error: '' }))
              })
            }
          }}
          className="th-tag px-3 py-2 rounded text-xs transition-colors"
        >
          粘贴板读取
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(state.input + state.output)
            toast.success('输入+输出已合并复制！')
          }}
          className="th-tag px-3 py-2 rounded text-xs transition-colors"
        >
          合并复制
        </button>
        <button
          onClick={() => {
            const inputLen = state.input.length
            const outputLen = state.output.length
            toast.info(`输入: ${inputLen}字符, 输出: ${outputLen}字符, 变化: ${outputLen - inputLen}`)
          }}
          className="th-tag px-3 py-2 rounded text-xs transition-colors"
        >
          统计长度
        </button>
      </div>

      {/* 使用技巧 */}
      <div className="glass rounded-xl p-4 text-sm" style={{ color: 'var(--fg-secondary)' }}>
        <h3 className="font-semibold mb-2" style={{ color: 'var(--fg)' }}>使用技巧</h3>
        <ul className="space-y-1 opacity-80">
          <li>• URL编码：处理特殊字符，用于URL参数传递</li>
          <li>• Base64：适用于数据传输和存储，支持中文</li>
          <li>• Unicode：处理多语言字符，与\\u格式互转</li>
          <li>• 所有操作在浏览器本地完成，无需上传数据</li>
        </ul>
      </div>
    </div>
  )
}

export default EncoderDecoder
