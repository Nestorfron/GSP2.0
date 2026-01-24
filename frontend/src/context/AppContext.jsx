import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchData, loginUser, logoutUser } from "../utils/api";
import { estaTokenExpirado } from "../utils/tokenUtils";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [jefaturas, setJefaturas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [dependencias, setDependencias] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [guardias, setGuardias] = useState([]);
  const [licencias, setLicencias] = useState([]);
  const [extraordinarias, setExtraordinarias] = useState([]);
  const [licenciasPendientes, setLicenciasPendientes] = useState([]);
  const [licenciasRechazadas, setLicenciasRechazadas] = useState([]);
  const [notificaciones, setNotificaciones ] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [funciones, setFunciones] = useState([]);
  


  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [loading, setLoading] = useState(true);

  const fetchAppData = async () => {
    if (!token || !userId) return;
    setLoading(true);

    try {
      const usuarioData = await fetchData(`/usuarios/${userId}`);
      setUsuario(usuarioData);

      if (usuarioData?.rol_jerarquico === "ADMINISTRADOR" || usuarioData?.rol_jerarquico === "JEFE_ZONA") {
        const [jefaturasData, dependenciasData, guardiasData, licenciasData, notificacionesData, vehiculosData, funcionesData] = await Promise.all([
          fetchData("/jefaturas"),
          fetchData("/dependencias"),
          fetchData("/guardias"),
          fetchData("/licencias"),
          fetchData("/notificaciones"),
          fetchData("/vehiculos"),
          fetchData("/funcion")
        ]);
        setJefaturas(jefaturasData || []);
        setDependencias(dependenciasData || []);
        setGuardias(guardiasData || []);
        setLicencias(licenciasData || []);
        setNotificaciones(notificacionesData || []);
        setVehiculos(vehiculosData || []);
        setFunciones(funcionesData || []);
      } else if (usuarioData?.rol_jerarquico === "JEFE_DEPENDENCIA" || usuarioData?.rol_jerarquico === "FUNCIONARIO") {
        const [jefaturasData, dependenciasData, turnosData, guardiasData, licenciasData, notificacionesData, vehiculosData, funcionesData ] = await Promise.all([
          fetchData("/jefaturas"),
          fetchData("/dependencias"),
          fetchData("/turnos"),
          fetchData("/guardias"),
          fetchData("/licencias"),
          fetchData("/notificaciones"),
          fetchData("/vehiculos"),
          fetchData("/funcion")
        ]);
        setJefaturas(jefaturasData || []);
        setDependencias(dependenciasData || []);
        setTurnos(turnosData || []);
        const ordinariasData = guardiasData.filter(g => g.tipo !== "extraordinaria");
        setGuardias(ordinariasData);
        const extraorariasData = guardiasData.filter(g => g.tipo === "Extraordinaria" || g.tipo === "Curso" || g.tipo === "curso" || g.tipo === "extraordinaria");
        setExtraordinarias(extraorariasData);
        const licenciasAprobadas = licenciasData.filter(l => l.estado === "aprobada" || l.estado === "aprobado" || l.estado === "activo");
        setLicencias(licenciasAprobadas || []);
        const licenciasPendientes = licenciasData.filter(l => l.estado === "pendiente");
        setLicenciasPendientes(licenciasPendientes || []);
        const licenciasRechazadas = licenciasData.filter(l => l.estado === "rechazada");
        setLicenciasRechazadas(licenciasRechazadas || []);
        setNotificaciones(notificacionesData || []);
        setVehiculos(vehiculosData || []);
        setFunciones(funcionesData || []);
      }
    } catch (error) {
      console.error("Error cargando datos de la app:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    if (token && userId && !estaTokenExpirado(token)) {
      fetchAppData();
    } else {
      setLoading(false);
    }
  }, [token, userId]);


  const login = async (correo, password) => {
    try {
      const data = await loginUser(correo, password);
      if (data.token && data.usuario?.id) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.usuario.id);
        setToken(data.token);
        setUserId(data.usuario.id);

        await fetchAppData();
        return data;
      } else {
        throw new Error(
          "Respuesta de login incompleta: falta token o usuario.id"
        );
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      throw new Error(err?.message || "Error al iniciar sesión");
    }
  };

  const setNewToken = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
    setUsuario(null);
    setJefaturas([]);
    setZonas([]);
    setDependencias([]);
    setTurnos([]);
    setGuardias([]);
    setExtraordinarias([]);
    setLicencias([]);
    setLicenciasPendientes([]);
    setLicenciasRechazadas([]);
    setNotificaciones([]);
    setVehiculos([]);
    setFunciones([]);
    setUsuario(null);

  };

  const recargarGuaridas = async () => {
    const data = await fetchData(`/guardias`);
    const ordinariasData2 = data.filter(g => g.tipo !== "extraordinaria");
    setGuardias(ordinariasData2);
    const extraorariasData2 = data.filter(g => g.tipo === "extraordinaria");
    setExtraordinarias(extraorariasData2);
    const data2 = await fetchData(`/licencias`);
    setLicencias(data2);
  };

  const recargarNotificaciones = async () => {
    try {
      const notificacionesData = await fetchData("/notificaciones", token);
      if (notificacionesData) {
        setNotificaciones(notificacionesData || []);
      }
    } catch (error) {
      console.error("Error cargando datos de notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const recargarDatos = async () => {
    await fetchAppData();
  };

  return (
    <AppContext.Provider
      value={{
        usuario,
        jefaturas,
        zonas,
        dependencias,
        turnos,
        guardias,
        extraordinarias,
        licencias,
        licenciasPendientes,
        licenciasRechazadas,
        notificaciones,
        vehiculos,
        funciones,
        token,
        loading,
        setNewToken,
        login,
        logout,
        recargarDatos,
        recargarGuaridas,
        recargarNotificaciones,
        setUsuario,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
