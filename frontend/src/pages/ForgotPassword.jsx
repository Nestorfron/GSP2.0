import React, { useState } from "react";
import { forgotPassword } from "../utils/api";
import BackButton from "../components/BackButton";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
    } catch (err) {
      setMessage(err.message || "Error al enviar la solicitud.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-6">
      <div className="w-full max-w-sm flex flex-col space-y-6">
        
        <form className="space-y-8" onSubmit={handleSubmit}>
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 text-center">
            Recuperar contraseña
          </h1>

          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-blue-200 dark:border-slate-700 
              text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 py-2"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-sm font-medium rounded-md transition-all duration-200 
            ${
              loading
                ? "bg-blue-300 dark:bg-blue-800 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white"
            }`}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>

          {message && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          )}
        </form>

        {/* Botón abajo */}
        <div className="flex justify-center mt-4">
          <BackButton to={-1} tooltip="Volver" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
