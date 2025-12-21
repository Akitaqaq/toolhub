# ToolHub - 多功能工具集合网站

一个基于 React + Vite + Tailwind CSS 的现代化在线工具集合网站。

## 功能特性

- ✅ **JSON格式化** - 格式化、验证、压缩JSON数据
- ✅ **时间戳转换** - 时间戳与日期格式互转、多时区支持
- ✅ **编码解码** - URL、Base64、HTML实体、Unicode转换

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS v3
- **路由**: React Router v6

## 项目结构

```
toolhub/
├── src/
│   ├── components/          # 组件
│   │   ├── Layout.tsx      # 布局组件
│   │   └── ToolCard.tsx    # 工具卡片组件
│   ├── pages/              # 页面
│   │   ├── Home.tsx        # 首页
│   │   ├── JSONFormatter.tsx
│   │   ├── TimestampConverter.tsx
│   │   └── EncoderDecoder.tsx
│   ├── styles/             # 样式
│   │   └── global.css      # 全局样式
│   ├── App.tsx             # 应用入口
│   └── main.tsx            # 主入口
├── public/                 # 静态资源
├── index.html              # HTML入口
├── tailwind.config.cjs      # Tailwind配置
├── vite.config.ts          # Vite配置
└── package.json            # 项目配置
```

## 功能说明

### JSON格式化
- 支持2/4/8空格缩进
- 语法验证和错误提示
- 一键压缩/格式化
- 示例数据快速填充

### 时间戳转换
- 秒级/毫秒级自动识别
- 多时区支持 (UTC, Asia/Europe/America等)
- 日期转时间戳 / 时间戳转日期
- 当前时间快速获取

### 编码解码
- **URL编码**: 特殊字符处理
- **Base64**: 中文文本支持
- **HTML实体**: XSS防护转义
- **Unicode**: 中文与\\u格式互转

## 设计特色

- 🎨 **渐变主题**: 精心设计的渐变色系统
- 💫 **动效交互**: 流畅的滑入、淡入动画
- 🌓 **明暗主题**: 支持暗黑模式
- 📱 **响应式**: 完美适配移动端
- ⚡ **本地处理**: 所有数据不上传，隐私安全

## 浏览器支持

- Chrome/Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14

## 开发说明

1. 所有工具处理均在浏览器本地完成，无服务器依赖
2. 使用 TypeScript 确保类型安全
3. Tailwind CSS 提供快速样式开发
4. 可以通过扩展 `src/pages/` 目录轻松添加新工具

## 部署建议

- **Vercel**: 一键部署，全球CDN加速
- **Netlify**: 自动化部署，免费SSL
- **Cloudflare Pages**: 速度快，免费

## 许可证

MIT License

---

Made with ❤️ by ToolHub Team