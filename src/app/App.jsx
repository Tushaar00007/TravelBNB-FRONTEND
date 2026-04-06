import React, { useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cookies from "js-cookie";
import { Toaster } from "react-hot-toast";
import { routes } from "./routes";
import { Loader2 } from "lucide-react";

function App() {
  useEffect(() => {
    // Check for theme cookie on initial load
    const savedTheme = Cookies.get("theme");
    if (savedTheme === "Dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
      }>
        <Routes>
          {routes.map((route, idx) => (
            <Route key={idx} path={route.path} element={route.element}>
              {route.children && route.children.map((child, cIdx) => (
                <Route
                  key={cIdx}
                  index={child.index}
                  path={child.path}
                  element={child.element}
                />
              ))}
            </Route>
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;