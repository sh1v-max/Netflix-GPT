import React from 'react'
import Home from './home/Home'
import Login from './auth/Login'
import Browse from './browse/Browse'
import Shows from './shows/Shows'
import DetailPage from './detail/DetailPage'
import Discover from './discover/Discover'
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'

const Body = () => {
  const appRouter = createBrowserRouter([
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/browse',
      element: <Browse />,
    },
    {
      path: '/shows',
      element: <Shows />,
    },
    {
      path: '/title/:mediaType/:id',
      element: <DetailPage />,
    },
    {
      path: '/discover',
      element: <Discover />,
    },
  ])

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default Body
