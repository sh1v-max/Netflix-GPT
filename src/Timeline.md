## 🗓️ Timeline: Netflix GPT Project

### 🔧 Project Setup
- Initialized Vite app  
- Installed Tailwind CSS  
- Setup React Router  

### 🔐 Authentication
- Created login page  
  - Header & Footer  
  - Sign In / Sign Up forms using **Formik**
  - Used `useRef()` for form handling  
- 🔍 Form Validation + Firebase Auth  
  - Setup Firebase project  
  - Deployed with:
    ```bash
    npm install -g firebase-tools
    firebase login
    firebase init
    firebase deploy
    ```
  - Implemented user sign-up/in with Firebase  
  - Saved user to Redux (`userSlice`)  
  - Redirected using `onAuthStateChanged`  
  - ✅ Bugfixes:
    - displayName/profile picture issue  
    - redirect loop on auth state change  

### 🎬 Browse Page (Post-Login)
- Header UI  
- Main container with video trailer & title  
- API Integration with **TMDB**  
  - `API_OPTIONS` stored in constants  
  - Fetched "Now Playing" movies  
  - Created & wired `moviesSlice` in Redux  
  - Embedded YouTube trailer with auto play  

### 🧩 Movie UI Components
- 🎥 Movie List + Movie Card  
- 🖼️ Movie Poster using TMDB image CDN  
- 🎞️ Video Background with title overlay  
- 🧠 Custom hooks:
  - useNowPlayingMovies  
  - usePopularMovies  
  - useTopRatedMovies  
  - useUpcomingMovies  
- Stored & retrieved all movie data via Redux  
