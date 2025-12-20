import React from 'react'

interface JSONSyntaxHighlightProps {
  json: string
  className?: string
}

const JSONSyntaxHighlight: React.FC<JSONSyntaxHighlightProps> = ({ json, className = '' }) => {
  if (!json) return null

  // 解析 JSON 并生成语法高亮的 HTML
  const highlightJSON = (jsonString: string): string => {
    try {
      // 格式化 JSON
      const parsed = JSON.parse(jsonString)
      const formatted = JSON.stringify(parsed, null, 2)

      // 使用正则表达式替换不同类型的数据，添加对应的类名
      return formatted
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        // 字符串 - 绿色
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],])/g,
        (match) => {
          let cls = 'text-yellow-300' // 默认

          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'text-blue-400 font-medium' // 键名
            } else {
              cls = 'text-green-400' // 字符串值
            }
          } else if (/true|false/.test(match)) {
            cls = 'text-purple-400 font-semibold' // 布尔值
          } else if (/null/.test(match)) {
            cls = 'text-gray-400' // null
          } else if (/[\{\}\[\]]/.test(match)) {
            cls = 'text-orange-400 font-bold' // 括号
          } else if (/[,]/.test(match)) {
            cls = 'text-slate-400' // 逗号
          } else if (/-?\d/.test(match)) {
            cls = 'text-pink-400' // 数字
          }

          return `<span class="${cls}">${match}</span>`
        })
    } catch (e) {
      // 如果解析失败，返回原始文本
      return jsonString.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
    }
  }

  return (
    <div
      className={`font-mono text-sm leading-relaxed overflow-auto ${className}`}
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace"
      }}
      dangerouslySetInnerHTML={{ __html: highlightJSON(json) }}
    />
  )
}

export default JSONSyntaxHighlight
