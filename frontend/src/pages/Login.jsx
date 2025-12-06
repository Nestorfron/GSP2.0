import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Logo from "../assets/logo.png";
import { registerPush } from "../utils/registerPush";

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(correo, password);
      const rol = data?.usuario?.rol_jerarquico;
      const usuarioId = data?.usuario?.id;

      switch (rol) {
        case "ADMINISTRADOR":
          navigate("/admin");
          break;
        case "JEFE_ZONA":
          navigate("/zona");
          break;
        case "JEFE_DEPENDENCIA":
          navigate("/dependencia");
          break;
        case "FUNCIONARIO":
          navigate("/funcionario");
          break;
        default:
          alert("Rol no reconocido. Contacte a un administrador.");
      }

      await registerPush(usuarioId);
      
    } catch (error) {
      alert(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      min-h-screen flex items-center justify-center 
      bg-white dark:bg-slate-950 
      px-4 sm:px-6 md:px-8
    ">
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-xs sm:max-w-sm md:max-w-md 
          space-y-6 sm:space-y-8
        "
      >
        {/* LOGO + TÍTULO */}
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <img
            src={Logo}
            alt="Logo"
            className="w-20 h-auto sm:w-24 md:w-28"
          />

          <h1 className="
            text-xl sm:text-2xl md:text-3xl 
            font-semibold text-blue-700 dark:text-blue-400
          ">
            Iniciar sesión
          </h1>
        </div>

        {/* INPUTS */}
        <div className="space-y-5 sm:space-y-6">
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Correo electrónico"
            className="
              w-full bg-transparent border-b 
              border-blue-200 dark:border-slate-700 
              text-gray-900 dark:text-gray-100 
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 
              py-2 text-sm sm:text-base transition-all
            "
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="
              w-full bg-transparent border-b 
              border-blue-200 dark:border-slate-700 
              text-gray-900 dark:text-gray-100 
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 
              py-2 text-sm sm:text-base transition-all
            "
            required
          />
        </div>

        {/* BOTÓN */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full py-2.5 sm:py-3 
            text-sm sm:text-base font-medium rounded-md 
            transition-all duration-200
            ${
              loading
                ? "bg-blue-300 dark:bg-blue-800 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white"
            }
          `}
        >
          {loading ? "Iniciando..." : "Entrar"}
        </button>

        {/* LINK */}
        <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ¿Olvidaste la contraseña?
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
