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
      return <span style={{ color: 'var(--syn-null)' }}>null</span>
    }

    if (type === 'string') {
      return <span style={{ color: 'var(--syn-string)' }}>"{value}"</span>
    }

    if (type === 'number') {
      return <span style={{ color: 'var(--syn-number)' }}>{value}</span>
    }

    if (type === 'boolean') {
      return <span style={{ color: 'var(--syn-bool)', fontWeight: 600 }}>{value.toString()}</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span style={{ color: 'var(--syn-bracket)' }}>[]</span>
      }

      const isCollapsed = collapsed[currentPath]
      const countInfo = getCountInfo(value)

      return (
        <div className="ml-4">
          <span
            onClick={() => toggleCollapse(currentPath)}
            className="cursor-pointer hover:bg-white/10 px-1 rounded transition-colors inline-flex items-center gap-1"
          >
            <span style={{ color: 'var(--syn-bracket)' }}>[</span>
            <span className="font-bold" style={{ color: 'var(--syn-bracket)' }}>{isCollapsed ? '▶' : '▼'}</span>
            <span style={{ color: 'var(--syn-bracket)' }}>{countInfo.trimStart()}</span>
            <span style={{ color: 'var(--syn-bracket)' }}>]</span>
          </span>
          {!isCollapsed && (
            <div className="ml-4 pl-2" style={{ borderLeft: '1px solid var(--border)' }}>
              {value.map((item, index) => (
                <div key={index} className="leading-relaxed">
                  <span style={{ color: 'var(--syn-line-num)' }}>{index}:</span>
                  {renderValue(item, `${key}[${index}]`, `${currentPath}.${index}`)}
                  {index < value.length - 1 && <span style={{ color: 'var(--syn-comma)' }}>,</span>}
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
        return <span style={{ color: 'var(--syn-bracket)' }}>{emptyObj}</span>
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
            <span style={{ color: 'var(--syn-bracket)' }}>{openBrace}</span>
            <span className="font-bold" style={{ color: 'var(--syn-bracket)' }}>{isCollapsed ? '▶' : '▼'}</span>
            <span style={{ color: 'var(--syn-bracket)' }}>{countInfo.trimStart()}</span>
            <span style={{ color: 'var(--syn-bracket)' }}>{closeBrace}</span>
          </span>
          {!isCollapsed && (
            <div className="ml-4 pl-2" style={{ borderLeft: '1px solid var(--border)' }}>
              {keys.map((objKey, index) => (
                <div key={objKey} className="leading-relaxed">
                  <span style={{ color: 'var(--syn-key)', fontWeight: 500 }}>"{objKey}"</span>
                  <span style={{ color: 'var(--syn-comma)' }}>: </span>
                  {renderValue(value[objKey], objKey, `${currentPath}.${objKey}`)}
                  {index < keys.length - 1 && <span style={{ color: 'var(--syn-comma)' }}>,</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <span style={{ color: 'var(--syn-number)' }}>{String(value)}</span>
  }

  if (!data) return null

  return (
    <div className={`font-mono text-sm leading-relaxed ${className}`} style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}>
      {renderValue(data, 'root', path)}
    </div>
  )
}

export default CollapsibleJSONTree
