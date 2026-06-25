import React, { useState, useRef, useCallback } from 'react'
import { toast } from '../components/Toast'

interface ImageFile {
  id: string
  file: File
  name: string
  originalSize: number
  previewUrl: string
  compressedBlob?: Blob
  compressedSize?: number
  compressedUrl?: string
  status: 'pending' | 'compressing' | 'done' | 'error'
  error?: string
  originalWidth?: number
  originalHeight?: number
  compressedWidth?: number
  compressedHeight?: number
}

interface CompressOptions {
  format: 'jpeg' | 'png' | 'webp'
  quality: number
  scale: number
}

const FORMAT_MIME: Record<string, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function getExt(name: string, format: string): string {
  const base = name.replace(/\.[^.]+$/, '')
  return `${base}.${format === 'jpeg' ? 'jpg' : format}`
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

async function compressImage(file: File, options: CompressOptions): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const targetWidth = Math.round(img.width * options.scale)
      const targetHeight = Math.round(img.height * options.scale)

      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'))
        return
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('压缩失败'))
            return
          }
          resolve({ blob, width: targetWidth, height: targetHeight })
        },
        FORMAT_MIME[options.format],
        options.quality / 100
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }

    img.src = url
  })
}

const ImageCompressor: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([])
  const [options, setOptions] = useState<CompressOptions>({ format: 'jpeg', quality: 80, scale: 1 })
  const [dragging, setDragging] = useState(false)
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
    const newImages: ImageFile[] = []

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`"${file.name}" 不是支持的图片格式`)
        return
      }
      newImages.push({
        id: generateId(),
        file,
        name: file.name,
        originalSize: file.size,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
      })
    })

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages])
      toast.success(`已添加 ${newImages.length} 张图片`)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
      e.target.value = ''
    }
  }, [addFiles])

  const compressSingle = async (img: ImageFile, opts: CompressOptions) => {
    setImages((prev) =>
      prev.map((i) => (i.id === img.id ? { ...i, status: 'compressing' as const, error: undefined } : i))
    )

    try {
      const result = await compressImage(img.file, opts)
      const compressedUrl = URL.createObjectURL(result.blob)

      setImages((prev) =>
        prev.map((i) =>
          i.id === img.id
            ? {
                ...i,
                compressedBlob: result.blob,
                compressedSize: result.blob.size,
                compressedUrl,
                compressedWidth: result.width,
                compressedHeight: result.height,
                status: 'done' as const,
              }
            : i
        )
      )
    } catch (err) {
      setImages((prev) =>
        prev.map((i) =>
          i.id === img.id
            ? { ...i, status: 'error' as const, error: err instanceof Error ? err.message : '压缩失败' }
            : i
        )
      )
    }
  }

  const handleCompressAll = async () => {
    const pending = images.filter((i) => i.status === 'pending' || i.status === 'error')
    if (pending.length === 0) {
      toast.info('没有需要压缩的图片')
      return
    }

    toast.info(`开始压缩 ${pending.length} 张图片...`)

    for (const img of pending) {
      await compressSingle(img, options)
    }

    toast.success('全部压缩完成')
  }

  const handleDownload = (img: ImageFile) => {
    if (!img.compressedBlob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(img.compressedBlob)
    a.download = getExt(img.name, options.format)
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('下载成功')
  }

  const handleDownloadAll = () => {
    const done = images.filter((i) => i.status === 'done' && i.compressedBlob)
    if (done.length === 0) {
      toast.info('没有可下载的图片')
      return
    }
    done.forEach((img, index) => {
      setTimeout(() => handleDownload(img), index * 200)
    })
  }

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) {
        URL.revokeObjectURL(img.previewUrl)
        if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl)
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  const handleClearAll = () => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.previewUrl)
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl)
    })
    setImages([])
  }

  const totalOriginal = images.reduce((s, i) => s + i.originalSize, 0)
  const totalCompressed = images.reduce((s, i) => s + (i.compressedSize || 0), 0)
  const doneCount = images.filter((i) => i.status === 'done').length

  return (
    <div className="max-w-[90rem] mx-auto space-y-6 animate-fade-in px-4">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">图片压缩</h2>
        <p style={{ color: 'var(--fg-muted)' }}>在浏览器本地压缩图片，支持 JPEG / PNG / WebP，可调节质量和尺寸</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 xl:gap-8 gap-4">
        {/* Left: Upload & Options */}
        <div className="xl:col-span-1 space-y-4">
          {/* Upload area */}
          <div
            className="glass rounded-xl p-5 space-y-4 cursor-pointer transition-all"
            style={{
              border: dragging ? '2px dashed var(--accent)' : '2px dashed var(--border)',
              background: dragging ? 'var(--surface-active)' : undefined,
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">🖼️</div>
              <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
                {dragging ? '松开鼠标上传图片' : '拖拽图片到此处或点击上传'}
              </p>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                支持 JPG / PNG / WebP / GIF / BMP
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Options panel */}
          <div className="glass rounded-xl p-5 space-y-5">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>压缩设置</h3>

            {/* Format */}
            <div className="space-y-2">
              <label className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>输出格式</label>
              <div className="flex gap-2">
                {(['jpeg', 'png', 'webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    className="th-tag flex-1"
                    style={{
                      background: options.format === fmt ? 'var(--accent)' : 'var(--surface)',
                      color: options.format === fmt ? 'var(--accent-fg)' : 'var(--fg-muted)',
                      border: options.format === fmt ? '1px solid var(--accent)' : '1px solid var(--border)',
                    }}
                    onClick={() => setOptions((o) => ({ ...o, format: fmt }))}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>压缩质量</label>
                <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{options.quality}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={options.quality}
                onChange={(e) => setOptions((o) => ({ ...o, quality: Number(e.target.value) }))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--accent) ${options.quality}%, var(--border) ${options.quality}%)`,
                }}
              />
              {options.format === 'png' && (
                <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>PNG 为无损格式，质量参数不影响文件大小</p>
              )}
            </div>

            {/* Scale */}
            <div className="space-y-2">
              <label className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>缩放比例</label>
              <div className="flex gap-2">
                {[
                  { label: '100%', value: 1 },
                  { label: '75%', value: 0.75 },
                  { label: '50%', value: 0.5 },
                  { label: '25%', value: 0.25 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className="th-tag flex-1"
                    style={{
                      background: options.scale === opt.value ? 'var(--accent)' : 'var(--surface)',
                      color: options.scale === opt.value ? 'var(--accent-fg)' : 'var(--fg-muted)',
                      border: options.scale === opt.value ? '1px solid var(--accent)' : '1px solid var(--border)',
                    }}
                    onClick={() => setOptions((o) => ({ ...o, scale: opt.value }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                className="th-btn-accent w-full flex items-center justify-center gap-2"
                onClick={handleCompressAll}
                disabled={images.length === 0}
              >
                <span>🗜️</span> 开始压缩
              </button>
              <div className="flex gap-2">
                <button
                  className="th-btn-ghost flex-1 flex items-center justify-center gap-1"
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0}
                >
                  <span>📥</span> 全部下载
                </button>
                <button
                  className="th-btn-danger flex-1 flex items-center justify-center gap-1"
                  onClick={handleClearAll}
                  disabled={images.length === 0}
                >
                  <span>🗑️</span> 清空
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          {images.length > 0 && (
            <div className="glass rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>压缩统计</h3>
              <div className="space-y-1 text-xs" style={{ color: 'var(--fg-muted)' }}>
                <div className="flex justify-between">
                  <span>图片数量</span>
                  <span style={{ color: 'var(--fg)' }}>{images.length} 张</span>
                </div>
                <div className="flex justify-between">
                  <span>原始大小</span>
                  <span style={{ color: 'var(--fg)' }}>{formatSize(totalOriginal)}</span>
                </div>
                {doneCount > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>压缩后大小</span>
                      <span style={{ color: 'var(--accent)' }}>{formatSize(totalCompressed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>节省空间</span>
                      <span style={{ color: 'var(--accent)' }}>
                        {formatSize(totalOriginal - totalCompressed)} (
                        {((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Results list */}
        <div className="xl:col-span-2">
          {images.length === 0 ? (
            <div
              className="glass rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-3"
              style={{ minHeight: '300px' }}
            >
              <div className="text-5xl opacity-40">📷</div>
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                暂无图片，请在左侧上传
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {images.map((img) => (
                <div key={img.id} className="glass rounded-xl p-4 slide-up">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div
                      className="w-20 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                      style={{ border: '1px solid var(--border)' }}
                      onClick={() => setPreviewImage(img)}
                    >
                      <img
                        src={img.compressedUrl || img.previewUrl}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--fg)' }}>
                        {img.name}
                      </p>

                      {img.status === 'pending' && (
                        <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                          原始大小: {formatSize(img.originalSize)}
                          {img.originalWidth && ` · ${img.originalWidth}×${img.originalHeight}`}
                        </p>
                      )}

                      {img.status === 'compressing' && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border-2 animate-spin"
                            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
                          />
                          <p className="text-xs" style={{ color: 'var(--accent)' }}>压缩中...</p>
                        </div>
                      )}

                      {img.status === 'done' && img.compressedSize && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 text-xs">
                            <span style={{ color: 'var(--fg-muted)' }}>
                              {formatSize(img.originalSize)}
                            </span>
                            <span style={{ color: 'var(--fg-muted)' }}>→</span>
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                              {formatSize(img.compressedSize)}
                            </span>
                            <span
                              className="px-1.5 py-0.5 rounded text-xs font-medium"
                              style={{
                                background: 'var(--accent)',
                                color: 'var(--accent-fg)',
                                opacity: 0.9,
                              }}
                            >
                              节省 {((1 - img.compressedSize / img.originalSize) * 100).toFixed(1)}%
                            </span>
                          </div>
                          {img.compressedWidth && (
                            <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>
                              {img.compressedWidth}×{img.compressedHeight} · {options.format.toUpperCase()}
                            </p>
                          )}
                        </div>
                      )}

                      {img.status === 'error' && (
                        <p className="text-xs" style={{ color: 'var(--danger)' }}>
                          ❌ {img.error || '压缩失败'}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {img.status === 'done' && (
                        <>
                          <button
                            className="th-btn-ghost text-xs px-3 py-1"
                            onClick={() => setPreviewImage(img)}
                          >
                            预览
                          </button>
                          <button
                            className="th-btn-accent text-xs px-3 py-1"
                            onClick={() => handleDownload(img)}
                          >
                            下载
                          </button>
                        </>
                      )}
                      <button
                        className="th-btn-danger text-xs px-3 py-1"
                        onClick={() => handleRemove(img.id)}
                      >
                        移除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
                {previewImage.name}
              </h3>
              <button
                className="th-btn-ghost text-sm px-3 py-1"
                onClick={() => setPreviewImage(null)}
              >
                关闭
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>
                  原图 · {formatSize(previewImage.originalSize)}
                </p>
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <img
                    src={previewImage.previewUrl}
                    alt="原图"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Compressed */}
              {previewImage.compressedUrl && (
                <div className="space-y-2">
                  <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                    压缩后 · {formatSize(previewImage.compressedSize || 0)}
                  </p>
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <img
                      src={previewImage.compressedUrl}
                      alt="压缩后"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageCompressor
