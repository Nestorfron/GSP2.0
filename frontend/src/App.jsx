import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import AdminPanel from "./pages/AdminPanel";
import Zona from "./pages/Zona";
import Dependencia from "./pages/Dependencia";
import DetalleDependencia from "./pages/DetalleDependencia";
import Funcionario from "./pages/Funcionario";
import Notificaciones from "./pages/Notificaciones";
import EscalafonServicio from "./pages/EscalafonServicio";
import Licencias from "./pages/Licencias";
import LicenciasSolicitadas from "./pages/LicenciasSolicitadas";
import AgregarUsuarios from "./pages/AgregarUsuarios";
import CrearUsuario from "./pages/CrearUsuario";
import EditarUsuario from "./pages/EditarUsuario";
import CrearJefatura from "./pages/CrearJefatura";
import CrearZona from "./pages/CrearZona";
import CrearDependencia from "./pages/CrearDependencia";
import CrearTurno from "./pages/CrearTurno";
import CrearExtraordinaria from "./pages/CrearExtraordinaria";
import CrearLicencia from "./pages/CrearLicencia";

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateSW, setUpdateSW] = useState(() => () => {});
  const [toasts, setToasts] = useState([]);

  // Registrar Service Worker PWA
  useEffect(() => {
    const updateServiceWorker = registerSW({
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
      onOfflineReady() {
        console.log("App lista para funcionar offline 🚀");
      },
    });
    setUpdateSW(() => updateServiceWorker);
  }, []);

  // Escuchar mensajes push del Service Worker
  useEffect(() => {
    const handlePushMessage = (event) => {
      if (event.data?.type === "PUSH_RECEIVED") {
        console.log("Notificación push recibida en página:", event.data.payload);
        addToast(`${event.data.payload.title}: ${event.data.payload.body}`);
      }
    };
  
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handlePushMessage);
    }
  
    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handlePushMessage);
      }
    };
  }, []);
  

  // Función para agregar un toast
  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000); // desaparece después de 5s
  };

  // Actualizar la PWA
  const handleUpdate = () => {
    updateSW();
    setUpdateAvailable(false);
    window.location.reload();
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/zona" element={<Zona />} />
          <Route path="/dependencia" element={<Dependencia />} />
          <Route path="/detalle-dependencia" element={<DetalleDependencia />} />
          <Route path="/funcionario" element={<Funcionario />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/escalafon-servicio" element={<EscalafonServicio />} />
          <Route path="/licencias" element={<Licencias />} />
          <Route path="/solicitudes-licencia" element={<LicenciasSolicitadas />} />
          <Route path="/agregar-usuarios" element={<AgregarUsuarios />} />
          <Route path="/crear-usuario/:dependenciaId" element={<CrearUsuario />} />
          <Route path="/editar-usuario" element={<EditarUsuario />} />
          <Route path="/crear-jefatura" element={<CrearJefatura />} />
          <Route path="/crear-zona/:jefaturaId" element={<CrearZona />} />
          <Route path="/crear-dependencia/:zonaId" element={<CrearDependencia />} />
          <Route path="/crear-turno" element={<CrearTurno />} />
          <Route path="/crear-extraordinaria" element={<CrearExtraordinaria />} />
          <Route path="/crear-licencia/:year" element={<CrearLicencia />} />
        </Routes>
      </BrowserRouter>

      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          display: "flex",
          flexDirection: "column-reverse",
          gap: "0.5rem",
          zIndex: 9999,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#333",
              color: "#fff",
              padding: "1rem 1.5rem",
              borderRadius: "5px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              animation: "fadein 0.3s, fadeout 0.5s 4.5s",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Actualización de PWA */}
      {updateAvailable && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#333",
            color: "#fff",
            padding: "1rem",
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          🔄 Nueva versión disponible.&nbsp;
          <button
            onClick={handleUpdate}
            style={{
              cursor: "pointer",
              background: "#fff",
              color: "#333",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
            }}
          >
            Actualizar
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadein { from {opacity:0} to {opacity:1} }
        @keyframes fadeout { from {opacity:1} to {opacity:0} }
      `}</style>
    </>
  );
}

export default App;
