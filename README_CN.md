# Share Create 平台

## 项目愿景

Share Create 是一个创新的 Web3 社交分享平台，致力于打造一个开放、永久的创意分享生态系统。在这个平台上，用户可以：

- 分享独特的创意想法和项目构思
- 寻找志同道合的合作伙伴
- 参与感兴趣的项目开发
- 通过区块链技术确保创意永存

我们的核心理念是：**让创意永存，让合作无界**。通过将创意内容存储在 SUI 区块链上，我们确保：

1. **创意永存**：即使某个社区或平台关闭，有价值的创意想法也不会丢失
2. **跨社区协作**：不同社区的用户可以无缝参与和贡献
3. **透明可信**：区块链技术确保创意归属和贡献记录的可追溯性
4. **开放生态**：任何人都可以基于这些创意进行二次开发或创新

## 项目结构

项目采用前后端分离架构，分为四个主要部分：

```
share-create/
├── client/          # 前端应用 (Next.js)
├── server/          # 后端服务 (NestJS)
├── database/        # 数据库脚本
└── share_contract/  # SUI 智能合约
```

## 功能特性

### 用户系统
- 用户注册和登录
- 个人资料管理（头像、简介）
- SUI 钱包地址绑定

### 内容管理
- 创建和发布分享内容
- 支持文字和图片内容
- 内容上链存储

### 社交互动
- 点赞功能
- 评论系统
- 通知系统

## 技术栈

### 前端 (client)
- Next.js
- React
- TypeScript
- Tailwind CSS
- Ant Design
- @mysten/sui.js
- @mysten/wallet-kit

### 后端 (server)
- NestJS
- TypeScript
- TypeORM
- MySQL
- JWT 认证
- Passport.js

### 数据库 (database)
- MySQL
- 主要表结构：
  - users（用户表）
  - shares（分享表）
  - comments（评论表）
  - likes（点赞表）
  - notifications（通知表）

### 智能合约 (share_contract)
- Move 语言
- SUI 区块链

## 运行说明

### 环境要求
- Node.js >= 16
- MySQL >= 8.0
- SUI CLI

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd share-create
```

2. 安装依赖
```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

3. 配置数据库
```bash
# 创建数据库
mysql -u root -p < database/share.sql
```

4. 配置环境变量
```bash
# 在 server 目录下创建 .env 文件
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

5. 启动服务
```bash
# 启动后端服务
cd server
npm run start:dev

# 启动前端服务
cd client
npm run dev
```

## 开发指南

### 前端开发
- 使用 `npm run dev` 启动开发服务器
- 使用 `npm run build` 构建生产版本
- 使用 `npm run lint` 运行代码检查

### 后端开发
- 使用 `npm run start:dev` 启动开发服务器
- 使用 `npm run test` 运行测试
- 使用 `npm run build` 构建生产版本

### 智能合约开发
- 使用 SUI CLI 进行合约开发和测试
- 合约位于 `share_contract/sources` 目录

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证
MIT