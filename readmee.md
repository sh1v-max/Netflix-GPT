<div align="center">

  <!-- It's highly recommended to create a custom logo for your project -->
  <!-- <img src="https://raw.githubusercontent.com/sh1v-max/Netflix-GPT/main/public/logo.png" alt="Netflix GPT Logo" width="200"/> -->

  <h1>Netflix-GPT</h1>
  <p>A Netflix-inspired, full-stack streaming application built with React, Vite, and Redux Toolkit. Features secure Firebase authentication, dynamic movie carousels via the TMDB API, and a foundation for an intelligent, GPT-powered movie search.</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-18.2.0-blue?logo=react" alt="React">
    <img src="https://img.shields.io/badge/Vite-5.0.0-purple?logo=vite" alt="Vite">
    <img src="https://img.shields.io/badge/Redux_Toolkit-2.0.0-764ABC?logo=redux" alt="Redux Toolkit">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?logo=tailwind-css" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Firebase-10.7.0-FFCA28?logo=firebase" alt="Firebase">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  </p>

</div>


> This project is a demonstration of modern frontend architecture, showcasing best practices in state management, component design, and build tooling.

## ✨ Key Features

- **Dynamic & Immersive UI:** A pixel-perfect clone of the Netflix browse page, featuring categorized movie carousels (`Now Playing`, `Popular`, etc.) and a hero section with an auto-playing, muted video background.
- **Secure User Authentication:** Robust sign-up/sign-in flow powered by Firebase Authentication. User session persistence is managed centrally, providing a seamless experience across browser sessions.
- **Centralized State Management:** Utilizes Redux Toolkit for a predictable and scalable state container, managing everything from user authentication status to cached API responses.
- **Optimized Data Fetching:** Employs a custom hook-based strategy to fetch data from The Movie Database (TMDB). API calls are memoized to prevent redundant network requests, ensuring a fast and efficient user experience.
- **Foundation for AI-Powered Search:** The application is architected to support a future GPT-based search feature, allowing users to find movies using natural language queries.
- **Performance-First Development:** Built with Vite for near-instant development server startup and lightning-fast Hot Module Replacement (HMR). Production builds are highly optimized by Rollup.


## 🚀 Live Demo

Experience the application live:

**[https://netflixgpt-e671d.firebaseapp.com/](https://netflixgpt-e671d.firebaseapp.com/)**

<!-- For a recruiter, it's powerful to add a high-quality GIF of the app in action here. -->
<!-- ![Netflix-GPT Demo GIF](link_to_your_demo.gif) -->


## 🛠️ Technology Stack

This project is built with a curated selection of modern, industry-standard technologies to ensure performance, scalability, and an excellent developer experience.

| Category             | Technology                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Frontend Library** | [React](https://reactjs.org/)                                                                                 |
| **Build Tool**       | [Vite](https://vitejs.dev/)                                                                                   |
| **Styling**          | [Tailwind CSS](https://tailwindcss.com/)                                                                      |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/)                                                                |
| **Routing**          | [React Router](https://reactrouter.com/)                                                                      |
| **Backend Services** | [Firebase](https://firebase.google.com/) (Authentication, Hosting)                                            |
| **Data Source**      | [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api)                                 |
| **Deployment**       | [Firebase Hosting](https://firebase.google.com/docs/hosting)                                                  |


## 🏁 Getting Started

To get a local copy up and running, please follow these simple steps.

### Prerequisites

- **Node.js:** v18.0.0 or higher.
- **npm/yarn/pnpm:** A Node.js package manager.
- **Firebase Account:** To set up authentication and hosting.
- **TMDB API Key:** To fetch movie data.

### Installation & Setup

1.  **Clone the repository:**
    ```
    git clone https://github.com/sh1v-max/Netflix-GPT.git
    cd Netflix-GPT
    ```

2.  **Install dependencies:**
    ```
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the project root. Populate it with your Firebase and TMDB API credentials.

    ```
    # Firebase Web App Configuration
    VITE_FIREBASE_API_KEY="YOUR_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
    VITE_FIREBASE_APP_ID="YOUR_APP_ID"

    # TMDB API Read Access Token
    VITE_TMDB_API_KEY="YOUR_TMDB_API_KEY"
    ```
    > **Security Note:** The `VITE_` prefix is required for Vite to expose these variables to the client-side code. Ensure your `.env` file is included in `.gitignore`.

4.  **Run the development server:**
    ```
    npm run dev
    ```
    Your application should now be running on `http://localhost:5173`.


## 🏗️ Architectural Decisions

This project wasn't just built; it was engineered. Here are some of the key architectural choices that were made:

1.  **Component-Driven UI with a Modular Structure:**
    The application follows a strict component-based architecture. UI elements are broken down into logical, reusable components (`Header`, `MovieCard`, etc.), and the file structure separates concerns clearly into `components`, `hooks`, and `utils`. This makes the codebase easy to navigate, maintain, and scale.

2.  **Centralized vs. Local State:**
    - **Redux Toolkit** was chosen for global state management (e.g., user authentication status, cached movie lists). This provides a single source of truth and avoids prop-drilling. Its integration with Redux DevTools is invaluable for debugging complex state interactions.
    - **Local Component State** (`useState`, `useRef`) is used for UI-specific state that doesn't need to be shared globally (e.g., form input values, toggle states), adhering to the principle of keeping state as close as possible to where it's used.

3.  **Abstracting Business Logic with Custom Hooks:**
    All side effects, particularly API calls, are encapsulated within custom React hooks (e.g., `useNowPlayingMovies`). This strategic decision provides several benefits:
    - **Decouples UI from Logic:** Components are only responsible for rendering data, not fetching it.
    - **Reusability:** The same hook can be used in multiple components.
    - **Memoization:** Hooks include logic to check the Redux store before making a network request, effectively caching data and preventing redundant API calls.

4.  **Utility-First Styling with Tailwind CSS:**
    Tailwind CSS was chosen over traditional CSS-in-JS or CSS Modules to enable rapid UI development. By applying utility classes directly in the JSX, we maintain styling consistency, reduce context-switching, and benefit from Tailwind's highly effective purging of unused styles, resulting in a minimal production CSS bundle.


## 🛣️ Future Roadmap

This project serves as a strong foundation for several exciting future enhancements:

-   [ ] **Full GPT Search Integration:** Implement the backend logic (e.g., via a Firebase Cloud Function) to securely call the OpenAI API and translate natural language queries into movie recommendations.
-   [ ] **Personalized User Watchlist:** Develop a "My List" feature, allowing users to add/remove movies. This will be persisted in a **Firestore** database, tied to the user's account.
-   [ ] **Enhanced UI/UX:**
    -   Integrate **Framer Motion** for fluid page transitions and micro-interactions.
    -   Implement **loading skeletons** to improve perceived performance during data fetching.
    -   Refine responsiveness for a flawless experience on all mobile and tablet devices.
-   [ ] **Comprehensive Testing Suite:**
    -   Write unit tests for utility functions and custom hooks using **Jest** and **React Testing Library**.
    -   Develop integration tests for key user flows like authentication and movie browsing.


## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements, please fork the repository and create a pull request, or open an issue with the "enhancement" tag.

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/NewFeature`)
3.  **Commit your Changes** (`git commit -m 'feat: Add some NewFeature'`)
4.  **Push to the Branch** (`git push origin feature/NewFeature`)
5.  **Open a Pull Request**


## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more information.


<div align="center">
  <p>Developed with ❤️ by Shiv Shankar Singh</p>
</div>