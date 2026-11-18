"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { motion, MotionConfig } from "framer-motion";
import BottomNav from "../components/BottomNav";
const Assistant = dynamic(() => import("../components/DagorunaAssistant"), { ssr: false });
import { supabase } from "../lib/supabase";
import { flushQueue } from "../lib/offline";
export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/"; const hideAssistant = path === "/" || (path.startsWith("/exam") && !path.includes("/report")); // never during a Mega Test
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const sync = () => { if (supabase) void flushQueue(supabase); }; sync(); window.addEventListener("online", sync); return () => window.removeEventListener("online", sync);
  }, []);
  return <MotionConfig reducedMotion="user"><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>{children}</motion.div><BottomNav />{!hideAssistant && <Assistant />}</MotionConfig>;
}
