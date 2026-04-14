import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  const tools = [
    {
      path: '/json',
      title: 'JSON格式化',
      description: '美化、验证、转换JSON数据',
      icon: '🔧',
      gradient: 'bg-gradient-to-br from-blue-500 to-purple-600',
    },
    {
      path: '/jsonpath',
      title: 'JSONPath查询',
      description: '强大的JSON数据查询和提取工具',
      icon: '🔍',
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    },
    {
      path: '/timestamp',
      title: '时间戳转换',
      description: '时间戳与日期格式互转',
      icon: '⏰',
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
    },
    {
      path: '/encoder',
      title: '编码解码',
      description: 'URL、Base64、HTML实体编码',
      icon: '🔐',
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
    },
    {
      path: '/aes',
      title: 'AES密钥生成',
      description: '生成安全的AES加密密钥',
      icon: '🔑',
      gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    },
    {
      path: '/md5',
      title: 'MD5加密',
      description: '生成MD5哈希值，支持16/32位',
      icon: '🔒',
      gradient: 'bg-gradient-to-br from-orange-500 to-red-600',
    },
    {
      path: '/sql',
      title: 'SQL格式化',
      description: 'SQL美化、压缩和多数据库方言支持',
      icon: '🗃️',
      gradient: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    },
    {
      path: '/cron',
      title: 'Cron表达式解析',
      description: '解析Cron表达式，查看可读描述和下次执行时间',
      icon: '⏳',
      gradient: 'bg-gradient-to-br from-indigo-500 to-violet-600',
    },
    {
      path: '/theme',
      title: '主题设置',
      description: '自定义网站配色方案',
      icon: '🎨',
      gradient: 'bg-gradient-to-br from-yellow-500 to-pink-600',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 英雄区域 */}
      <div className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text neon-text">
          ToolHub
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-2">
          多功能在线工具集合网站
        </p>
        <p className="text-slate-400 text-lg">
          一站式解决开发、数据处理、编码转换等需求
        </p>
      </div>

      {/* 特性展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="tool-card rounded-xl p-6 block cursor-pointer slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start space-x-4">
              <div className={`text-4xl ${tool.gradient} p-3 rounded-lg bg-clip-text text-transparent`}>
                {tool.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
                <p className="text-slate-400 text-sm">{tool.description}</p>
              </div>
              <div className="text-slate-500 text-xl">→</div>
            </div>
          </Link>
        ))}
      </div>

      {/* 统计信息 */}
      <div className="glass rounded-xl p-8 text-center">
        <div className="grid grid-cols-4 gap-3 md:gap-6">
          <div>
            <div className="text-2xl font-bold gradient-text">100%</div>
            <div className="text-slate-400 text-xs mt-1">本地处理</div>
          </div>
          <div>
            <div className="text-2xl font-bold gradient-text">🚀</div>
            <div className="text-slate-400 text-xs mt-1">快速响应</div>
          </div>
          <div>
            <div className="text-2xl font-bold gradient-text">🔒</div>
            <div className="text-slate-400 text-xs mt-1">隐私安全</div>
          </div>
          <div>
            <div className="text-2xl font-bold gradient-text">🔐</div>
            <div className="text-slate-400 text-xs mt-1">加密支持</div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">使用指南</h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>选择对应的功能模块，无需安装任何软件</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>所有数据在浏览器本地处理，安全可靠</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-400">✓</span>
            <span>支持一键复制、批量处理等便捷功能</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Home