# 毛绒玩具 B2B 产品展示独立站

基于 FastAPI + React + PostgreSQL 的毛绒玩具 B2B 产品展示网站，参考 therapyshoppe.com 设计风格。

## 技术栈

- **后端**: Python, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL, JWT 认证
- **前端**: React 19, TypeScript, Vite, Tailwind CSS 4, Zustand, Swiper
- **部署**: Docker Compose (PostgreSQL + Backend + Frontend/Nginx)

## 功能

- 产品线和产品展示 (分类浏览、搜索、分页、排序)
- B2B 客户账号系统 (登录后可查看价格)
- 在线询盘 (游客和登录用户均可提交)
- 管理后台 (产品线/产品 CRUD, 询盘管理, 客户管理)
- 响应式设计，适配移动端

## 快速启动 (Docker)

```bash
# 启动所有服务
docker compose up --build -d

# 访问:
# 前台: http://localhost:4001
# 后端API: http://localhost:9001/docs
# 管理后台: http://localhost:4001/admin
```

## 默认账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@plushtoy.com | admin123 |
| B2B客户 | demo@client.com | demo123 |

## 本地开发

### 后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 确保 PostgreSQL 运行中，创建数据库 plush_toy_db
# 初始化数据
python seed.py

# 启动开发服务器
uvicorn app.main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

## 项目结构

```
web_plush_toy/
├── docker-compose.yml       # Docker 编排
├── backend/
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py          # FastAPI 入口
│   │   ├── config.py        # 配置
│   │   ├── database.py      # 数据库连接
│   │   ├── models/          # SQLAlchemy 模型
│   │   ├── schemas/         # Pydantic 模型
│   │   ├── routers/         # API 路由
│   │   └── utils/           # JWT/密码工具
│   └── seed.py              # 种子数据
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf           # Nginx 反向代理
│   └── src/
│       ├── api/             # API 客户端
│       ├── components/      # 通用组件
│       ├── pages/           # 页面组件
│       ├── store/           # Zustand 状态
│       └── types/           # TS 类型定义
└── README.md
```
