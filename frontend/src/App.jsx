import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import BackgroundLogo from "./components/BackgroundLogo";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Perfil from "./pages/Perfil";
import AdminPanel from "./pages/AdminPanel";
import GestionPanel from "./pages/GestionPanel"
import Zona from "./pages/Zona";
import EditarZona from "./pages/EditarZona"
import Dependencia from "./pages/Dependencia";
import DetalleDependencia from "./pages/DetalleDependencia";
import Funcionario from "./pages/Funcionario";
import PrendasFuncionario from "./pages/PrendasFuncionario";
import Notificaciones from "./pages/Notificaciones";
import EscalafonServicio from "./pages/EscalafonServicio";
import Licencias from "./pages/Licencias";
import LicenciasFuncionario from "./pages/LicenciasFuncionario";
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
import PlanillaDiaria from "./pages/PlanillaDiaria";
import CrearVehiculo from "./pages/CrearVehiculo";
import EditarVehiculo from "./pages/EditarVehiculo";
import ServiciosVehiculo from "./pages/ServiciosVehiculo";
import CrearServicio from "./pages/CrearServicio";
import EditarServicio from "./pages/EditarServicio";

/* ======================
   CONTENIDO DE LA APP
====================== */
function AppContent() {
  const location = useLocation();

  const hideLogoRoutes = [
    "/login",
    "/forgot-password",
  ];

  const hideLogo =
    hideLogoRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  return (
    <>
      {!hideLogo && <BackgroundLogo />}

      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/gestion" element={<GestionPanel />} />
        <Route path="/zona" element={<Zona />} />
        <Route path="/editar-zona/:zonaId" element={<EditarZona />} />
        <Route path="/dependencia" element={<Dependencia />} />
        <Route path="/detalle-dependencia" element={<DetalleDependencia />} />
        <Route path="/funcionario" element={<Funcionario />} />
        <Route path="/prendas-funcionario/:id" element={<PrendasFuncionario />} />
        <Route path="/funcionario/:id" element={<LicenciasFuncionario />} />
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
        <Route path="/planilla-diaria" element={<PlanillaDiaria />} />
        <Route path="/crear-vehiculo" element={<CrearVehiculo />} />
        <Route path="/editar-vehiculo" element={<EditarVehiculo />} />
        <Route path="/servicios-vehiculo" element={<ServiciosVehiculo />} />
        <Route path="/crear-servicio" element={<CrearServicio />} />
        <Route path="/editar-servicio" element={<EditarServicio />} />
      </Routes>
    </>
  );
}

/* ======================
   APP ROOT
====================== */
function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateSW, setUpdateSW] = useState(() => () => {});
  const [toasts, setToasts] = useState([]);

  // PWA
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

  // Push messages
  useEffect(() => {
    const handlePushMessage = (event) => {
      if (event.data?.type === "PUSH_RECEIVED") {
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

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleUpdate = () => {
    updateSW();
    setUpdateAvailable(false);
    window.location.reload();
  };

  return (
    <>
      <BrowserRouter>
        <AppContent />
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
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Update PWA */}
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
          🔄 Nueva versión disponible&nbsp;
          <button
            onClick={handleUpdate}
            style={{
              marginLeft: "1rem",
              background: "#fff",
              color: "#333",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Actualizar
          </button>
        </div>
      )}
    </>
  );
}

export default App;
