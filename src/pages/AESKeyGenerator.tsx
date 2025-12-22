import React, { useState } from 'react'

type KeySize = 128 | 192 | 256
type OutputFormat = 'hex' | 'base64' | 'raw'

interface AESKeyState {
  key: string
  keySize: KeySize
  format: OutputFormat
  iterations: number
}

const AESKeyGenerator: React.FC = () => {
  const [state, setState] = useState<AESKeyState>({
    key: '',
    keySize: 256,
    format: 'hex',
    iterations: 1
  })

  // 生成随机字节数组
  const generateRandomBytes = (length: number): Uint8Array => {
    const array = new Uint8Array(length)
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array)
    } else {
      // Fallback for older browsers
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }
    return array
  }

  // 转换为Hex格式
  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // 转换为Base64格式
  const bytesToBase64 = (bytes: Uint8Array): string => {
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // 生成AES密钥
  const generateKey = () => {
    const keyLength = state.keySize / 8
    let finalBytes = generateRandomBytes(keyLength)

    // 如果需要多次迭代混合（增强随机性）
    if (state.iterations > 1) {
      for (let i = 1; i < state.iterations; i++) {
        const newBytes = generateRandomBytes(keyLength)
        for (let j = 0; j < keyLength; j++) {
          finalBytes[j] = (finalBytes[j] ^ newBytes[j]) // XOR混合
        }
      }
    }

    let formattedKey: string
    switch (state.format) {
      case 'hex':
        formattedKey = bytesToHex(finalBytes)
        break
      case 'base64':
        formattedKey = bytesToBase64(finalBytes)
        break
      case 'raw':
        formattedKey = Array.from(finalBytes).join(', ')
        break
    }

    setState(prev => ({ ...prev, key: formattedKey }))
  }

  // 复制到剪贴板
  const copyToClipboard = () => {
    if (state.key) {
      navigator.clipboard.writeText(state.key)
      alert('密钥已复制到剪贴板！')
    }
  }

  // 清空结果
  const clearKey = () => {
    setState(prev => ({ ...prev, key: '' }))
  }

  // 导出为JSON
  const exportAsJSON = () => {
    if (state.key) {
      const exportData = {
        algorithm: 'AES',
        keySize: `${state.keySize} bits`,
        format: state.format,
        key: state.key,
        generatedAt: new Date().toISOString()
      }
      const jsonString = JSON.stringify(exportData, null, 2)
      navigator.clipboard.writeText(jsonString)
      alert('JSON格式已复制到剪贴板！')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">AES密钥生成器</h2>
        <p className="text-slate-400">生成安全的AES加密密钥，支持多种格式输出</p>
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
              {state.keySize === 128 && '标准强度，适合一般用途'}
              {state.keySize === 192 && '较高强度，适合敏感数据'}
              {state.keySize === 256 && '最高强度，适合保密数据'}
            </p>
          </div>

          {/* 输出格式选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">输出格式</label>
            <div className="flex gap-2">
              {(['hex', 'base64', 'raw'] as OutputFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setState(prev => ({ ...prev, format }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    state.format === format
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {state.format === 'hex' && '十六进制字符串，最常用'}
              {state.format === 'base64' && 'Base64编码，适合传输'}
              {state.format === 'raw' && '原始字节数组，适合调试'}
            </p>
          </div>
        </div>

        {/* 迭代次数 */}
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
            增加随机性混合次数，提高密钥复杂度（建议：1-3次）
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
          {state.key && (
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
      {state.key && (
        <div className="glass rounded-xl p-6 space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
            生成结果
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">密钥信息</label>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">算法:</span>
                <span className="text-white font-mono">AES</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">密钥长度:</span>
                <span className="text-white font-mono">{state.keySize} 位</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">格式:</span>
                <span className="text-white font-mono">{state.format.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">混合次数:</span>
                <span className="text-white font-mono">{state.iterations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">长度:</span>
                <span className="text-white font-mono">{state.key.length} 字符</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">密钥数据</label>
            <textarea
              value={state.key}
              readOnly
              className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-3 font-mono text-sm text-green-400 focus:outline-none"
              style={{ fontFamily: 'Consolas, Monaco, monospace' }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
            >
              📋 复制密钥
            </button>
            <button
              onClick={exportAsJSON}
              className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-all border border-indigo-500/30"
            >
              📄 导出JSON
            </button>
          </div>
        </div>
      )}

      {/* 安全说明 */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          🔒 安全说明
        </h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>使用浏览器内置的加密API生成真随机数</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>所有密钥生成在本地完成，不会上传到任何服务器</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>AES-256密钥长度达到军用级加密标准</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>生成后请妥善保管密钥，避免泄露</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>建议在安全的环境下生成和存储密钥</span>
          </li>
        </ul>
      </div>

      {/* 使用建议 */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          💡 使用建议
        </h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span>加密文件：推荐使用AES-256 + Hex格式</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span>数据库加密：推荐使用AES-192 + Base64格式</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span>网络传输：Base64格式更便于传输</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span>调试开发：Raw格式可查看原始字节值</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400">•</span>
            <span>混合次数：普通用途1次，高安全需求可2-3次</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AESKeyGenerator
