# NetflixGPT: Detailed Project Structure

This document provides a comprehensive map of the `netflixgpt` project, outlining the purpose of each directory and key file.

## 📂 Directory Tree

```text
netflixgpt/
├── public/                 # Static assets (favicons, manifest, etc.)
│   └── vite.svg
├── src/                    # Main source code
│   ├── assets/             # Global assets (styles, fonts, etc.)
│   │   └── react.svg
│   ├── components/         # React components (Atomic design)
│   │   ├── Body.jsx        # Root component handling layout & routing
│   │   ├── Browse.jsx      # Main browsing page (Main + Secondary containers)
│   │   ├── Footer.jsx      # Application footer
│   │   ├── GptSearch.jsx   # GPT search feature wrapper
│   │   ├── GptSearchBar.jsx # Input & logic for GPT queries
│   │   ├── Header.jsx      # Navigation, Logo, & Auth management
│   │   ├── Login.jsx       # Auth forms (Sign In / Sign Up)
│   │   ├── MovieCard.jsx   # Individual movie poster thumbnail
│   │   ├── MovieList.jsx   # Horizontal scrolling list of MovieCards
│   │   ├── VideoBackground.jsx # Hero section background video
│   │   └── VideoTitle.jsx  # Hero section title & action buttons
│   ├── hooks/              # Custom React hooks (Data fetching)
│   │   ├── useMovieTrailer.jsx     # Fetches trailer key for background
│   │   ├── useNowPlayingMovies.jsx # Fetches current releases
│   │   ├── usePopularMovies.jsx    # Fetches trending titles
│   │   ├── useTopRatedMovies.jsx   # Fetches high-rated movies
│   │   └── useUpcomingMovies.jsx   # Fetches future releases
│   ├── images/             # UI images & developer documentation screenshots
│   │   ├── firebaseimg/    # Reference images for Firebase logic
│   │   ├── multilingual/   # Reference images for i18n logic
│   │   └── bg.jpg          # Main background image
│   ├── store/              # Redux Toolkit state management
│   │   ├── appStore.jsx    # Global store configuration
│   │   ├── configSlice.jsx # App settings (e.g., language)
│   │   ├── gptSlice.jsx    # GPT search & recommendation state
│   │   ├── moviesSlice.jsx # Cached movie data from TMDB
│   │   └── userSlice.jsx   # Current authenticated user state
│   ├── utils/              # Helper functions & configurations
│   │   ├── constant.jsx    # API keys, URLs, & static data
│   │   ├── firebaseConfig.jsx # Firebase initialization
│   │   ├── openaiConfig.jsx   # OpenAI/OpenRouter initialization
│   │   └── validateConfig.jsx # Form validation logic
│   ├── App.jsx             # Top-level component (Redux Provider)
│   ├── main.jsx            # Entry point (DOM rendering)
│   └── index.css           # Global Tailwind CSS imports
├── .env                    # Environment variables (TMDB_KEY, etc.)
├── firebase.json           # Firebase hosting/deployment config
├── package.json            # Project dependencies & scripts
├── vite.config.js          # Vite build & plugin configuration
└── README.md               # Project documentation
```

## 🗝️ Key Component Breakdown

### 1. `src/components/Browse.jsx`
The primary post-auth landing page. It splits the view into:
- **`MainContainer`**: Featuring a hero movie with a video background and title.
- **`SecondaryContainer`**: Housing multiple `MovieList` categories (Popular, Trending, etc.).

### 2. `src/components/Header.jsx`
Responsible for:
- Monitoring auth state via `onAuthStateChanged`.
- Redirecting users based on login status.
- Toggling the GPT Search view.
- Handling logout.

### 3. `src/store/` (Redux)
- **`userSlice`**: Stores the user profile (UID, email, name, photo).
- **`moviesSlice`**: Acts as a cache for TMDB data to prevent redundant API calls.
- **`gptSlice`**: Manages the results from GPT queries and UI visibility.

### 4. `src/hooks/`
These hooks encapsulate the `fetch` logic and `useEffect` triggers, making the components cleaner and more focused on UI rendering.

---
> [!TIP]
> When modifying features, check the corresponding `Slice` in `src/store/` first to see how state is currently handled.
