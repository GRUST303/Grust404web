# Grust404web

森系原木 · 日系 · 爵士 lofi 雨夜风格的个人主页。纯静态（HTML/CSS/JS），可直接托管到 GitHub Pages。

## 特点
- 暖木色雨夜配色，暖灯光晕与颗粒/暗角氛围层
- Canvas 雨滴动画
- 一键“雨声 lofi”环境音（WebAudio 实时合成，无版权素材）
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
