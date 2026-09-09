# Grust404web

ASCII-Magic · 结晶虚空炫技风个人主页。青/红冷色调 + 满屏跳动 ASCII 字符 + 雨夜动效 + 滚动抽出结晶「王之手」虚空之剑。纯静态（HTML/CSS/JS），可直接托管到 GitHub Pages。

## 特点
- 满屏虚空 ASCII/日文/结晶符号跳动层（Canvas）
- 首屏 ASCII 大标题逐字符解析成型
- 下滑抽出结晶虚空之剑（红色核心 + 结晶化王之手），进度绑定滚动
- Canvas 雨滴动画 + 一键“雨声 lofi”环境音（WebAudio 实时合成，无版权素材）
- CSS 扫描线 / 颗粒 / 暗角 / 辉光，终端等宽字体
- 响应式，含匹配主题的 `404.html`
- 支持 `prefers-reduced-motion`（减少动画偏好）

## 本地预览
```bash
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 部署到 GitHub Pages
1. 仓库 Settings → Pages
2. Source 选 `main` 分支、`/ (root)` 目录，保存
3. 稍等 1–2 分钟，访问 `https://<用户名>.github.io/Grust404web/`

## 自定义
- 文案：编辑 `index.html` 里的标题、简介、作品与社交链接
- 配色：改 `style.css` 顶部 `:root` 里的 CSS 变量
