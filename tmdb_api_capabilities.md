# TMDB API: Capabilities for a Streaming App

To build a "full-fledged" streaming experience like Netflix, you can leverage the following deep data points from the **TMDB API**. This goes far beyond just getting a title and a poster.

## 🎬 Movie Data Endpoints
| Feature | Endpoint | UI Use Case |
| :--- | :--- | :--- |
| **Basic Details** | `/movie/{id}` | Title, Synopsis, Runtime, Genres, Budget, Revenue. |
| **Credits** | `/movie/{id}/credits` | Displaying the Cast (actors) and Crew (Director/Writer). |
| **Videos** | `/movie/{id}/videos` | Finding YouTube trailers/teasers for the "Video Background". |
| **Similar** | `/movie/{id}/similar` | "More Like This" section at the bottom of a movie page. |
| **Recommendations** | `/movie/{id}/recommendations` | Personalized suggestions based on the current movie. |
| **Reviews** | `/movie/{id}/reviews` | User-generated reviews for social proof. |

## 📺 TV Series Data Endpoints (Crucial for a complete app)
| Feature | Endpoint | UI Use Case |
| :--- | :--- | :--- |
| **Series Details** | `/tv/{id}` | Series overview, status (Returning/Ended), total seasons. |
| **Season Details** | `/tv/{id}/season/{num}` | List of episodes for a specific season. |
| **Episode Details** | `/tv/{id}/season/{n}/episode/{e}` | Episode summary, guest stars, and runtime. |
| **Aggregate Credits**| `/tv/{id}/aggregate_credits` | Detailed cast list across all seasons. |
| **Content Ratings** | `/tv/{id}/content_ratings` | Maturity rating (e.g., TV-MA, PG-13). |

## 🔍 Advanced Discovery & Features
### 1. Watch Providers (`/watch/providers`)
- **Use Case**: Show where a movie is currently streaming (e.g., Netflix, Prime, Disney+).
- **Benefit**: Makes the app feel like a real portal for content.

### 2. Discover (`/discover/movie` or `/discover/tv`)
- **Filters**: Sort by popularity, release date, vote average, or filter by specific actors/directors.
- **Use Case**: Creating specialized categories like "90s Thrillers" or "Movies starring Tom Cruise."

### 3. Trending (`/trending/{type}/{time}`)
- **Use Case**: The "Top 10 in your country today" row.

### 4. Images (`/movie/{id}/images`)
- **Use Case**: High-resolution backdrops, logos (for title overlay), and posters.

## 💡 Implementation Strategy for "Streaming Feel"
1. **The "Player" Simulation**: TMDB doesn't provide the actual movie file, but you can use the **Youtube key** from the `/videos` endpoint to embed a player that feels like the real thing.
2. **Infinite Scroll**: Use the `page` parameter in discovery endpoints to keep the user scrolling through "endless" content.
3. **Genre Slices**: Use the `/genre/movie/list` endpoint to build category rows (Action, Comedy, Horror) just like Netflix's home screen.
4. **Unified Search**: Use the `/search/multi` endpoint to allow users to search for Movies, TV Shows, and Actors all in one search bar.

---
> [!IMPORTANT]
> To implement TV Series, we'll need to create a new **`tvSlice`** in Redux and a set of **`useTvSeries`** hooks similar to your current movie hooks.
