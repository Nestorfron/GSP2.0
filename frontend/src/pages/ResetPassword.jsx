import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPasswordRequest } from "../utils/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await resetPasswordRequest(token, newPassword);
      setMessage("Contraseña actualizada. Redirigiendo...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.message || "Error al actualizar la contraseña");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-6">
      <form className="w-full max-w-sm space-y-8" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 text-center">
          Nueva contraseña
        </h1>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full bg-transparent border-b border-blue-200 dark:border-slate-700 
            text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 py-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-sm font-medium rounded-md transition-all duration-200 
          ${loading
              ? "bg-blue-300 dark:bg-blue-800 text-white cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white"
            }`}
        >
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </button>

        {message && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
