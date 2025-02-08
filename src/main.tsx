import { useAuth0 } from "@auth0/auth0-react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth";
import DefaultLayout from "./components/DefaultLayout";
import { PrivateRoute } from "./components/PrivateRoute";
import { migrateLocalStorageToCloud } from "./utils";

import Class from "./pages/Class";
import Home from "./pages/Home";
import Lessons from "./pages/Lessons";
import Login from "./pages/Login";
import NewClass from "./pages/NewClass";
import Students from "./pages/Students";

import "./index.css";

function App() {
  const { isAuthenticated, user } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      migrateLocalStorageToCloud(user);
    }
  }, [isAuthenticated, user?.sub]);

  return (
    <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<DefaultLayout />}>
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route
        path="/plano-aulas"
        element={
          <PrivateRoute>
            <Lessons />
          </PrivateRoute>
        }
      />
      <Route
        path="/alunos"
        element={
          <PrivateRoute>
            <Students />
          </PrivateRoute>
        }
      />
      <Route
        path="/nova-aula"
        element={
          <PrivateRoute>
            <NewClass />
          </PrivateRoute>
        }
      />
      <Route
        path="/aula"
        element={
          <PrivateRoute>
            <Class />
          </PrivateRoute>
        }
      />
    </Route>
  </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);