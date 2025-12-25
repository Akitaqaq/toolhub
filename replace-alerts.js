// 快速替换 alert 的脚本
const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/AESKeyGenerator.tsx',
  'src/pages/EncoderDecoder.tsx',
  'src/pages/JSONFormatter.tsx',
  'src/pages/TimestampConverter.tsx'
];

const replacements = [
  { from: "alert('✅ 密钥字符串已复制！')", to: "toast.success('密钥字符串已复制！')" },
  { from: "alert('✅ Java字节数组格式已复制！')", to: "toast.success('Java字节数组格式已复制！')" },
  { from: "alert('✅ Hex格式已复制！')", to: "toast.success('Hex格式已复制！')" },
  { from: "alert('✅ 原始字节已复制！')", to: "toast.success('原始字节已复制！')" },
  { from: "alert('已复制到剪贴板！')", to: "toast.success('已复制到剪贴板！')" },
  { from: "alert('输入+输出已合并复制！')", to: "toast.success('输入+输出已合并复制！')" },
  { from: "alert(`输入长度: ${inputLen}\\n输出长度: ${outputLen}\\n字符数变化: ${outputLen - inputLen}`)", to: "toast.info(`输入长度: ${inputLen}, 输出长度: ${outputLen}, 字符数变化: ${outputLen - inputLen}`)" },
  { from: "alert('至少需要保留一个输入组')", to: "toast.warning('至少需要保留一个输入组')" },
  { from: "alert('剪贴板为空')", to: "toast.warning('剪贴板为空')" },
  { from: "alert('剪贴板内容不包含有效文本')", to: "toast.warning('剪贴板内容不包含有效文本')" },
  { from: "alert(`成功导入 ${newItems.length} 个输入项`)", to: "toast.success(`成功导入 ${newItems.length} 个输入项`)" },
  { from: "alert('无法读取剪贴板，请确保授予相应权限')", to: "toast.error('无法读取剪贴板，请确保授予相应权限')" },
  { from: "alert('没有可复制的结果')", to: "toast.warning('没有可复制的结果')" },
  { from: "alert('所有结果已复制到剪贴板！')", to: "toast.success('所有结果已复制到剪贴板！')" },
  { from: "alert('没有可导出的结果')", to: "toast.warning('没有可导出的结果')" },
  { from: "alert('对比结果已复制到剪贴板！')", to: "toast.success('对比结果已复制到剪贴板！')" }
];

// 需要添加 import 的文件
const importStatement = "import { toast } from '../components/Toast'\n";

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 添加 import（如果还没有）
  if (!content.includes("import { toast }")) {
    const lines = content.split('\n');
    const firstImportIndex = lines.findIndex(line => line.startsWith('import'));
    if (firstImportIndex !== -1) {
      lines.splice(firstImportIndex, 0, importStatement);
      content = lines.join('\n');
    }
  }

  // 替换所有 alert
  let changed = false;
  replacements.forEach(rep => {
    if (content.includes(rep.from)) {
      content = content.replaceAll(rep.from, rep.to);
      changed = true;
      console.log(`✅ ${file}: 替换 "${rep.from.substring(0, 30)}..."`);
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`📝 已更新: ${file}`);
  } else {
    console.log(`⚠️  无变化: ${file}`);
  }
});

console.log('\n✅ 批量替换完成！');
