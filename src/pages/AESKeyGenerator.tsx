import React, { useState, useEffect } from 'react'
import { toast } from '../components/Toast'

type KeySize = 128 | 192 | 256

const KEY_LENGTH_MAP: Record<KeySize, number> = {
  128: 16,
  192: 24,
  256: 32
}

const AESKeyGenerator: React.FC = () => {
  const [keyString, setKeyString] = useState('')
  const [keySize, setKeySize] = useState<KeySize>(256)

  // 页面加载自动生成
  useEffect(() => {
    generateKey(256)
  }, [])

  // 生成Base64密钥
  const generateBase64Key = (length: number): string => {
    const byteLength = Math.ceil(length * 3 / 4) + 4
    const bytes = new Uint8Array(byteLength)

    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes)
    } else {
      for (let i = 0; i < byteLength; i++) {
        bytes[i] = Math.floor(Math.random() * 256)
      }
    }

    const base64 = btoa(String.fromCharCode(...bytes))
    let result = base64.replace(/[+=]/g, '').substring(0, length)

    while (result.length < length) {
      const extraBytes = new Uint8Array(4)
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(extraBytes)
      }
      const extraBase64 = btoa(String.fromCharCode(...extraBytes)).replace(/[+=]/g, '')
      result += extraBase64.substring(0, length - result.length)
    }

    return result
  }

  // 生成密钥
  const generateKey = (size: KeySize = keySize) => {
    const targetLength = KEY_LENGTH_MAP[size]
    const key = generateBase64Key(targetLength)
    setKeyString(key)
    setKeySize(size)
  }

  // 获取Hex格式
  const getHexFormat = (): string => {
    if (!keyString) return ''
    try {
      const padded = keyString + '=='.substring(0, (4 - keyString.length % 4) % 4)
      const bytes = atob(padded).split('').map(c => c.charCodeAt(0))
      return bytes.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    } catch {
      return ''
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label}已复制！`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* 标题 */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">AES 密钥生成器</h2>
        <p style={{ color: 'var(--fg-muted)' }}>随机密钥生成，支持 Base64 / Hex 格式</p>
      </div>

      {/* 密钥长度选择 */}
      <div className="glass rounded-xl p-4">
        <div className="flex gap-2">
          {[128, 192, 256].map((size) => (
            <button
              key={size}
              onClick={() => generateKey(size as KeySize)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                keySize === size
                  ? 'th-btn-accent shadow-lg'
                  : 'th-btn-ghost'
              }`}
            >
              <div className="text-lg font-bold">{size} 位</div>
              <div className="text-xs opacity-80">{KEY_LENGTH_MAP[size as KeySize]} 字符</div>
            </button>
          ))}
        </div>
      </div>

      {/* 密钥结果 */}
      {keyString && (
        <div className="glass rounded-xl p-6 space-y-4">
          {/* Base64 密钥 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>Base64 密钥</label>
              <button
                onClick={() => generateKey(keySize)}
                className="th-btn-soft text-xs px-3 py-1 rounded"
              >
                重新生成
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={keyString}
                readOnly
                className="th-input flex-1 rounded-lg px-4 py-3 font-mono text-base"
              />
              <button
                onClick={() => handleCopy(keyString, '密钥')}
                className="th-btn-soft px-4 rounded-lg font-medium"
              >
                复制
              </button>
            </div>
          </div>

          {/* Hex 格式 */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>Hex 格式</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={getHexFormat()}
                readOnly
                className="th-input flex-1 rounded-lg px-4 py-3 font-mono text-sm"
              />
              <button
                onClick={() => handleCopy(getHexFormat(), 'Hex')}
                className="th-btn-soft px-4 rounded-lg font-medium"
              >
                复制
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}

export default AESKeyGenerator
