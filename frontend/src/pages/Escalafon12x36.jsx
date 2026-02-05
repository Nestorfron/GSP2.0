import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import BackButton from "../components/BackButton";
import Loading from "../components/Loading";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default function Escalafon12x36 () {
    return (
        <div>
        Escalafon12x36
        </div>
    );
}