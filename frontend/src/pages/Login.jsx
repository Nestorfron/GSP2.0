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

      // ⭐ ID DEL USUARIO PARA GUARDAR LA SUBSCRIPCIÓN PUSH
      const usuarioId = data?.usuario?.id;

      // ⭐ REGISTRAR LA SUSCRIPCIÓN PUSH
      await registerPush(usuarioId);

      // Redirección según el rol jerárquico
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
          navigate("/login");
          break;
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-blue-100 dark:border-slate-800 px-6 py-8 space-y-6"
      >
        <div className="flex flex-col items-center space-y-3">
          <img src={Logo} alt="Logo" className="w-40 h-auto rounded-xl" />
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Iniciar sesión
          </h1>
        </div>

        <div className="space-y-5">
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full bg-transparent border-b border-blue-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 py-2 transition-all"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-transparent border-b border-blue-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 py-2 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            loading
              ? "bg-blue-300 dark:bg-blue-800 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white"
          }`}
        >
          {loading ? "Iniciando sesión..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
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
