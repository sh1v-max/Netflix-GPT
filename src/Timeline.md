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

rough draft

## Timeline
- create vite app
- installed tailwind
- routing
- login page
  - header/footer
  - sign in/ sign up form 
  - form validation or authentication
    - use Formik library for form validation
    - using useRef() hook
    - validation done, now let's start authentication
    - for validation, we will be using google firebase for backend
    - deployed using firebase
      - commands to deploy:
      ``` bash
        1. install firebase CLI- npm install -g firebase-tools
        2. firebase login
        3. initialize firebase project- firebase init
        4. deploy firebase project- firebase deploy
      ```
    - user authentication using firebase
    - refer to firebase documentation for authentication (highly recommended)
    - adding user into firebase
    - implemented sign up/in user API
    - created redux store with userSlice
    - added user into redux store, and then fetched data back from redux store
  - redirect to browser page 
    - BugFix: sign up user displayName and profile picture update
    - BugFix: if the user is not logged in Redirect/browse to login page and vice versa
    - redirected using onAuthStateChanged 
    - unsubscribed to the onAuthStateChanged callback
  - added
   hardcoded values to the constant files
- browse (after authentication)
  - header
  - main container
    - getting api from TMDB
    - adding the API_OPTIONS in constant file
    - making api call in browse.js file
    - creating moviesSlice
    - adding moviesSlice to redux store
    - we created a custom store
    - updated and fetched the movieSlice with trailer video
    - fetched data from store
    - embedded the YouTube video and mad e it auto play
    - styling video title and video trailer
  - Build the second container
    - build movies list
    - build movie card
    - build movie poster (TMDB image CDN)
    - build movie trailer background
    - and movie title and description
    - Custom hooks for now playing, popular, top rated, and upcoming movies
    - fetched all these api for respective hooks and added them to redux store
    - fetched data back from redux store
- GPT search page
  - build a great gpt search page
  - added gpt search bar
  - Multi-language feature (a huge feature update)
  - integrate GPT apis (get open ai key)