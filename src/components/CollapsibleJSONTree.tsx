import React, { useState } from 'react'

interface CollapsibleJSONTreeProps {
  data: any
  path?: string
  className?: string
}

interface CollapsibleState {
  [key: string]: boolean
}

const CollapsibleJSONTree: React.FC<CollapsibleJSONTreeProps> = ({
  data,
  path = 'root',
  className = ''
}) => {
  const [collapsed, setCollapsed] = useState<CollapsibleState>({})

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const getCountInfo = (value: any): string => {
    if (Array.isArray(value)) {
      return ` [${value.length}项]`
    }
    if (typeof value === 'object' && value !== null) {
      const keys = Object.keys(value)
      return ` {${keys.length}个字段}`
    }
    return ''
  }

  const renderValue = (value: any, key: string, currentPath: string): React.ReactNode => {
    const type = typeof value

    if (value === null) {
      return <span className="text-gray-400">null</span>
    }

    if (type === 'string') {
      return <span className="text-green-400">"{value}"</span>
    }

    if (type === 'number') {
      return <span className="text-pink-400">{value}</span>
    }

    if (type === 'boolean') {
      return <span className="text-purple-400 font-semibold">{value.toString()}</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-orange-400">[]</span>
      }

      const isCollapsed = collapsed[currentPath]
      const countInfo = getCountInfo(value)

      return (
        <div className="ml-4">
          <span
            onClick={() => toggleCollapse(currentPath)}
            className="cursor-pointer hover:bg-white/10 px-1 rounded transition-colors inline-flex items-center gap-1"
          >
            <span className="text-orange-400">[</span>
            <span className="text-orange-400 font-bold">{isCollapsed ? '▶' : '▼'}</span>
            <span className="text-orange-400">{countInfo.trimStart()}</span>
            <span className="text-orange-400">]</span>
          </span>
          {!isCollapsed && (
            <div className="ml-4 border-l border-slate-700 pl-2">
              {value.map((item, index) => (
                <div key={index} className="leading-relaxed">
                  <span className="text-slate-500">{index}:</span>
                  {renderValue(item, `${key}[${index}]`, `${currentPath}.${index}`)}
                  {index < value.length - 1 && <span className="text-slate-400">,</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (type === 'object') {
      const keys = Object.keys(value)
      if (keys.length === 0) {
        const emptyObj = '{}'
        return <span className="text-orange-400">{emptyObj}</span>
      }

      const isCollapsed = collapsed[currentPath]
      const countInfo = getCountInfo(value)

      const openBrace = '{'
      const closeBrace = '}'
      return (
        <div className="ml-4">
          <span
            onClick={() => toggleCollapse(currentPath)}
            className="cursor-pointer hover:bg-white/10 px-1 rounded transition-colors inline-flex items-center gap-1"
          >
            <span className="text-orange-400">{openBrace}</span>
            <span className="text-orange-400 font-bold">{isCollapsed ? '▶' : '▼'}</span>
            <span className="text-orange-400">{countInfo.trimStart()}</span>
            <span className="text-orange-400">{closeBrace}</span>
          </span>
          {!isCollapsed && (
            <div className="ml-4 border-l border-slate-700 pl-2">
              {keys.map((objKey, index) => (
                <div key={objKey} className="leading-relaxed">
                  <span className="text-blue-400 font-medium">"{objKey}"</span>
                  <span className="text-slate-400">: </span>
                  {renderValue(value[objKey], objKey, `${currentPath}.${objKey}`)}
                  {index < keys.length - 1 && <span className="text-slate-400">,</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <span className="text-yellow-300">{String(value)}</span>
  }

  if (!data) return null

  return (
    <div className={`font-mono text-sm leading-relaxed ${className}`} style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}>
      {renderValue(data, 'root', path)}
    </div>
  )
}

export default CollapsibleJSONTree
