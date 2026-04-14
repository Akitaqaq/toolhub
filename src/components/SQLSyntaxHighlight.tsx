import React from 'react'

interface SQLSyntaxHighlightProps {
  sql: string
  className?: string
}

const SQLSyntaxHighlight: React.FC<SQLSyntaxHighlightProps> = ({ sql, className = '' }) => {
  if (!sql) return null

  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
    'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA',
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'CROSS', 'NATURAL',
    'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'ILIKE',
    'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'ALL',
    'UNION', 'INTERSECT', 'EXCEPT', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'ASC', 'DESC', 'TRUE', 'FALSE', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
    'UNIQUE', 'CHECK', 'DEFAULT', 'AUTO_INCREMENT', 'IDENTITY', 'CONSTRAINT',
    'COMMIT', 'ROLLBACK', 'TRANSACTION', 'BEGIN', 'GRANT', 'REVOKE', 'PRIVILEGES',
    'CAST', 'CONVERT', 'COALESCE', 'IFNULL', 'ISNULL', 'NVL', 'DECODE',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'OVER', 'PARTITION', 'ROW_NUMBER',
    'RANK', 'DENSE_RANK', 'LEAD', 'LAG', 'FIRST_VALUE', 'LAST_VALUE'
  ]

  const keywordSet = new Set(keywords.map(k => k.toUpperCase()))

  const isKeyword = (word: string): boolean => keywordSet.has(word.toUpperCase())

  // 高亮SQL
  const highlightSQL = (text: string): React.ReactNode[] => {
    const lines = text.split('\n')
    return lines.map((line, lineIndex) => {
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      let inString: false | "'" | '"' | '`' = false
      let inMultiLineComment = false
      let i = 0

      const flushText = (end: number, keySuffix: string, className?: string) => {
        if (lastIndex < end) {
          const text = line.slice(lastIndex, end)
          parts.push(
            <span key={`${keySuffix}-${lineIndex}-${lastIndex}`} className={className}>
              {text}
            </span>
          )
        }
      }

      while (i < line.length) {
        // 单行注释
        if (!inString && !inMultiLineComment && line.slice(i, i + 2) === '--') {
          flushText(i, 'pre')
          parts.push(
            <span key={`comment-${lineIndex}-${i}`} className="text-slate-500 italic">
              {line.slice(i)}
            </span>
          )
          lastIndex = line.length
          break
        }

        // 多行注释开始
        if (!inString && !inMultiLineComment && line.slice(i, i + 2) === '/*') {
          flushText(i, 'pre')
          inMultiLineComment = true
          const start = i
          i += 2
          while (i < line.length) {
            if (line.slice(i, i + 2) === '*/') {
              i += 2
              break
            }
            i++
          }
          parts.push(
            <span key={`comment-${lineIndex}-${start}`} className="text-slate-500 italic">
              {line.slice(start, i)}
            </span>
          )
          lastIndex = i
          inMultiLineComment = false
          continue
        }

        if (inMultiLineComment) {
          if (line.slice(i, i + 2) === '*/') {
            flushText(i + 2, 'comment', 'text-slate-500 italic')
            i += 2
            lastIndex = i
            inMultiLineComment = false
            continue
          }
          i++
          continue
        }

        // 字符串处理
        if (!inString && (line[i] === "'" || line[i] === '"' || line[i] === '`')) {
          flushText(i, 'pre')
          inString = line[i] as "'" | '"' | '`'
          const start = i
          i++
          while (i < line.length) {
            if (line[i] === '\\') {
              i += 2
              continue
            }
            if (line[i] === inString) {
              i++
              break
            }
            i++
          }
          parts.push(
            <span key={`string-${lineIndex}-${start}`} className="text-green-400">
              {line.slice(start, i)}
            </span>
          )
          lastIndex = i
          inString = false
          continue
        }

        if (inString) {
          i++
          continue
        }

        // 数字
        const numMatch = line.slice(i).match(/^-?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?/)
        if (numMatch) {
          flushText(i, 'pre')
          const num = numMatch[0]
          parts.push(
            <span key={`num-${lineIndex}-${i}`} className="text-pink-400">
              {num}
            </span>
          )
          i += num.length
          lastIndex = i
          continue
        }

        // 标识符 / 关键字 / 函数名
        const identMatch = line.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/)
        if (identMatch) {
          flushText(i, 'pre')
          const word = identMatch[0]
          const nextChar = line[i + word.length]
          const isFunc = nextChar === '('
          const className = isFunc
            ? 'text-yellow-300'
            : isKeyword(word)
            ? 'text-purple-400 font-semibold'
            : undefined

          parts.push(
            <span key={`word-${lineIndex}-${i}`} className={className}>
              {word}
            </span>
          )
          i += word.length
          lastIndex = i
          continue
        }

        i++
      }

      if (lastIndex < line.length) {
        flushText(line.length, 'end')
      }

      return (
        <div key={`line-${lineIndex}`} className="leading-relaxed whitespace-pre">
          {parts.length > 0 ? parts : <span>{line}</span>}
        </div>
      )
    })
  }

  return (
    <div className={`overflow-auto ${className}`} style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}>
      {highlightSQL(sql)}
    </div>
  )
}

export default SQLSyntaxHighlight
