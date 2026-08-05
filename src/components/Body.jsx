import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'

// Route-level code splitting — each page ships as its own chunk instead of
// one ~1.3MB bundle, so a visit to e.g. /login doesn't also download
// Discover's filter logic or the Detail page's cast carousel.
const Home = lazy(() => import('./home/Home'))
const Login = lazy(() => import('./auth/Login'))
const AiSearchHome = lazy(() => import('./browse/AiSearchHome'))
const Movies = lazy(() => import('./movies/Movies'))
const Shows = lazy(() => import('./shows/Shows'))
const DetailPage = lazy(() => import('./detail/DetailPage'))
const Discover = lazy(() => import('./discover/Discover'))
const Anime = lazy(() => import('./anime/Anime'))
const Watchlist = lazy(() => import('./watchlist/Watchlist'))
const Profile = lazy(() => import('./profile/Profile'))

const RouteFallback = () => (
  <div className="min-h-screen bg-ink flex items-center justify-center">
    <Skeleton className="h-8 w-8 rounded-full" />
  </div>
)

const withSuspense = (element) => <Suspense fallback={<RouteFallback />}>{element}</Suspense>

const Body = () => {
  const appRouter = createBrowserRouter([
    {
      path: '/',
      element: withSuspense(<Home />),
    },
    {
      path: '/login',
      element: withSuspense(<Login />),
    },
    {
      path: '/home',
      element: withSuspense(<AiSearchHome />),
    },
    {
      path: '/movies',
      element: withSuspense(<Movies />),
    },
    {
      path: '/shows',
      element: withSuspense(<Shows />),
    },
    {
      path: '/title/:mediaType/:id',
      element: withSuspense(<DetailPage />),
    },
    {
      path: '/discover',
      element: withSuspense(<Discover />),
    },
    {
      path: '/anime',
      element: withSuspense(<Anime />),
    },
    {
      path: '/watchlist',
      element: withSuspense(<Watchlist />),
    },
    {
      path: '/profile',
      element: withSuspense(<Profile />),
    },
  ])

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default Body
