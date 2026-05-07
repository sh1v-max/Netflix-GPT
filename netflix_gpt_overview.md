# NetflixGPT: Project Overview

NetflixGPT is a high-performance Netflix clone that integrates **GPT-powered movie recommendations**. It leverages modern web technologies to provide a seamless browsing experience with real-time data from TMDB and intelligent suggestions via OpenRouter/OpenAI.

## 🚀 Core Features

- **User Authentication**: Secure Login/Sign-up flow powered by **Firebase Auth**.
- **Dynamic Browsing**: Real-time movie listings (Now Playing, Popular, Top Rated, Upcoming) fetched from **TMDB API**.
- **GPT-Powered Search**: Intelligent movie recommendation system that suggests films based on natural language queries.
- **Immersive UI**: Cinematic video backgrounds with auto-playing trailers.
- **Multi-language Support**: Dynamic UI translation for English, Hindi, Spanish, French, German, Japanese, and Filipino.
- **Responsive Design**: Fully optimized for various screen sizes using **Tailwind CSS 4**.

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4 |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`) |
| **Routing** | React Router DOM v7 |
| **Authentication** | Firebase Auth |
| **Movie Data** | TMDB API |
| **AI Integration** | OpenRouter (GPT-3.5 Flash) |
| **Icons** | React Icons (Fa, Md) |

## 📂 Project Structure (High Level)

- **`src/components/`**: UI components categorized by feature (Login, Browse, Header, GPT Search, Movie Containers).
- **`src/hooks/`**: Custom React hooks for modular data fetching (e.g., `useNowPlayingMovies`).
- **`src/store/`**: Redux slices for global state management (`user`, `movies`, `gpt`, `config`).
- **`src/utils/`**: Configuration files for Firebase, OpenAI, and application constants.
- **`src/images/`**: Local assets and reference screenshots.

## 🔑 Key Configuration Files

- **`constant.jsx`**: Centralized URLs, API options, and GPT prompt templates.
- **`firebaseConfig.jsx`**: Firebase initialization and service setup.
- **`openaiConfig.jsx`**: Integration with OpenRouter for AI features.
- **`appStore.jsx`**: Main Redux store configuration.

---
> [!NOTE]
> The project is currently configured to use **Vite** for the development server and build process, with **Tailwind CSS 4** for styling.
