import React, { useState } from 'react'
import CryptoJS from 'crypto-js'
import { toast } from '../components/Toast'

type MD5Length = 16 | 32
type CaseMode = 'lower' | 'upper' | 'mixed'

interface MD5State {
  input: string
  output: string
  length: MD5Length
  caseMode: CaseMode
}

const MD5Encryptor: React.FC = () => {
  const [state, setState] = useState<MD5State>({
    input: '',
    output: '',
    length: 32,
    caseMode: 'lower'
  })

  // MD5加密函数 - 使用crypto-js
  const md5 = (message: string): string => {
    const hash = CryptoJS.MD5(message)
    let result = hash.toString(CryptoJS.enc.Hex)

    // 处理长度（16位取中间32位的中间16位）
    if (state.length === 16) {
      result = result.substring(8, 24)
    }

    // 处理大小写
    switch (state.caseMode) {
      case 'upper':
        result = result.toUpperCase()
        break
      case 'mixed':
        // 混合大小写：奇数位大写，偶数位小写
        result = result.split('').map((char, index) =>
          index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
        ).join('')
        break
      case 'lower':
      default:
        break
    }

    return result
  }

  const handleEncrypt = () => {
    if (!state.input.trim()) {
      toast.warning('请输入要加密的内容')
      return
    }
    try {
      const result = md5(state.input)
      setState(prev => ({ ...prev, output: result }))
      toast.success('MD5生成成功！')
    } catch (error) {
      toast.error('加密失败')
      console.error(error)
    }
  }

  const handleCopy = () => {
    if (state.output) {
      navigator.clipboard.writeText(state.output)
      toast.success('MD5值已复制！')
    }
  }

  const handleClear = () => {
    setState({ input: '', output: '', length: 32, caseMode: 'lower' })
  }

  // 获取大小写显示文本
  const getCaseText = (mode: CaseMode): string => {
    switch (mode) {
      case 'lower': return '小写'
      case 'upper': return '大写'
      case 'mixed': return '混合'
      default: return '小写'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">MD5加密</h2>
        <p style={{ color: 'var(--fg-muted)' }}>生成输入内容的MD5哈希值</p>
      </div>

      {/* 输入区域 */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="th-section-header">
          输入内容
        </h3>

        <div className="space-y-3">
          <textarea
            value={state.input}
            onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
            placeholder="输入要加密的文本..."
            className="w-full h-32 th-input rounded-lg p-3 resize-y"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 长度选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>输出长度</label>
              <div className="flex gap-2">
                {[16, 32].map((len) => (
                  <button
                    key={len}
                    onClick={() => setState(prev => ({ ...prev, length: len as MD5Length }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      state.length === len
                        ? 'th-btn-accent'
                        : 'th-btn-ghost'
                    }`}
                  >
                    {len}位
                  </button>
                ))}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--fg-faint)' }}>
                {state.length === 16 ? '16个字符（取中间部分）' : '32个字符（完整MD5）'}
              </p>
            </div>

            {/* 大小写选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>大小写模式</label>
              <div className="flex gap-2">
                {[
                  { mode: 'lower' as CaseMode, label: '小写' },
                  { mode: 'upper' as CaseMode, label: '大写' },
                  { mode: 'mixed' as CaseMode, label: '混合' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => setState(prev => ({ ...prev, caseMode: item.mode }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      state.caseMode === item.mode
                        ? 'th-btn-accent'
                        : 'th-btn-ghost'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--fg-faint)' }}>
                {state.caseMode === 'mixed' ? '奇数位大写，偶数位小写' : `${getCaseText(state.caseMode)}格式`}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleEncrypt}
              className="flex-1 py-3 th-btn-accent rounded-lg font-medium"
            >
              🔒 生成MD5
            </button>
            {state.output && (
              <button
                onClick={handleClear}
                className="px-4 py-3 th-btn-danger rounded-lg transition-all"
              >
                清空
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 结果区域 */}
      {state.output && (
        <div className="glass rounded-xl p-6 space-y-4 animate-fade-in">
          <h3 className="th-section-header">
            ✅ 加密结果
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-bold" style={{ color: 'var(--fg)' }}>MD5哈希值</label>
            <div className="flex gap-2">
              <textarea
                value={state.output}
                readOnly
                className="flex-1 h-20 th-input rounded-lg p-3 font-mono text-sm"
                style={{ fontFamily: 'Consolas, Monaco, monospace', color: 'var(--accent)' }}
              />
              <button
                onClick={handleCopy}
                className="px-4 th-btn-accent rounded font-medium"
              >
                复制
              </button>
            </div>
          </div>

          {/* 信息展示 */}
          <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--code-bg)', border: '1px solid var(--code-border)' }}>
            <div className="grid grid-cols-2 gap-2">
              <div><span style={{ color: 'var(--fg-faint)' }}>输入长度:</span> <span className="font-mono" style={{ color: 'var(--fg)' }}>{state.input.length} 字符</span></div>
              <div><span style={{ color: 'var(--fg-faint)' }}>MD5长度:</span> <span className="font-mono" style={{ color: 'var(--fg)' }}>{state.length} 字符</span></div>
              <div><span style={{ color: 'var(--fg-faint)' }}>格式:</span> <span className="font-mono" style={{ color: 'var(--fg)' }}>16进制</span></div>
              <div><span style={{ color: 'var(--fg-faint)' }}>大小写:</span> <span className="font-mono" style={{ color: 'var(--fg)' }}>{getCaseText(state.caseMode)}</span></div>
            </div>
          </div>

          {/* 快速对比 */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>快速对比</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  const lower = state.output.toLowerCase()
                  navigator.clipboard.writeText(lower)
                  toast.success('小写格式已复制！')
                }}
                className="px-3 py-2 th-btn-soft rounded text-xs transition-all"
              >
                小写格式
              </button>
              <button
                onClick={() => {
                  const upper = state.output.toUpperCase()
                  navigator.clipboard.writeText(upper)
                  toast.success('大写格式已复制！')
                }}
                className="px-3 py-2 th-btn-soft rounded text-xs transition-all"
              >
                大写格式
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 使用示例 */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="th-section-header">
          💡 MD5特性说明
        </h3>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--fg-secondary)' }}>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--accent)' }}>•</span>
            <span><strong>32位：</strong>完整的MD5哈希值，32个十六进制字符</span>
          </li>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--accent)' }}>•</span>
            <span><strong>16位：</strong>取32位的中间16位，常用于某些特定场景</span>
          </li>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--accent)' }}>•</span>
            <span><strong>混合大小写：</strong>奇数位大写、偶数位小写的特殊格式</span>
          </li>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--accent)' }}>•</span>
            <span><strong>单向加密：</strong>无法从MD5值反推原始内容</span>
          </li>
        </ul>
      </div>

      {/* 安全说明 */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="th-section-header">
          🔒 安全提示
        </h3>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--fg-secondary)' }}>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--warning)' }}>⚠</span>
            <span>MD5已不再推荐用于密码存储（易被彩虹表攻击）</span>
          </li>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--success)' }}>✓</span>
            <span>适合用于文件完整性校验和数据去重</span>
          </li>
          <li className="flex items-start space-x-2">
            <span style={{ color: 'var(--success)' }}>✓</span>
            <span>本工具纯前端实现，数据不会上传服务器</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MD5Encryptor
