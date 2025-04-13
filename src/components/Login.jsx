import React from 'react'
import Header from './Header'

const Login = () => {
  return (
    <div>
      <Header />
      <div>
        <img
          src="https://assets.nflxext.com/ffe/siteui/vlv3/fc164b4b-f085-44ee-bb7f-ec7df8539eff/d23a1608-7d90-4da1-93d6-bae2fe60a69b/IN-en-20230814-popsignuptwoweeks-perspective_alpha_website_large.jpg"
          alt="Background Image"
        />
      </div>
      <form action="">
        <input type="text" placeholder='Email or Phone number' className='p-2 m-2'/>
        <input type="password" placeholder='Password' className='p-2 m-2' />
        <button className='p-4 m-4'>Sign In</button>
      </form>
    </div>
  )

  // return (
  //   <div className="flex flex-col min-h-screen">
  //     {/* Header */}
  //     <header className="bg-black text-white p-4">
  //       <div className="flex justify-between items-center">
  //         <div className="text-xl font-bold">Netflix</div>
  //         <button className="text-white border-2 border-white py-1 px-4 rounded">Sign In</button>
  //       </div>
  //     </header>

  //     {/* Main Content (Login Form) */}
  //     <main className="flex-grow flex items-center justify-center bg-black bg-opacity-70">
  //       <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
  //         <h2 className="text-3xl font-semibold mb-6 text-center">Sign In</h2>
  //         <form className="space-y-4">
  //           <div>
  //             <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
  //             <input
  //               id="email"
  //               type="email"
  //               className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  //               placeholder="Enter your email"
  //               required
  //             />
  //           </div>
  //           <div>
  //             <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
  //             <input
  //               id="password"
  //               type="password"
  //               className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  //               placeholder="Enter your password"
  //               required
  //             />
  //           </div>
  //           <button
  //             type="submit"
  //             className="w-full bg-red-600 py-3 rounded-lg text-white font-bold mt-4 hover:bg-red-700"
  //           >
  //             Sign In
  //           </button>
  //         </form>
  //       </div>
  //     </main>

  //     {/* Footer */}
  //     <footer className="bg-black text-white text-center p-4">
  //       <p>&copy; 2025 Netflix Clone. All rights reserved.</p>
  //     </footer>
  //   </div>
  // );
}

export default Login
