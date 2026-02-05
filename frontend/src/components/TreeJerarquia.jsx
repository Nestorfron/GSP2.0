import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Map,
  Shield,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import IconButton from "./IconButton";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function TreeJerarquia() {
  const navigate = useNavigate();
  const { jefaturas, dependencias } = useAppContext();

  const [openJefaturas, setOpenJefaturas] = useState({});
  const [openZonas, setOpenZonas] = useState({});

  /* ================= TOGGLES ================= */

  const toggleJefatura = (id) => {
    setOpenJefaturas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleZona = (id) => {
    setOpenZonas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  /* ================= HELPERS ================= */

  const dependenciasPorZona = (zonaId) =>
    (dependencias || []).filter(d => d.zona_id === zonaId);

  /* ================= UI ================= */

  return (
    <div className="space-y-3">

      {(jefaturas || []).map(jefatura => (
        <div
          key={jefatura.id}
          className="border border-blue-100 dark:border-slate-700 rounded-xl p-3"
        >

          {/* ===== JEFATURA ===== */}

          <div className="flex items-center gap-2">

            <IconButton
              icon={openJefaturas[jefatura.id] ? ChevronDown : ChevronRight}
              size="sm"
              onClick={() => toggleJefatura(jefatura.id)}
            />

            <Shield size={18} className="text-blue-600" />

            <p className="font-semibold flex-1">
              {jefatura.nombre}
            </p>

          </div>

          {/* ===== ZONAS ===== */}

          <AnimatePresence>
            {openJefaturas[jefatura.id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 mt-2 space-y-2"
              >

                {(jefatura.zonas || []).map(zona => (
                  <div
                    key={zona.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  >

                    {/* ===== ZONA ===== */}

                    <div className="flex items-center gap-2">

                      <IconButton
                        icon={openZonas[zona.id] ? ChevronDown : ChevronRight}
                        size="sm"
                        onClick={() => toggleZona(zona.id)}
                      />

                      <Map size={16} className="text-emerald-500" />

                      <p className="text-sm flex-1">{zona.nombre}</p>

                    </div>

                    {/* ===== DEPENDENCIAS ===== */}

                    <AnimatePresence>
                      {openZonas[zona.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-6 mt-2 space-y-1"
                        >

                          {dependenciasPorZona(zona.id).map(dep => (
                            <div
                              key={dep.id}
                              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2"
                            >

                              <Building2 size={15} className="text-purple-500" />

                              <span className="text-sm flex-1">
                                {dep.nombre}
                              </span>

                              <IconButton
                                icon={Eye}
                                size="sm"
                                onClick={() =>
                                  navigate(`/detalle-dependencia`, {
                                    state: { dependencia: dep },
                                  })
                                }
                              />

                            </div>
                          ))}

                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                ))}

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      ))}

    </div>
  );
}
