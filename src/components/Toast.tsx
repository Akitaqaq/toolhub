import React, { useState, useEffect, createContext, useContext } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast 组件
const ToastItem: React.FC<{
  toast: ToastMessage
  onClose: (id: string) => void
}> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      case 'warning':
        return 'bg-yellow-500 text-white'
      case 'info':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-slate-700 text-white'
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '🔔'
    }
  }

  return (
    <div className={`
      ${getColors()}
      px-4 py-3 rounded-lg shadow-lg
      flex items-center gap-3 min-w-[280px] max-w-[400px]
      animate-slide-up backdrop-blur-sm
      border border-white/20
    `}>
      <span className="text-xl">{getIcon()}</span>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="opacity-80 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  )
}

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = Date.now().toString() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 flex flex-col items-end">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Hook
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// 快捷方法
export const toast = {
  success: (message: string, duration?: number) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'success', duration }
    })
    window.dispatchEvent(event)
  },
  error: (message: string, duration?: number) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'error', duration }
    })
    window.dispatchEvent(event)
  },
  info: (message: string, duration?: number) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'info', duration }
    })
    window.dispatchEvent(event)
  },
  warning: (message: string, duration?: number) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'warning', duration }
    })
    window.dispatchEvent(event)
  }
}

// 全局事件监听器组件（用于非React环境调用）
export const ToastEventBridge: React.FC = () => {
  const { showToast } = useToast()

  useEffect(() => {
    const handler = (e: any) => {
      const { message, type, duration } = e.detail
      showToast(message, type, duration)
    }

    window.addEventListener('toast', handler as EventListener)
    return () => window.removeEventListener('toast', handler as EventListener)
  }, [showToast])

  return null
}
