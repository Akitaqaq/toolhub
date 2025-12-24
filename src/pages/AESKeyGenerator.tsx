import React, { useState } from 'react'

type KeySize = 128 | 192 | 256

interface AESKeyState {
  keyString: string
  keySize: KeySize
  iterations: number
}

const AESKeyGenerator: React.FC = () => {
  const [state, setState] = useState<AESKeyState>({
    keyString: '',
    keySize: 256,
    iterations: 1
  })

  // 生成随机字节数组
  const generateRandomBytes = (length: number): Uint8Array => {
    const array = new Uint8Array(length)
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array)
    } else {
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }
    return array
  }

  // 生成AES密钥 - 返回Base64格式（可读字符串）
  const generateKey = () => {
    const keyLength = state.keySize / 8
    let finalBytes = generateRandomBytes(keyLength)

    // XOR混合增强随机性
    if (state.iterations > 1) {
      for (let i = 1; i < state.iterations; i++) {
        const newBytes = generateRandomBytes(keyLength)
        for (let j = 0; j < keyLength; j++) {
          finalBytes[j] = (finalBytes[j] ^ newBytes[j])
        }
      }
    }

    // 转换为Base64字符串（可读格式）
    const keyString = btoa(String.fromCharCode(...finalBytes))

    setState(prev => ({ ...prev, keyString }))
  }

  // 复制密钥字符串 (Base64)
  const copyKeyString = () => {
    if (state.keyString) {
      navigator.clipboard.writeText(state.keyString)
      alert('✅ 密钥字符串已复制！')
    }
  }

  // 复制原始字节数组
  const copyRawBytes = () => {
    if (state.keyString) {
      // Base64解码回字节数组
      const bytes = atob(state.keyString).split('').map(c => c.charCodeAt(0))
      navigator.clipboard.writeText('new byte[] {' + bytes.join(', ') + '}')
      alert('✅ Java字节数组格式已复制！')
    }
  }

  // 复制Hex格式
  const copyHex = () => {
    if (state.keyString) {
      // Base64解码后转Hex
      const bytes = atob(state.keyString).split('').map(c => c.charCodeAt(0))
      const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('')
      navigator.clipboard.writeText(hex)
      alert('✅ Hex格式已复制！')
    }
  }

  // 复制原始字节（逗号分隔）
  const copyRawComma = () => {
    if (state.keyString) {
      const bytes = atob(state.keyString).split('').map(c => c.charCodeAt(0))
      navigator.clipboard.writeText(bytes.join(', '))
      alert('✅ 原始字节已复制！')
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
        <p className="text-slate-400">生成安全的AES密钥字符串，可直接使用</p>
      </div>

      {/* 密钥配置区域 */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          密钥配置
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 密钥长度选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">密钥长度</label>
            <div className="flex gap-2">
              {[128, 192, 256].map((size) => (
                <button
                  key={size}
                  onClick={() => setState(prev => ({ ...prev, keySize: size as KeySize }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    state.keySize === size
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {size}位
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {state.keySize === 128 && '16字节'}
              {state.keySize === 192 && '24字节'}
              {state.keySize === 256 && '32字节'}
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
              max="5"
              value={state.iterations}
              onChange={(e) => setState(prev => ({ ...prev, iterations: parseInt(e.target.value) }))}
              className="w-full accent-indigo-500"
            />
            <p className="text-xs text-slate-500">
              增强随机性，建议1-3次
            </p>
          </div>
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

          {/* 直接展示密钥字符串 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white">
              🔑 AES密钥字符串 ({state.keySize}位 = {state.keySize / 8}字节)
            </label>
            <div className="flex gap-2">
              <textarea
                value={state.keyString}
                readOnly
                className="flex-1 h-24 bg-slate-900/50 border border-slate-700 rounded-lg p-3 font-mono text-sm text-green-400 focus:outline-none"
                style={{ fontFamily: 'Consolas, Monaco, monospace' }}
              />
              <button
                onClick={copyKeyString}
                className="px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
              >
                复制
              </button>
            </div>
          </div>

          {/* 快捷复制选项 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">其他格式（可选）</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={copyRawBytes}
                className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 text-xs transition-all border border-purple-500/30"
              >
                Java字节数组
              </button>
              <button
                onClick={copyHex}
                className="px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded hover:bg-yellow-500/30 text-xs transition-all border border-yellow-500/30"
              >
                Hex格式
              </button>
              <button
                onClick={copyRawComma}
                className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 text-xs transition-all border border-blue-500/30"
              >
                原始字节
              </button>
            </div>
          </div>

          {/* 字节详情 */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-slate-500">字节数:</span> <span className="text-white font-mono">{state.keyString.length}</span></div>
              <div><span className="text-slate-500">密钥长度:</span> <span className="text-white font-mono">{state.keySize}位</span></div>
              <div><span className="text-slate-500">混合次数:</span> <span className="text-white font-mono">{state.iterations}</span></div>
              <div><span className="text-slate-500">前10字符:</span> <span className="text-blue-400 font-mono">{state.keyString.slice(0, 10)}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Java使用示例 */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          ☕ Java使用完整示例
        </h3>
        <div className="space-y-2 text-sm">
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
            <div>import javax.crypto.spec.SecretKeySpec;</div>
            <div>import javax.crypto.Cipher;</div>
            <div>import java.util.Base64;</div>
            <div></div>
            <div>// 使用生成的Base64密钥字符串</div>
            <div>String base64Key = "你的Base64密钥字符串";</div>
            <div>byte[] keyBytes = Base64.getDecoder().decode(base64Key);</div>
            <div>SecretKeySpec key = new SecretKeySpec(keyBytes, "AES");</div>
            <div>Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");</div>
            <div>cipher.init(Cipher.ENCRYPT_MODE, key);</div>
          </div>
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
            <span><strong>密钥格式：</strong>Base64编码的可读字符串，可直接复制使用</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span><strong>字节长度：</strong>128位=16字节，192位=24字节，256位=32字节</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span><strong>Java使用：</strong>通过 <code>Base64.getDecoder().decode()</code> 还原为字节数组</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span><strong>其他格式：</strong>提供Java字节数组、Hex、原始字节等格式供选择</span>
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
            <span>使用浏览器加密API生成真随机数</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>所有密钥在本地生成，不会上传服务器</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>256位密钥提供军用级加密强度</span>
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
