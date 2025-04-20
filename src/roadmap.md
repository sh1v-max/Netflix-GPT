# Netflix roadmap
- create react app/ create vite app
- installed tailwind

## features
- login/sign up page
  - sign in/ sign up form
  - form validation or authentication
  - redirect to browser page
- browse (after authentication)
  - header
  - main movies section
    - trailer in background
    - title and description
    - movies suggestions
      - movies list
      - movie card
      - movie poster
- netflix GPT
  - search bar
  - movie suggestions


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
  - getting api from TMDB
  - adding the API_OPTIONS in constant file
  - making api call in browse.js file
  - creating moviesSlice
  - adding moviesSlice to redux store
