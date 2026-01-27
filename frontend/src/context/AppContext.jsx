import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchData, loginUser, logoutUser } from "../utils/api";
import { estaTokenExpirado } from "../utils/tokenUtils";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
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
  const [servicios, setServicios] = useState([]);
  


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
        const [jefaturasData, dependenciasData, guardiasData, licenciasData, notificacionesData, vehiculosData, funcionesData, serviciosData] = await Promise.all([
          fetchData("/jefaturas"),
          fetchData("/dependencias"),
          fetchData("/guardias"),
          fetchData("/licencias"),
          fetchData("/notificaciones"),
          fetchData("/vehiculos"),
          fetchData("/funcion"),
          fetchData("/servicios"),
        ]);
        setJefaturas(jefaturasData || []);
        setDependencias(dependenciasData || []);
        setGuardias(guardiasData || []);
        setLicencias(licenciasData || []);
        setNotificaciones(notificacionesData || []);
        setVehiculos(vehiculosData || []);
        setFunciones(funcionesData || []);
        setServicios(serviciosData || []);
      } else if (usuarioData?.rol_jerarquico === "JEFE_DEPENDENCIA" || usuarioData?.rol_jerarquico === "FUNCIONARIO") {
        const [jefaturasData, dependenciasData, turnosData, guardiasData, licenciasData, notificacionesData, vehiculosData, funcionesData, serviciosData ] = await Promise.all([
          fetchData("/jefaturas"),
          fetchData("/dependencias"),
          fetchData("/turnos"),
          fetchData("/guardias"),
          fetchData("/licencias"),
          fetchData("/notificaciones"),
          fetchData("/vehiculos"),
          fetchData("/funcion"),
          fetchData("/servicios"),
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
        setServicios(serviciosData || []);
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
    setServicios([]);
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

  const recargarUsuarios = async () => {
    try {
      const usuariosData = await fetchData("/usuarios");
      setUsuarios(usuariosData || []);
    } catch (error) {
      console.error("Error cargando datos de usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const recargarVehiculos = async () => {
    try {
      const vehiculosData = await fetchData("/vehiculos");
      setVehiculos(vehiculosData || []);
    } catch (error) {
      console.error("Error cargando datos de vehiculos:", error);
    } finally {
      setLoading(false);
    }
  };

  const recargarServicios = async () => {
    try {
      const serviciosData = await fetchData("/servicios");
      setServicios(serviciosData || []);
    } catch (error) {
      console.error("Error cargando datos de servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  const recargarPrendas = async () => {
    try {
      const prendasData = await fetchData("/prendas");
      setPrendas(prendasData || []);
    } catch (error) {
      console.error("Error cargando datos de prendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const recargarDatos = async () => {
    await fetchAppData();
  };

  const gradosEquivalencia = {
    1: "Agente",
    2: "Cabo",
    3: "Sargento",
    4: "Sub Oficial Mayor",
    5: "Oficial Ayudante",
    6: "Oficial Principal",
    7: "Sub Comisario",
    8: "Comisario",
    9: "Comisario Mayor",
  };

  const gradosAbreviadosEquivalencia = {
    1: "Agte",
    2: "Cabo",
    3: "Sgto.",
    4: "S.O.M.",
    5: "Ofl. Ayte.",
    6: "Ofl. Ppal.",
    7: "Sub Crio.",
    8: "Crio.",
    9: "Crio. Mayor",
  };

  const grados = [ 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const obtenerGrado = (grado) => gradosEquivalencia[grado] ?? grado;


  const obtenerGradoAbreviado = (grado) => gradosAbreviadosEquivalencia[grado] ?? grado;


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
        servicios,
        token,
        loading,
        grados,
        setNewToken,
        login,
        logout,
        recargarDatos,
        recargarGuaridas,
        recargarNotificaciones,
        setUsuario,
        recargarUsuarios,
        recargarVehiculos,
        recargarServicios,
        recargarPrendas,
        obtenerGrado,
        obtenerGradoAbreviado,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
