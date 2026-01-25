import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import Logo from "../assets/logo.png";
import Loading from "../components/Loading";

const Home = () => {
  const navigate = useNavigate();
  const { usuario, jefaturas, zonas, dependencias, token, loading } = useAppContext();

  useEffect(() => {
    if ( !token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <Loading />
    );
  }
    
  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900">
        <p className="text-gray-600 dark:text-gray-300">
          No se encontró información del usuario.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
     <img
        src={Logo}
        alt="Logo"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
             w-72 opacity-5 blur-sm pointer-events-none"
      />
      <main className="flex-1 px-6 py-8 space-y-6 ">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Bienvenido, {usuario.nombre}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Rol: {usuario.rol_jerarquico}
          </p>
        </div>

        {/* Contenido */}
        {usuario.rol_jerarquico === "ADMINISTRADOR" ? (
          <div className="space-y-6">
            {jefaturas
              .sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: "base" }))
              .map((jefatura) => (
                <div
                  key={jefatura.id}
                  className="p-4 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl shadow-sm"
                >
                  <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {jefatura.nombre}
                  </h2>

                  {/* Zonas ordenadas */}
                  <div className="pl-3 space-y-2">
                    {jefatura.zonas
                      ?.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: "base" }))
                      .map((zona) => (
                        <div key={zona.id}>
                          <h3 className="font-medium text-blue-600 dark:text-blue-300">
                            {zona.nombre}
                          </h3>

                          {/* Dependencias ordenadas */}
                          <ul className="pl-4 text-sm text-gray-700 dark:text-gray-300 list-disc">
                            {zona.dependencias
                              ?.sort((a, b) =>
                                a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: "base" })
                              )
                              .map((dependencia) => (
                                <li key={dependencia.id}>{dependencia.nombre}</li>
                              ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Tenés acceso limitado a la información.
          </p>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
};

export default Home;
