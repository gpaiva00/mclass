import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./auth";
import { PrivateRoute } from "./components/PrivateRoute";

import Class from "./pages/Class";
import Home from "./pages/Home";
import Lessons from "./pages/Lessons";
import Login from "./pages/Login";
import NewClass from "./pages/NewClass";
import Students from "./pages/Students";

import DefaultLayout from "./components/DefaultLayout";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
