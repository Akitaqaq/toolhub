import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

interface CustomDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'info' | 'success' | 'error' | 'warning'
  confirmText?: string
  onConfirm?: () => void
  showCancel?: boolean
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = '确定',
  onConfirm,
  showCancel = true
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return { border: 'border-emerald-500', icon: '✅', accent: 'text-emerald-400' }
      case 'error':
        return { border: 'border-red-500', icon: '❌', accent: 'text-red-400' }
      case 'warning':
        return { border: 'border-yellow-500', icon: '⚠️', accent: 'text-yellow-400' }
      default:
        return { border: 'border-blue-500', icon: 'ℹ️', accent: 'text-blue-400' }
    }
  }

  const styles = getTypeStyles()

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[10000]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`
                w-full max-w-md transform overflow-hidden rounded-2xl
                bg-slate-900/95 backdrop-blur-xl border ${styles.border}
                p-6 text-left align-middle shadow-2xl
                transition-all
              `}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{styles.icon}</span>
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className={`text-lg font-bold leading-6 ${styles.accent}`}
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  {showCancel && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 transition-colors"
                    >
                      取消
                    </button>
                  )}
                  {onConfirm && (
                    <button
                      type="button"
                      onClick={() => {
                        onConfirm()
                        onClose()
                      }}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-colors
                        ${type === 'error'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : type === 'success'
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }
                      `}
                    >
                      {confirmText}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

// Hook 简化使用
export const useDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Omit<CustomDialogProps, 'isOpen' | 'onClose'> | null>(null)

  const open = (props: Omit<CustomDialogProps, 'isOpen' | 'onClose'>) => {
    setConfig(props)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setConfig(null)
  }

  return {
    isOpen,
    open,
    close,
    Dialog: () => config ? (
      <CustomDialog
        isOpen={isOpen}
        onClose={close}
        {...config}
      />
    ) : null
  }
}
