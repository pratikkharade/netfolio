import { useState } from 'react'
import Home from './comp/Home/Home.jsx'
import Login from './comp/Login/Login.jsx'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("auth") === "true"
  );

  if (!isAuthenticated) {
    return <Login setIsAuthenticated={setIsAuthenticated} />
  }

  return <Home setIsAuthenticated={setIsAuthenticated} />
}
