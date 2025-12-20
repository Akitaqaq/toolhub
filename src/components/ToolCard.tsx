import React from 'react'
import { Link } from 'react-router-dom'

interface ToolCardProps {
  path: string
  title: string
  description: string
  icon: string
  gradient: string
  delay?: number
}

export const ToolCard: React.FC<ToolCardProps> = ({ path, title, description, icon, gradient, delay = 0 }) => {
  return (
    <Link
      to={path}
      className="tool-card rounded-xl p-6 block cursor-pointer slide-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start space-x-4">
        <div className={`text-4xl p-3 rounded-lg ${gradient} bg-clip-text text-transparent`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <div className="text-slate-500 text-xl">→</div>
      </div>
    </Link>
  )
}

export const GradientButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  className?: string
  type?: 'button' | 'submit' | 'reset'
}> = ({ children, onClick, variant = 'primary', className = '', type = 'button' }) => {
  const gradients = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
    secondary: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 text-white rounded-lg transition-all font-medium ${gradients[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export const GlassContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`glass rounded-xl p-4 ${className}`}>
      {children}
    </div>
  )
}

export const Input: React.FC<{
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  multiline?: boolean
  className?: string
}> = ({ value, onChange, placeholder, multiline = false, className = '' }) => {
  const baseClass = "w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"

  return multiline ? (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${baseClass} h-32 ${className}`}
      spellCheck={false}
    />
  ) : (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${baseClass} ${className}`}
    />
  )
}