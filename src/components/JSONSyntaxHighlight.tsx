import React, { useState } from 'react'

interface JSONSyntaxHighlightProps {
  json: string
  className?: string
}

interface CollapsibleState {
  [key: string]: boolean
}

interface LineData {
  content: string
  lineNumber: number
  indent: number
  level: number
  path: string
  type: 'object' | 'array' | 'object-end' | 'array-end' | 'normal'
  hasFoldableContent: boolean
  itemCount?: number
}

const JSONSyntaxHighlight: React.FC<JSONSyntaxHighlightProps> = ({ json, className = '' }) => {
  if (!json) return null

  const [collapsed, setCollapsed] = useState<CollapsibleState>({})

  const toggleCollapse = (path: string) => {
    setCollapsed(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  // 解析JSON并构建带层级信息的行数组
  const parseJSONToLines = () => {
    try {
      const parsed = JSON.parse(json)
      const formatted = JSON.stringify(parsed, null, 2)
      const lines = formatted.split('\n')

      const lineData: LineData[] = []

      let path = 'root'

      // 通过递归解析原始JSON来统计每个容器的字段/元素数量
      const itemCounts: { [key: string]: number } = {}

      const countItemsRecursive = (obj: any, currentPath: string) => {
        if (obj === null || obj === undefined) return

        if (Array.isArray(obj)) {
          itemCounts[currentPath] = obj.length
          obj.forEach((item, index) => {
            const childPath = `${currentPath}.arr_${index}`
            countItemsRecursive(item, childPath)
          })
        } else if (typeof obj === 'object') {
          itemCounts[currentPath] = Object.keys(obj).length
          Object.keys(obj).forEach((key, index) => {
            const childPath = `${currentPath}.obj_${index}`
            countItemsRecursive(obj[key], childPath)
          })
        }
      }

      countItemsRecursive(parsed, 'root')

      // 构建路径映射：key = 行内容（简化）, value = 完整路径
      // 用于匹配行内容到正确的路径
      const buildPathMap = (obj: any, currentPath: string, pathMap: Map<string, string>, prefix = '') => {
        if (obj === null || obj === undefined) return

        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            const childPath = `${currentPath}.arr_${index}`
            // 数组元素没有键名，使用索引作为标识
            pathMap.set(`${prefix}[${index}]`, childPath)
            buildPathMap(item, childPath, pathMap, prefix + `  `)
          })
        } else if (typeof obj === 'object') {
          Object.keys(obj).forEach((key, index) => {
            const childPath = `${currentPath}.obj_${index}`
            // 记录键名到路径的映射
            pathMap.set(`${prefix}"${key}"`, childPath)
            buildPathMap(obj[key], childPath, pathMap, prefix + `  `)
          })
        }
      }

      const pathMap = new Map<string, string>()
      buildPathMap(parsed, 'root', pathMap)

      // 使用栈跟踪当前上下文
      const stackWithKeys: Array<{ type: 'object' | 'array'; path: string; obj: any; keyIndex: number }> = []

      lines.forEach((line, index) => {
        const lineNumber = index + 1
        const indent = line.match(/^\s*/)?.[0].length || 0
        const trimmed = line.trim()
        const level = stackWithKeys.length

        let type: 'object' | 'array' | 'object-end' | 'array-end' | 'normal' = 'normal'
        let hasFoldableContent = false
        let currentPath = path

        // Check for opening braces/brackets
        if (trimmed === '{') {
          type = 'object'
          hasFoldableContent = true
          if (stackWithKeys.length === 0 && path === 'root') {
            currentPath = 'root'
            stackWithKeys.push({ type: 'object', path: currentPath, obj: parsed, keyIndex: 0 })
          } else {
            const parentContainer = stackWithKeys[stackWithKeys.length - 1]
            const parentObj = parentContainer.obj
            const currentKeyIndex = parentContainer.keyIndex
            const prefix = parentContainer.type === 'object' ? 'obj' : 'arr'
            const childPath = `${parentContainer.path}.${prefix}_${currentKeyIndex}`

            currentPath = childPath
            parentContainer.keyIndex++

            const keys = Object.keys(parentObj)
            const childObj = parentObj[keys[currentKeyIndex]]
            stackWithKeys.push({ type: 'object', path: currentPath, obj: childObj, keyIndex: 0 })
          }
          path = currentPath
        } else if (trimmed === '[') {
          type = 'array'
          hasFoldableContent = true
          if (stackWithKeys.length === 0 && path === 'root') {
            currentPath = 'root'
            stackWithKeys.push({ type: 'array', path: currentPath, obj: parsed, keyIndex: 0 })
          } else {
            const parentContainer = stackWithKeys[stackWithKeys.length - 1]
            const parentObj = parentContainer.obj
            const currentKeyIndex = parentContainer.keyIndex
            const prefix = parentContainer.type === 'object' ? 'obj' : 'arr'
            const childPath = `${parentContainer.path}.${prefix}_${currentKeyIndex}`

            currentPath = childPath
            parentContainer.keyIndex++

            const keys = Object.keys(parentObj)
            const childObj = parentObj[keys[currentKeyIndex]]
            stackWithKeys.push({ type: 'array', path: currentPath, obj: childObj, keyIndex: 0 })
          }
          path = currentPath
        } else if (trimmed === '}' || trimmed === '},') {
          type = 'object-end'
          stackWithKeys.pop()
          currentPath = path
          if (path !== 'root') {
            const parts = path.split('.')
            parts.pop()
            path = parts.join('.') || 'root'
          }
        } else if (trimmed === ']' || trimmed === '],') {
          type = 'array-end'
          stackWithKeys.pop()
          currentPath = path
          if (path !== 'root') {
            const parts = path.split('.')
            parts.pop()
            path = parts.join('.') || 'root'
          }
        } else if (trimmed.endsWith('[')) {
          // Line like: "skills": [
          type = 'array'
          hasFoldableContent = true

          // 提取键名
          const keyMatch = trimmed.match(/^"([^"]+)":/)
          if (keyMatch && stackWithKeys.length > 0) {
            const keyName = keyMatch[1]
            const parentContainer = stackWithKeys[stackWithKeys.length - 1]
            const parentObj = parentContainer.obj
            const keys = Object.keys(parentObj)
            const keyIndex = keys.indexOf(keyName)

            if (keyIndex !== -1) {
              currentPath = `${parentContainer.path}.obj_${keyIndex}`
              const childObj = parentObj[keyName]
              stackWithKeys.push({ type: 'array', path: currentPath, obj: childObj, keyIndex: 0 })
              parentContainer.keyIndex = keyIndex + 1  // 更新父容器的索引
              path = currentPath
            }
          }
        } else if (trimmed.endsWith('{')) {
          // Line like: "nested": {
          type = 'object'
          hasFoldableContent = true

          // 提取键名
          const keyMatch = trimmed.match(/^"([^"]+)":/)
          if (keyMatch && stackWithKeys.length > 0) {
            const keyName = keyMatch[1]
            const parentContainer = stackWithKeys[stackWithKeys.length - 1]
            const parentObj = parentContainer.obj
            const keys = Object.keys(parentObj)
            const keyIndex = keys.indexOf(keyName)

            if (keyIndex !== -1) {
              currentPath = `${parentContainer.path}.obj_${keyIndex}`
              const childObj = parentObj[keyName]
              stackWithKeys.push({ type: 'object', path: currentPath, obj: childObj, keyIndex: 0 })
              parentContainer.keyIndex = keyIndex + 1
              path = currentPath
            }
          }
        } else {
          currentPath = path
        }

        lineData.push({
          content: line,
          lineNumber,
          indent,
          level,
          path: currentPath,
          type,
          hasFoldableContent
        })
      })

      // 将数量信息添加到对应的开始行
      return lineData.map(line => {
        if (line.type === 'object' || line.type === 'array') {
          return {
            ...line,
            itemCount: itemCounts[line.path]
          }
        }
        return line
      })
    } catch (e) {
      const lines = json.split('\n')
      return lines.map((line, index) => ({
        content: line,
        lineNumber: index + 1,
        indent: 0,
        level: 0,
        path: `line-${index}`,
        type: 'normal' as const,
        hasFoldableContent: false
      }))
    }
  }

  // 检查行是否应该显示（未被折叠）
  const shouldShowLine = (line: any): boolean => {
    const linePathParts = line.path.split('.')

    // 检查所有祖先路径（不包括当前路径本身）
    for (let i = linePathParts.length - 1; i > 0; i--) {
      const ancestorPath = linePathParts.slice(0, i).join('.')
      if (collapsed[ancestorPath]) {
        return false
      }
    }

    // 如果当前行本身被折叠，只有 object/array 类型才显示（折叠标记行）
    if (collapsed[line.path]) {
      return line.type === 'object' || line.type === 'array'
    }

    return true
  }

  // 语法高亮单行内容
  const highlightLine = (line: string): React.ReactNode => {
    const indentMatch = line.match(/^(\s*)/)
    const indent = indentMatch ? indentMatch[1] : ''
    const content = line.substring(indent.length)

    const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}\[\],])/g

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>)
      }

      const matchedText = match[0]
      let className = 'text-yellow-300'

      if (/^"/.test(matchedText)) {
        if (/:$/.test(matchedText)) {
          className = 'text-blue-400 font-medium'
        } else {
          className = 'text-green-400'
        }
      } else if (/true|false/.test(matchedText)) {
        className = 'text-purple-400 font-semibold'
      } else if (/null/.test(matchedText)) {
        className = 'text-gray-400'
      } else if (/[{}\[\]]/.test(matchedText)) {
        className = 'text-orange-400 font-bold'
      } else if (/[,]/.test(matchedText)) {
        className = 'text-slate-400'
      } else if (/-?\d/.test(matchedText)) {
        className = 'text-pink-400'
      }

      parts.push(
        <span key={`match-${match.index}`} className={className}>
          {matchedText}
        </span>
      )

      lastIndex = regex.lastIndex
    }

    if (lastIndex < content.length) {
      parts.push(<span key={`text-end-${lastIndex}`}>{content.substring(lastIndex)}</span>)
    }

    return (
      <>
        {indent && <span className="whitespace-pre">{indent}</span>}
        {parts.length > 0 ? parts : <span>{content}</span>}
      </>
    )
  }

  const renderJSON = (): React.ReactNode => {
    const lineData = parseJSONToLines()
    const maxLineNum = lineData.length
    const lineNumWidth = maxLineNum.toString().length

    // 过滤被折叠的行，但保留折叠标记行
    const visibleLines = lineData.filter(line => shouldShowLine(line))

    return (
      <div className={`flex flex-col ${className}`} style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}>
        {/* 外层容器：包含行号/折叠按钮区域 + 内容区域 */}
        <div className="flex border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/30">
          {/* 左侧：折叠箭头 + 行号 */}
          <div className="flex-shrink-0 select-none border-r border-slate-700/50 bg-slate-900/20">
            {visibleLines.map(line => {
              const paddedLineNumber = line.lineNumber.toString().padStart(lineNumWidth, ' ')
              const isCollapsed = collapsed[line.path]

              return (
                <div key={line.lineNumber} className="flex items-center" style={{ height: '1.75rem' }}>
                  {/* 折叠箭头 */}
                  <div className="w-6 text-center px-1">
                    {line.hasFoldableContent && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCollapse(line.path)
                        }}
                        className="cursor-pointer hover:bg-white/10 px-1 text-orange-400 inline-block"
                        title={line.type === 'object' ? '展开/折叠对象' : '展开/折叠数组'}
                      >
                        {isCollapsed ? '▶' : '▼'}
                      </span>
                    )}
                  </div>

                  {/* 行号 */}
                  <div className="w-10 text-right pr-2 text-slate-500 opacity-60">
                    {paddedLineNumber}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 右侧：语法高亮的JSON内容 */}
          <div className="flex-1 min-w-0 overflow-auto">
            {visibleLines.map(line => {
              const isCollapsed = collapsed[line.path]
              const isFoldableStart = line.type === 'object' || line.type === 'array'

              return (
                <div key={line.lineNumber} className="leading-relaxed px-3" style={{ height: '1.75rem' }}>
                  {isCollapsed && isFoldableStart ? (
                    <span className="text-orange-400 font-bold">
                      {line.type === 'object'
                        ? `{...${line.itemCount || 0}个字段}`
                        : `[...${line.itemCount || 0}项]`}
                    </span>
                  ) : (
                    highlightLine(line.content)
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-auto ${className}`}>
      {renderJSON()}
    </div>
  )
}

export default JSONSyntaxHighlight
