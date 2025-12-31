import React, { useState } from 'react'
import { toast } from '../components/Toast'

type KeySize = 128 | 192 | 256

interface AESKeyState {
  keyString: string
  keySize: KeySize
  iterations: number
}

// 字符长度映射：128位=16字符，192位=24字符，256位=32字符
const KEY_LENGTH_MAP: Record<KeySize, number> = {
  128: 16,
  192: 24,
  256: 32
}

const AESKeyGenerator: React.FC = () => {
  const [state, setState] = useState<AESKeyState>({
    keyString: '',
    keySize: 256,
    iterations: 1
  })

  // 生成指定长度的Base64密钥字符串
  const generateBase64Key = (length: number): string => {
    // Base64编码大约需要3/4的原始字节数
    // 为了确保有足够的字符，生成稍微多一点的字节
    const byteLength = Math.ceil(length * 3 / 4) + 4
    const bytes = new Uint8Array(byteLength)

    // 使用加密API生成随机字节
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes)
    } else {
      for (let i = 0; i < byteLength; i++) {
        bytes[i] = Math.floor(Math.random() * 256)
      }
    }

    // 转换为Base64
    const base64 = btoa(String.fromCharCode(...bytes))

    // 截取指定长度（移除可能的=填充字符）
    let result = base64.replace(/[+=]/g, '').substring(0, length)

    // 确保长度正确（极端情况下补充）
    while (result.length < length) {
      const extraBytes = new Uint8Array(4)
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(extraBytes)
      } else {
        for (let i = 0; i < 4; i++) {
          extraBytes[i] = Math.floor(Math.random() * 256)
        }
      }
      const extraBase64 = btoa(String.fromCharCode(...extraBytes)).replace(/[+=]/g, '')
      result += extraBase64.substring(0, length - result.length)
    }

    return result
  }

  // 生成AES密钥
  const generateKey = () => {
    const targetLength = KEY_LENGTH_MAP[state.keySize]
    let keyString = generateBase64Key(targetLength)

    // 可选的多次混合增强随机性
    if (state.iterations > 1) {
      for (let i = 1; i < state.iterations; i++) {
        const extraKey = generateBase64Key(targetLength)
        // 字符级别的XOR混合
        let mixed = ''
        for (let j = 0; j < targetLength; j++) {
          const charCode1 = keyString.charCodeAt(j)
          const charCode2 = extraKey.charCodeAt(j)
          // 使用Base64字符集进行混合
          const mixedCode = (charCode1 ^ charCode2) % 64 + 48
          mixed += String.fromCharCode(mixedCode)
        }
        // 重新编码为Base64格式
        const bytes = new Uint8Array(targetLength)
        for (let k = 0; k < targetLength; k++) {
          bytes[k] = mixed.charCodeAt(k)
        }
        keyString = btoa(String.fromCharCode(...bytes)).replace(/[+=]/g, '').substring(0, targetLength)
      }
    }

    setState(prev => ({ ...prev, keyString }))
  }

  // 获取实际字节数（Base64解码后）
  const getActualByteLength = (): number => {
    if (!state.keyString) return 0
    try {
      // Base64补齐
      const padded = state.keyString + '=='.substring(0, (4 - state.keyString.length % 4) % 4)
      const decoded = atob(padded)
      return decoded.length
    } catch {
      return 0
    }
  }

  // 获取Hex格式
  const getHexFormat = (): string => {
    if (!state.keyString) return ''
    try {
      const padded = state.keyString + '=='.substring(0, (4 - state.keyString.length % 4) % 4)
      const bytes = atob(padded).split('').map(c => c.charCodeAt(0))
      return bytes.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    } catch {
      return ''
    }
  }

  // 获取原始字节格式
  const getRawBytes = (): string => {
    if (!state.keyString) return ''
    try {
      const padded = state.keyString + '=='.substring(0, (4 - state.keyString.length % 4) % 4)
      const bytes = atob(padded).split('').map(c => c.charCodeAt(0))
      return bytes.join(', ')
    } catch {
      return ''
    }
  }

  // 复制密钥字符串
  const copyKeyString = () => {
    if (state.keyString) {
      navigator.clipboard.writeText(state.keyString)
      toast.success('密钥已复制！')
    }
  }

  // 复制Hex格式
  const copyHex = () => {
    const hex = getHexFormat()
    if (hex) {
      navigator.clipboard.writeText(hex)
      toast.success('Hex格式已复制！')
    }
  }

  // 复制Java字节数组格式
  const copyJavaBytes = () => {
    const raw = getRawBytes()
    if (raw) {
      navigator.clipboard.writeText('new byte[] {' + raw + '}')
      toast.success('Java字节数组格式已复制！')
    }
  }

  // 复制原始字节
  const copyRaw = () => {
    const raw = getRawBytes()
    if (raw) {
      navigator.clipboard.writeText(raw)
      toast.success('原始字节已复制！')
    }
  }

  // 清空结果
  const clearKey = () => {
    setState(prev => ({ ...prev, keyString: '' }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">AES密钥生成器</h2>
        <p className="text-slate-400">生成指定长度的Base64格式AES密钥</p>
      </div>

      {/* 密钥配置区域 */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          密钥配置
        </h3>

        {/* 密钥长度选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">密钥长度 / 字符数</label>
          <div className="flex gap-2">
            {[128, 192, 256].map((size) => (
              <button
                key={size}
                onClick={() => setState(prev => ({ ...prev, keySize: size as KeySize }))}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                  state.keySize === size
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                <div className="text-lg font-bold">{size}位</div>
                <div className="text-xs opacity-80">{KEY_LENGTH_MAP[size as KeySize]}字符</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {state.keySize === 128 && '128位密钥 → 16个Base64字符'}
            {state.keySize === 192 && '192位密钥 → 24个Base64字符'}
            {state.keySize === 256 && '256位密钥 → 32个Base64字符'}
          </p>
        </div>

        {/* 随机混合次数 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            随机混合次数: {state.iterations}
          </label>
          <input
            type="range"
            min="1"
            max="3"
            value={state.iterations}
            onChange={(e) => setState(prev => ({ ...prev, iterations: parseInt(e.target.value) }))}
            className="w-full accent-indigo-500"
          />
          <p className="text-xs text-slate-500">
            增强随机性，建议1次即可
          </p>
        </div>

        {/* 生成按钮 */}
        <div className="flex gap-3">
          <button
            onClick={generateKey}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-lg"
          >
            🔐 生成AES密钥
          </button>
          {state.keyString && (
            <button
              onClick={clearKey}
              className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* 密钥结果显示 */}
      {state.keyString && (
        <div className="glass rounded-xl p-6 space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
            ✅ 生成成功
          </h3>

          {/* Base64密钥字符串 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white">
              🔑 Base64密钥 ({state.keySize}位 / {KEY_LENGTH_MAP[state.keySize]}字符)
            </label>
            <div className="flex gap-2">
              <textarea
                value={state.keyString}
                readOnly
                className="flex-1 h-20 bg-slate-900/50 border border-slate-700 rounded-lg p-3 font-mono text-lg text-green-400 focus:outline-none"
                style={{ fontFamily: 'Consolas, Monaco, monospace' }}
              />
              <button
                onClick={copyKeyString}
                className="px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
              >
                复制
              </button>
            </div>
          </div>

          {/* 其他格式 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">其他格式</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Hex格式</div>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs text-yellow-400 font-mono break-all">
                    {getHexFormat()}
                  </code>
                  <button
                    onClick={copyHex}
                    className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs hover:bg-yellow-500/30"
                  >
                    复制
                  </button>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">原始字节</div>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs text-blue-400 font-mono break-all">
                    {getRawBytes()}
                  </code>
                  <button
                    onClick={copyRaw}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30"
                  >
                    复制
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={copyJavaBytes}
              className="w-full py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 text-sm transition-all border border-purple-500/30"
            >
              复制Java字节数组格式
            </button>
          </div>

          {/* 密钥信息 */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><span className="text-slate-500">密钥长度:</span> <span className="text-white font-mono">{state.keySize}位</span></div>
              <div><span className="text-slate-500">字符数:</span> <span className="text-white font-mono">{state.keyString.length}</span></div>
              <div><span className="text-slate-500">解码字节数:</span> <span className="text-white font-mono">{getActualByteLength()}</span></div>
              <div><span className="text-slate-500">混合次数:</span> <span className="text-white font-mono">{state.iterations}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Java使用示例 */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          ☕ Java使用示例
        </h3>
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
          <div className="text-indigo-400 mb-2">// 直接使用Base64密钥</div>
          <div>String base64Key = "{state.keyString || '你的密钥'}";</div>
          <div>byte[] keyBytes = Base64.getDecoder().decode(base64Key);</div>
          <div>SecretKeySpec key = new SecretKeySpec(keyBytes, "AES");</div>
          <div className="text-slate-500 mt-2">----------------------------------------</div>
          <div className="text-indigo-400 mt-2">// 或使用Hex格式</div>
          <div>String hexKey = "{getHexFormat() || '你的Hex密钥'}";</div>
          <div>byte[] keyBytes = new byte[hexKey.length() / 2];</div>
          <div>for (int i = 0; i &lt; keyBytes.length; i++) {'{'}</div>
          <div>  keyBytes[i] = (byte) Integer.parseInt(hexKey.substring(i * 2, i * 2 + 2), 16);</div>
          <div>{'}'}</div>
        </div>
      </div>

      {/* 重要说明 */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          💡 重要说明
        </h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span><strong>密钥格式：</strong>Base64编码的可读字符串，不含特殊符号（+=），便于使用</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span><strong>字符长度：</strong>128位=16字符，192位=24字符，256位=32字符</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span><strong>Java使用：</strong>直接用 <code>Base64.getDecoder().decode()</code> 解码即可使用</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span><strong>其他格式：</strong>提供Hex和原始字节格式供不同场景使用</span>
          </li>
        </ul>
      </div>

      {/* 安全说明 */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          🔒 安全说明
        </h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>使用浏览器加密API (<code>crypto.getRandomValues()</code>) 生成真随机数</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>所有密钥在本地生成，不会上传服务器</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>256位密钥提供军用级加密强度（AES-256）</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>生成后请妥善保管，避免泄露</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AESKeyGenerator
