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
        return { borderColor: 'var(--success)', icon: '✅', accentColor: 'var(--success)' }
      case 'error':
        return { borderColor: 'var(--error)', icon: '❌', accentColor: 'var(--error)' }
      case 'warning':
        return { borderColor: 'var(--warning)', icon: '⚠️', accentColor: 'var(--warning)' }
      default:
        return { borderColor: 'var(--info)', icon: 'ℹ️', accentColor: 'var(--info)' }
    }
  }

  const styles = getTypeStyles()

  const getConfirmBg = () => {
    switch (type) {
      case 'error': return 'var(--error)'
      case 'success': return 'var(--success)'
      default: return 'var(--info)'
    }
  }

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
              <Dialog.Panel
                className="w-full max-w-md transform overflow-hidden rounded-2xl backdrop-blur-xl p-6 text-left align-middle shadow-2xl transition-all"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${styles.borderColor}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{styles.icon}</span>
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6"
                      style={{ color: styles.accentColor }}
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--fg-secondary)' }}>
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
                      className="th-btn-ghost px-4 py-2 text-sm"
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
                      className="px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{ background: getConfirmBg(), color: '#fff' }}
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
