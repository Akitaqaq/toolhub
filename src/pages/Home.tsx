import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  const tools = [
    { path: '/json', title: 'JSON 格式化', desc: '美化、验证、压缩 JSON 数据，支持语法高亮和树形视图', icon: '{ }' },
    { path: '/jsonpath', title: 'JSONPath 查询', desc: '使用 JSONPath 表达式查询和提取 JSON 文档中的数据', icon: '$..' },
    { path: '/timestamp', title: '时间戳转换', desc: '批量时间戳与日期格式互转，支持多时区和自动检测', icon: '⏱' },
    { path: '/encoder', title: '编码解码', desc: 'URL / Base64 / Unicode 编码解码，支持中文和特殊字符', icon: '⇌' },
    { path: '/aes', title: 'AES 密钥生成', desc: '生成 128/192/256 位 AES 密钥，支持多种格式输出', icon: '🔑' },
    { path: '/md5', title: 'MD5 加密', desc: '生成 16 位和 32 位 MD5 哈希值，支持大小写模式', icon: '#' },
    { path: '/sql', title: 'SQL 格式化', desc: 'SQL 美化、压缩，支持 MySQL / PostgreSQL / BigQuery 等方言', icon: '▤' },
    { path: '/cron', title: 'Cron 解析', desc: '解析 Cron 表达式，生成可读描述和未来执行时间', icon: '⏳' },
    { path: '/theme', title: '主题设置', desc: '自定义网站配色方案，支持浅色/深色模式切换', icon: '◐' },
  ]

  return (
    <div className="fade-in" style={{ fontFamily: 'var(--font-display)' }}>
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6"
          style={{
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            color: 'var(--fg-muted)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          ToolHub · 在线工具集
        </div>

        <h1
          className="font-bold mb-5"
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            maxWidth: '18ch',
          }}
        >
          开发者的
          <span className="gradient-text"> 效率工具箱</span>
        </h1>

        <p className="text-lg mb-8" style={{ color: 'var(--fg-muted)', maxWidth: '56ch' }}>
          一站式在线工具集合，涵盖 JSON、SQL、编码、加密、时间戳等开发常用功能。所有数据本地处理，零上传，保护隐私。
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            to="/json"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              border: '1px solid var(--accent)',
            }}
          >
            开始使用 →
          </Link>
          <a
            href="#tools"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'transparent',
              color: 'var(--fg)',
              border: '1px solid var(--border)',
            }}
          >
            浏览全部工具
          </a>
        </div>

        <div className="flex flex-wrap gap-6 text-sm" style={{ color: 'var(--fg-muted)' }}>
          <span><strong style={{ color: 'var(--fg)', fontWeight: 600 }}>100%</strong> 本地处理</span>
          <span><strong style={{ color: 'var(--fg)', fontWeight: 600 }}>9+</strong> 实用工具</span>
          <span><strong style={{ color: 'var(--fg)', fontWeight: 600 }}>免费</strong> 无限使用</span>
        </div>
      </section>

      {/* Features grid */}
      <section id="tools" className="pb-16 md:pb-24">
        <div
          className="text-xs mb-3"
          style={{
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.1em',
            color: 'var(--accent)',
          }}
        >
          工具集
        </div>
        <h2
          className="font-bold mb-4"
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            maxWidth: '22ch',
          }}
        >
          覆盖开发全流程的工具。
        </h2>
        <p className="mb-10 text-base" style={{ color: 'var(--fg-muted)', maxWidth: '56ch' }}>
          每个工具精心设计，提供清晰的输入/输出界面、实用的示例数据和一键复制功能。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="tool-card p-6 flex flex-col gap-3 slide-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div
                className="w-10 h-10 rounded-lg inline-flex items-center justify-center text-base font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  color: 'var(--accent-fg)',
                }}
              >
                {tool.icon}
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ letterSpacing: '-0.01em', color: 'var(--fg)' }}
              >
                {tool.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mb-16">
        <div
          className="rounded-3xl p-10 md:p-16"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: 'var(--accent-fg)',
          }}
        >
          <h2
            className="font-bold mb-3"
            style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              maxWidth: '22ch',
            }}
          >
            高效开发，从好用的工具开始。
          </h2>
          <p className="mb-8 opacity-90 text-base" style={{ maxWidth: '50ch' }}>
            所有工具免费使用，数据不离开浏览器。开始提升你的工作流效率。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/json"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'var(--accent-fg)', color: 'var(--accent)' }}
            >
              立即体验
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
