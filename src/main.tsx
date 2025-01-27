import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import Class from "./pages/Class";
import Home from "./pages/Home";
import Lessons from "./pages/Lessons";
import NewClass from "./pages/NewClass";
import Students from "./pages/Students";

import DefaultLayout from "./components/DefaultLayout";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/plano-aulas" element={<Lessons />} />
          <Route path="/alunos" element={<Students />} />
          <Route path="/nova-aula" element={<NewClass />} />
          <Route path="/aula" element={<Class />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
