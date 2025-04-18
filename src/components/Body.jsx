import React from 'react'
import Login from './Login'
import Browse from './Browse'
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'

const Body = () => {
  const appRouter = createBrowserRouter([
    {
      path: '/',
      element: <Login />,
    },
    {
      path: '/browse',
      element: <Browse />,
    },
  ])

  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       // User is signed in
  //       // see docs for a list of available properties
  //       // https://firebase.google.com/docs/reference/js/auth.user
  //       // const uid = user.uid;
  //       const { uid, email, displayName, photoURL } = user
  //       dispatch(
  //         addUser({
  //           uid: uid,
  //           email: email,
  //           name: displayName,
  //           photo: photoURL,
  //         })
  //       )
  //       // when user sign in, i'm navigating him to the browse page
  //       navigate('/browse')
  //     } else {
  //       // User is signed out
  //       dispatch(removeUser())
  //       // when user sign out, navigate him to main page
  //       navigate('/')
  //       // this will return an error, why? cause we are using navigate outside the routerProvider
  //     }
  //   })
  // }, [])
  // to resolve this, we need to useEffect in any other component
  // which will always inside my body component, such as header component

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default Body
