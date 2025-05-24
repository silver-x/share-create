# Share Create Platform

Share Create is a Web3-based social sharing platform that integrates SUI blockchain functionality, allowing users to create, share content, and interact with others.

## Project Structure

The project adopts a frontend-backend separation architecture, consisting of four main parts:

```
share-create/
├── client/          # Frontend Application (Next.js)
├── server/          # Backend Service (NestJS)
├── database/        # Database Scripts
└── share_contract/  # SUI Smart Contract
```

## Features

### User System
- User registration and login
- Profile management (avatar, bio)
- SUI wallet address binding

### Content Management
- Create and publish shared content
- Support for text and image content
- On-chain content storage

### Social Interaction
- Like functionality
- Comment system
- Notification system

## Tech Stack

### Frontend (client)
- Next.js
- React
- TypeScript
- Tailwind CSS
- Ant Design
- @mysten/sui.js
- @mysten/wallet-kit

### Backend (server)
- NestJS
- TypeScript
- TypeORM
- MySQL
- JWT Authentication
- Passport.js

### Database (database)
- MySQL
- Main table structures:
  - users (User table)
  - shares (Share table)
  - comments (Comment table)
  - likes (Like table)
  - notifications (Notification table)

### Smart Contract (share_contract)
- Move Language
- SUI Blockchain

## Running Instructions

### Requirements
- Node.js >= 16
- MySQL >= 8.0
- SUI CLI

### Installation Steps

1. Clone the project
```bash
git clone [project-url]
cd share-create
```

2. Install dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Configure database
```bash
# Create database
mysql -u root -p < database/share.sql
```

4. Configure environment variables
```bash
# Create .env file in server directory
cp .env.example .env
# Edit .env file to configure database connection and other settings
```

5. Start services
```bash
# Start backend service
cd server
npm run start:dev

# Start frontend service
cd client
npm run dev
```

## Development Guide

### Frontend Development
- Use `npm run dev` to start development server
- Use `npm run build` to build production version
- Use `npm run lint` to run code checks

### Backend Development
- Use `npm run start:dev` to start development server
- Use `npm run test` to run tests
- Use `npm run build` to build production version

### Smart Contract Development
- Use SUI CLI for contract development and testing
- Contracts are located in `share_contract/sources` directory

## Contributing Guide

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT