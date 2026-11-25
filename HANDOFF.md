# 林林 & 倍倍纪念站 · 交接说明

给下一个对话 / 协作者用：如何拉取代码，以及如何根据 `历程.md` 同步更新网站并发布。

---

## 1. 仓库与线上地址

| 用途 | 地址 |
|------|------|
| GitHub 仓库 | https://github.com/wlislwl/linlin-beibei |
| 公网网站（GitHub Pages） | https://wlislwl.github.io/linlin-beibei/ |
| 本地项目目录（本机） | `D:\workparse\AiSoftware\komo520` |
| 历程源文档（本机） | `C:\Users\20230717602\Desktop\历程.md` |
| 历程照片（本机） | `C:\Users\20230717602\Desktop\assets\` |
| 可可照片（本机） | `C:\Users\20230717602\Desktop\可可照片\` |

人物约定：**林林** = 作者本人，**倍倍** = 女朋友；在一起日 **2025-01-01**。

---

## 2. 到其他电脑拉取代码

```bash
git clone https://github.com/wlislwl/linlin-beibei.git
cd linlin-beibei
```

已有目录则更新：

```bash
git pull origin main
```

本地预览（在项目根目录）：

```bash
python -m http.server 8767
```

浏览器打开：http://127.0.0.1:8767/

---

## 3. 网站结构（改哪里）

| 文件/目录 | 作用 |
|-----------|------|
| `index.html` | 开场页（点按钮进主页） |
| `home.html` | 主页：天数、倒计时、入口；两侧彩蛋 🎈/🎆 |
| `journey.html` | 时光轴 |
| `gallery.html` | 沉浸相册 |
| `map.html` | 地点旅程 |
| `keke.html` | 可可猫猫馆 |
| `js/journey-data.js` | **历程统一数据**（日期/标题/文案/照片/地点） |
| `js/keke-data.js` | 可可馆媒体列表 |
| `js/effects.js` / `js/fx-engine.js` | 特效与彩蛋 |
| `css/site.css` | 样式（图片用 `object-fit: contain` 等比例完整显示） |
| `assets/journey/` | 历程照片（需已做 EXIF 方向矫正再压缩） |
| `assets/keke/` | 可可照片 |
| `assets/music/bgm.mp3` | 背景音乐 |

> 不要再依赖原仓库里气球/戳猫/flower-generator 等空模块。

---

## 4. 根据 `历程.md` 更新网站（标准流程）

文档格式固定为：

```markdown
YYYY.M.D

事件标题

可选补充说明

![说明](图片路径)
```

图片路径可以是：

- `./assets/xxx.jpg`（相对桌面 `历程.md`，实际在 `Desktop\assets\`）
- 或本机绝对路径（如 `C:\Users\...\Downloads\xxx.jpg`）

### 更新步骤

1. **读最新** `C:\Users\20230717602\Desktop\历程.md`，对照现有 `js/journey-data.js`，找出新增/修改的事件。
2. **复制照片**到 `assets/journey/`（文件名与文档一致）。
3. **按 EXIF 矫正方向并压缩**（避免竖图横放）。示例：

```python
from pathlib import Path
from PIL import Image, ImageOps

src = Path(r"原图路径.jpg")
dest = Path(r"D:\workparse\AiSoftware\komo520\assets\journey") / src.name
im = ImageOps.exif_transpose(Image.open(src))
if im.mode != "RGB":
    im = im.convert("RGB")
w, h = im.size
m = 1600 / max(w, h)
if m < 1:
    im = im.resize((int(w*m), int(h*m)), Image.Resampling.LANCZOS)
im.save(dest, "JPEG", quality=82, optimize=True, exif=b"")
```

4. **改 `js/journey-data.js`**：为每条事件补充  
   `date` / `title` / `note` / `place` / `photos`（路径形如 `assets/journey/文件名.jpg`）。  
   `JOURNEY_PLACES` 会按 `place` 自动聚合；新地点可加到排序列表。
5. **可可相关**：照片放 `assets/keke/`，并在 `js/keke-data.js` 登记。
6. **展示规则**：时间轴/相册/可可/地点缩略图保持 `object-fit: contain`，不要改回 `cover` 乱裁切；不要无 EXIF 处理就重压图片。
7. 本地打开预览确认后，提交并推送：

```bash
git add -A
git commit -m "同步历程：补充某某事件"
git push origin main
```

8. 等 GitHub Pages 一两分钟，访问  
   https://wlislwl.github.io/linlin-beibei/  
   （必要时 Ctrl+F5 强刷）。

---

## 5. 给下一个 AI 对话的提示词（可直接复制）

```
请继续维护「林林 & 倍倍」纪念站。

仓库：https://github.com/wlislwl/linlin-beibei
本地目录：D:\workparse\AiSoftware\komo520
公网：https://wlislwl.github.io/linlin-beibei/
历程文档：C:\Users\20230717602\Desktop\历程.md
历程照片：C:\Users\20230717602\Desktop\assets\
可可照片：C:\Users\20230717602\Desktop\可可照片\

规则：
1. 先 git pull，再读 HANDOFF.md 与最新 历程.md。
2. 以 历程.md 为准同步 js/journey-data.js，并把新照片复制到 assets/journey/。
3. 压缩照片前必须 ImageOps.exif_transpose，避免竖图横放；展示用 object-fit:contain。
4. 可可照片同步到 assets/keke/ + js/keke-data.js。
5. 改完本地预览，再 commit / push 到 main，GitHub Pages 会自动更新。
6. 不要恢复原仓库无用的气球/戳猫/React 生花模块；不要改开场为密码解锁。
7. 回复用简体中文。

本次任务：【在这里写：例如「我又在历程.md 加了几条，请同步网站并推送」】
```

---

## 6. 注意

- 大图务必压缩后再推 GitHub（单文件勿超 100MB）。
- `历程.md` 本身默认不在仓库里（在桌面）；网站数据源是 `js/journey-data.js`。
- 背景音乐：`assets/music/bgm.mp3`（Kevin MacLeod / Heartwarming，CC BY）。
- Word 导出是桌面「林林与倍倍历程.docx」，与网站更新无关；要再导 Word 可另说。
