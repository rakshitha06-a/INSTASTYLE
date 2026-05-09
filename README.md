# 📸 InstaStyle — Full Stack Social Media Platform

<div align="center">

A modern, feature-rich social media application built with the **MERN Stack** (MongoDB, Express, React, Node.js). InstaStyle delivers a premium Instagram-inspired experience with real-time messaging, interactive notifications, and a beautiful glassmorphism UI.

**[Live Demo](#) · [Report Bug](https://github.com/rakshitha06-a/INSTASTYLE/issues) · [Request Feature](https://github.com/rakshitha06-a/INSTASTYLE/issues)**

</div>

---

## ✨ Features

### 🔐 Authentication
- Secure user registration and login
- JWT-based session management
- Protected routes for authenticated users

### 📝 Posts & Feed
- Create posts with text and image uploads
- Global feed showing all posts
- Skeleton loading animations for a polished UX
- Double-tap to like (Instagram style!)

### ❤️ Interactions
- Like / Unlike posts
- Emoji reactions (❤️ 🔥 😂 😮 😢 👏)
- Comment on posts
- Bookmark / Save posts for later
- Edit and delete your own posts

### 👥 Social Features
- Follow / Unfollow users
- Search users by username
- User profiles with post grid, follower & following counts
- Interactive followers & following lists (click to view)
- "Suggested Users" on your feed
- Profile picture upload

### 💬 Direct Messages
- Real-time chat with any user
- Conversation list with unread badges
- Start new conversations by searching users
- Messages grouped by date (Today, Yesterday, etc.)
- Auto-scrolling and auto-focus chat input

### 🔔 Notifications
- Real-time notification system
- Color-coded by type (likes, comments, follows, messages)
- Clickable — navigate directly to the relevant content
- Unread badge on navbar
- Auto-polling for new notifications

### 🎨 Design & UX
- Dark / Light mode toggle
- Glassmorphism UI with frosted-glass panels
- Animated mesh gradient background
- Scroll-aware navbar (transparent → frosted on scroll)
- Gradient brand text and glow effects
- Smooth Framer Motion page transitions
- Fully responsive design

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router, Axios, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js, Multer (file uploads) |
| **Database** | MongoDB, Mongoose ODM |
| **Auth** | JSON Web Tokens (JWT), bcrypt.js |
| **Styling** | Custom CSS with CSS Variables, Glassmorphism, Dark/Light themes |

---

## 📁 Project Structure

```
INSTASTYLE/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── models/
│   │   ├── User.js                # User schema (followers, following, bookmarks)
│   │   ├── Post.js                # Post schema (likes, reactions, comments)
│   │   ├── Message.js             # DM message schema
│   │   └── Notification.js        # Notification schema
│   ├── routes/
│   │   ├── authRoutes.js          # Register & Login
│   │   ├── postRoutes.js          # CRUD posts, likes, reactions, bookmarks
│   │   ├── userRoutes.js          # Profiles, follow, search, profile pic
│   │   ├── messageRoutes.js       # DM conversations & messages
│   │   └── notificationRoutes.js  # Fetch & mark-read notifications
│   ├── server.js                  # Express app entry point
│   └── .env                       # Environment variables
├── frontend/
│   ├── public/
│   │   └── logo.png               # InstaStyle logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation with scroll effect
│   │   │   ├── PostCard.jsx       # Post with reactions, edit, delete
│   │   │   ├── CreatePostModal.jsx# New post modal
│   │   │   └── SuggestedUsers.jsx # Follow suggestions
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state & theme management
│   │   ├── pages/
│   │   │   ├── Feed.jsx           # Main feed with skeleton loading
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Register page
│   │   │   ├── Profile.jsx        # User profile with grid & modals
│   │   │   ├── Search.jsx         # User search
│   │   │   ├── Messages.jsx       # DM conversations & chat
│   │   │   └── Notifications.jsx  # Notification feed
│   │   ├── index.css              # Design system & global styles
│   │   ├── App.jsx                # Routes & layout
│   │   └── main.jsx               # React entry point
│   └── vite.config.js
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rakshitha06-a/INSTASTYLE.git
   cd INSTASTYLE
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Create a `.env` file** in the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/instastyle
   JWT_SECRET=your_super_secret_key_here
   ```

4. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Create the uploads directory**
   ```bash
   mkdir ../backend/uploads
   ```

### Running the App

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend
cd backend
node server.js

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser and you're live! 🎉

---

## 📸 Screenshots

| Login | Feed | Profile |
|---|---|---|
| Premium glassmorphism login | Posts with reactions & bookmarks | Instagram-style grid layout |

| Messages | Notifications | Dark/Light Mode |
|---|---|---|
| Real-time DM chat | Color-coded notification feed | One-click theme toggle |

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create a post |
| PUT | `/api/posts/:id` | Edit a post |
| DELETE | `/api/posts/:id` | Delete a post |
| PUT | `/api/posts/:id/like` | Like/unlike a post |
| PUT | `/api/posts/:id/react` | Add emoji reaction |
| PUT | `/api/posts/:id/bookmark` | Bookmark a post |
| POST | `/api/posts/:id/comment` | Add a comment |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/:id` | Get user profile + posts |
| GET | `/api/users/search/:query` | Search users |
| GET | `/api/users/suggested/list` | Get suggested users |
| PUT | `/api/users/:id/follow` | Follow/unfollow |
| PUT | `/api/users/profile-pic/upload` | Upload profile picture |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/conversations` | Get all conversations |
| GET | `/api/messages/:userId` | Get chat messages |
| POST | `/api/messages/:userId` | Send a message |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get all notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/read-all` | Mark all as read |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ by [Rakshitha](https://github.com/rakshitha06-a)

⭐ Star this repo if you found it helpful!

</div>
