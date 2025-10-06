# SlashTalk 💬

A modern, real-time chat application built with React and Node.js featuring both private messaging and advanced group chat capabilities.

![SlashTalk Demo](https://img.shields.io/badge/Status-Live-green)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-orange)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)
![Socket.IO](https://img.shields.io/badge/Real--time-Socket.IO-yellow)

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Registration & Login** with JWT tokens
- **Profile Management** - Update username, email, avatar
- **User Search** - Find and connect with other users
- **Protected Routes** - Secure access to chat features

### 💬 Private Messaging
- **Real-time Chat** - Instant message delivery
- **Message History** - Persistent conversation storage
- **Emoji Support** - Rich message formatting
- **Online Status** - See who's online
- **Auto-scroll** - Messages automatically scroll to bottom

### 👥 Advanced Group Chat
- **Create Groups** - Set up group chats with custom avatars
- **Member Management** - Add/remove members, promote admins
- **Admin Controls** - Full group management capabilities
- **Private Mentions** - Mention specific users with @username
- **Selective Visibility** - Private messages visible only to mentioned users
- **Group Settings** - Update group name, description, avatar

### 🎨 Modern UI/UX
- **Responsive Design** - Works perfectly on mobile and desktop
- **Dark Mode** - Built-in theme toggle
- **Modern Interface** - Clean, intuitive design with TailwindCSS
- **Loading States** - Smooth loading animations and skeletons
- **Real-time Updates** - Live connection status and message delivery

## 🚀 Tech Stack

### Frontend
- **React 19.1.1** - Modern React with latest features
- **Vite** - Lightning-fast build tool
- **TailwindCSS 4.1.13** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web framework
- **MongoDB** - NoSQL database
- **Socket.IO 4.8.1** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Clone the Repository
```bash
git clone https://github.com/yourusername/slashtalk.git
cd slashtalk
```

### Backend Setup
```bash
cd server
npm install

# Create .env file
touch .env
```

Add the following to your `.env` file:
```env
CONNECTION_STRING=mongodb://localhost:27017/slashtalk
JWT_SECRET_KEY=your_super_secret_jwt_key_here
PORT=7771
```

Start the backend server:
```bash
npm start
```

### Frontend Setup
```bash
cd client
npm install

# Update the backend URL in src/utils/constant.js
# Change BACKEND_BASE_URL to your backend URL
```

Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
slashtalk/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── modal/      # Modal components
│   │   │   ├── ChatWindow.jsx
│   │   │   └── GroupChatWindow.jsx
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middlewares/       # Express middlewares
│   ├── utils/             # Utility functions
│   └── app.js             # Main server file
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout

### Users
- `GET /user/me` - Get current user profile
- `PUT /user/me` - Update user profile
- `GET /user/search` - Search users
- `GET /user/:id` - Get user by ID

### Groups
- `POST /groups` - Create group
- `GET /groups/:groupId` - Get group details
- `GET /users/:userId/groups` - Get user's groups
- `POST /groups/:groupId/members` - Add member
- `DELETE /groups/:groupId/members/:userId` - Remove member
- `PUT /groups/:groupId` - Update group
- `POST /groups/:groupId/admins` - Promote to admin

### Messages
- `GET /conversations/:senderId/:receiverId/messages` - Private chat history
- `GET /groups/:groupId/messages` - Group chat history

## 🔌 WebSocket Events

### Client → Server
- `joinChat` - Join private chat room
- `joinGroup` - Join group chat room
- `sendMessage` - Send private message
- `sendGroupMessage` - Send group message
- `getConversation` - Request chat history
- `getGroupConversation` - Request group history

### Server → Client
- `messageReceived` - Private message received
- `groupMessageReceived` - Group message received
- `conversationHistory` - Chat history response
- `groupConversationHistory` - Group history response
- `userJoinedGroup` - User joined group notification

## 🎯 Usage

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Search** for users to start private conversations
3. **Create groups** for team discussions
4. **Manage groups** with admin controls
5. **Mention users** in groups with @username for private messages

### Key Features

#### Private Messaging
- Click on any user to start a private conversation
- Messages are delivered in real-time
- Conversation history is automatically loaded

#### Group Management
- Create groups with custom names and avatars
- Add/remove members (admin only)
- Promote members to admin
- Update group settings

#### Advanced Group Features
- Use @username to mention specific users
- Mentioned users receive private notifications
- Messages with mentions are only visible to mentioned users

## 🔒 Security Features

- **JWT Authentication** with HTTP-only cookies
- **Password Hashing** using bcrypt
- **Input Validation** on both client and server
- **CORS Protection** with configured origins
- **Protected Routes** requiring authentication
- **Role-based Access Control** for group management

## 🚀 Deployment

### Environment Variables
Ensure the following environment variables are set:

```env
CONNECTION_STRING=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
PORT=7771
```

### Production Build
```bash
# Backend
cd server
npm start

# Frontend
cd client
npm run build
npm run preview
```

### Docker Deployment (Optional)
```dockerfile
# Add Dockerfile for containerized deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 7771
CMD ["npm", "start"]
```

## 🛠️ Development

### Available Scripts

#### Backend
```bash
npm start          # Start development server with nodemon
npm test           # Run tests (to be implemented)
```

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Screenshots

### Desktop View
![Desktop Chat Interface](screenshots/desktop-chat.png)

### Mobile View
![Mobile Chat Interface](screenshots/mobile-chat.png)

### Group Management
![Group Management](screenshots/group-management.png)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork and clone the repository
2. Install dependencies for both client and server
3. Set up your MongoDB instance
4. Configure environment variables
5. Start both development servers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Junaid** - Project Lead & Full-Stack Developer

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/slashtalk/issues) page
2. Create a new issue with detailed information
3. Contact us at [your-email@example.com](mailto:your-email@example.com)

## 🔮 Roadmap

### Upcoming Features
- [ ] File sharing and media uploads
- [ ] Message reactions and replies
- [ ] Voice and video calling
- [ ] Push notifications
- [ ] Message search functionality
- [ ] Custom themes and personalization
- [ ] Message encryption
- [ ] Bot integration
- [ ] Message scheduling

### Performance Improvements
- [ ] Message pagination
- [ ] Image optimization
- [ ] Database query optimization
- [ ] Caching implementation

---

## 🙏 Acknowledgments

- **Socket.IO** for real-time communication
- **TailwindCSS** for beautiful styling
- **React Team** for the amazing framework
- **MongoDB** for reliable data storage

---

**Made with ❤️ by the SlashTalk Team**

*Start chatting and connecting with people around the world!*
