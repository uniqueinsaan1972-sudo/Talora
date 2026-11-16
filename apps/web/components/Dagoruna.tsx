"use client";
import { motion } from "framer-motion";
export type Pose = "happy" | "excited" | "thinking" | "reading" | "sad" | "sleeping" | "surprised" | "listening" | "running" | "celebrating" | "school";
export default function Dagoruna({ pose, size = 180, alt }: { pose: Pose; size?: number; alt?: string }) {
  return <motion.img key={pose} src={`/dagoruna/${pose}.png`} alt={alt ?? `Dagoruna (${pose})`} width={size} style={{ borderRadius: 20, maxWidth: "100%", height: "auto" }}
    initial={{ scale: 0.85, opacity: 0, y: 14 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} whileHover={{ y: -5 }} />;
}
export function Confetti() {
  const c = ["#2F7DE8", "#F7C948", "#BFE8C8", "#B9A2F5", "#F59A3D"];
  return <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 20 }}>{Array.from({ length: 28 }, (_, i) =>
    <motion.span key={i} style={{ position: "absolute", top: -20, left: `${(i * 37) % 100}%`, width: 10, height: 14, background: c[i % 5], borderRadius: 2 }}
      initial={{ y: -20, rotate: 0, opacity: 1 }} animate={{ y: "105vh", rotate: 360 + i * 20, opacity: 0.9 }} transition={{ duration: 2.2 + (i % 5) * 0.3, ease: "easeIn", delay: (i % 7) * 0.05 }} />)}</div>;
}
