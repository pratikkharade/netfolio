import { useEffect, useState } from 'react'
import Home from './comp/Home/Home.jsx'
import Login from './comp/Login/Login.jsx'

const THEME_KEY = "netfolio-theme"
const THEME_COLORS = {
  dark: "#0b1120",
  light: "#f4f7fb",
}

function getInitialTheme() {
  return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark"
}

const initialTheme = getInitialTheme()
document.documentElement.dataset.theme = initialTheme

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("auth") === "true"
  );
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme])
  }, [theme])

  if (!isAuthenticated) {
    return <Login setIsAuthenticated={setIsAuthenticated} />
  }

  return <Home setIsAuthenticated={setIsAuthenticated} theme={theme} onThemeChange={setTheme} />
}
