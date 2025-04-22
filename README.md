

# 🎬 Netflix GPT
`A Vite + React project`

A full-stack, Netflix-inspired movie streaming UI built with modern web technologies. Features include Firebase authentication, auto-playing movie trailers, categorized movie carousels, and an intelligent movie search experience powered by GPT. Designed with responsiveness, performance, and clean UI in mind.
## [DEMO](https://netflixgpt-e671d.web.app/)

---

## 🧰 Technologies Used

- ⚛️ **React** – Front-end library for building UI
- ⚡ **Vite** – Fast build tool and dev server
- 🎨 **Tailwind CSS v4** – Utility-first CSS framework
- 🔥 **Firebase** – Backend as a service (authentication & hosting)
- 📦 **Redux Toolkit** – State management
- 🧠 **Custom Hooks** – For fetching categorized movie lists
- 🧪 **React Testing Library** – For future testing support
- 🎬 **TMDB API** – Source for movie metadata & trailers
- 🔐 **Google Auth** – For secure sign-up/sign-in integrated with firebase, i've implemented email auth so far
- 🌐 **YouTube iFrame API** – Embedded trailer playback
- 📁 **Modular Folder Structure** – Organized and scalable project layout
- 🚀 **Deployment via Firebase Hosting**

---



## 🚀 Project Setup

### ⚙️ Create a New Vite + React App
```bash
npm create vite@latest netflix-gpt -- --template react
cd netflix-gpt
npm install
npm run dev
```
Vite plugin used:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### 🎨 Install Tailwind CSS v4 (Latest)
```bash
npm install -D tailwindcss@latest postcss autoprefixer
npx tailwindcss init -p
```

### 🧩 Tailwind Configuration

**tailwind.config.js**  
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
- btw, we don't need this in the newer version of tailwind css

#### just add this in your **src/index.css**
```css
@import "tailwindcss";
```

---

## 🔐 Firebase Setup (Authentication & Hosting)

### 1. Install Firebase Tools (CLI)
```bash
npm install -g firebase-tools
```

### 2. Initialize Firebase in Your Project
```bash
firebase login
firebase init
```

- Choose **Authentication** and **Hosting**
- Select an existing Firebase project or create one
- Set your public directory as `dist` if using Vite
- Set up single-page app: `Yes`
- Skip rewriting files for now

### 3. Firebase Web SDK Setup
```bash
npm install firebase
```

**src/utils/firebase.jsx**
```js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOwHd6e-eKAS9fGoxvkowDOJonsBfVS50",
  authDomain: "netflixgpt-e671d.firebaseapp.com",
  projectId: "netflixgpt-e671d",
  storageBucket: "netflixgpt-e671d.firebasestorage.app",
  messagingSenderId: "350530668256",
  appId: "1:350530668256:web:2ddd5207f7a965f608b285",
  measurementId: "G-LGHHZCM7C3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth()
};

const app = initializeApp(firebaseConfig);

export default app;
```

### 4. Deploy
```bash
npm run dist
firebase deploy
```

---

## ✨ Key Features

### 🔐 Login / Sign-Up Page
- Built with **native React forms**
- Validations using `useRef`, conditional rendering
- **Firebase Authentication** for:
  - Email & Password login/signup
- **Redux Store** to manage user data
- Auto redirect based on auth state
  - `onAuthStateChanged` listener

---

### 📽️ Browse Page (Post-Login Experience)

#### 🧭 Header
- Netflix-like navigation
- Profile picture, sign out button

#### 🎞️ Hero Section
- Background trailer (YouTube embed, auto-play + mute)
- Title and description
- Gradient overlay with visibility control

#### 🍿 Movie Sections
- Integrated with **TMDB API**
- Categories:
  - Now Playing
  - Popular
  - Top Rated
  - Upcoming
- Scrollable horizontal movie lists
- Components:
  - `MovieCard`: Poster view
  - `MovieList`: Row with title and cards
- Data managed with **Redux Toolkit + custom hooks**

---

### 🤖 GPT-powered Movie Suggestion
- Search bar with custom query input
- Smart movie suggestions (powered by OpenAI or custom logic)
- Dynamically displays recommended movies in a Netflix layout

---

### 📁 Project Directory Structure

```
netflixgpt/
│
├── .firebase/                  # Firebase config & deployment setup
├── dist/                       # Build output (auto-generated)
├── node_modules/              # Dependencies (auto-generated)
├── public/                    # Static assets (e.g., favicon, logo, etc.)
│
├── src/                        # Main application source code
│   ├── assets/                 # Fonts, icons, global images
│   ├── components/             # All reusable React components
│   │   ├── Body.jsx
│   │   ├── Browse.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Login.jsx
│   │   ├── MainContainer.jsx
│   │   ├── MovieList.jsx
│   │   ├── SecondaryContainer.jsx
│   │   ├── VideoBackground.jsx
│   │   └── VideoTitle.jsx
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useMovieTrailer.js
│   │   ├── useNowPlayingMovies.js
│   │   ├── usePopularMovies.js
│   │   ├── useTopRatedMovies.js
│   │   ├── useUpcomingMovies.js
│   │   └── useAuthStatus.js
│   │
│   ├── images/                 # Local images
│   │   └── logo.png
│   │
│   ├── utils/                  # Utility functions & API configs
│   │   ├── firebase.js         # Firebase initialization
│   │   └── constants.js        # API URLs, keys, default settings
│   │   └── appStore.js         # Redux store
│   │   └── MovieSlice.js       # Redux slice
│   │   └── UserSlice.js        #
│   │   └── validate.js         # Form validation RegEx
│   │
│   ├── App.css                 # App-level styling
│   ├── App.jsx                 # Root React component
│   ├── index.css               # Tailwind and global styles
│   ├── index.js                # Entry point
│   └── main.jsx                # ReactDOM render
│
├── roadmap.md                  # Development timeline/log (your custom doc)
├── README.md                   # Project overview, setup, features
│
├── .gitignore                  # Files/folders to be ignored by git
├── .firebaserc                 # Firebase project settings
├── firebase.json               # Firebase hosting config
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint setup
├── package.json                # Project metadata & scripts
├── package-lock.json           # Dependency tree
└── index.html                  # HTML template for Vite
```

---

### ✅ Tips for Further Structure

- Add a `pages/` folder if you plan to have distinct views like `Browse.jsx`, `Login.jsx`, `Profile.jsx`.
- You could also add a `store/` folder to manage all Redux slices, actions, and reducers if your state grows.
- If you integrate GPT later, add a `services/` folder to handle API logic for OpenAI or TMDB.
- Consider splitting `components/` into `common/` (shared UI parts) and `features/` (feature-specific components) as the app grows.

---

## 🧱 Optional Add-ons (Planned)
- Volume toggle for video trailers
- Responsive layout (mobile/tablet ready)
- Watchlist / Favorites using Redux or Firebase
- Footer with links, language selector, and social icons
- Smooth animations with `Framer Motion`
