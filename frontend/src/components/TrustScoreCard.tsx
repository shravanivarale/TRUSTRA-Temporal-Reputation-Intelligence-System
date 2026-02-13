"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface TrustScoreCardProps {
    score: number;
    loading?: boolean;
}

export function TrustScoreCard({ score, loading }: TrustScoreCardProps) {
    const getScoreColor = (s: number) => {
        if (s >= 750) return "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]";
        if (s >= 500) return "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]";
        return "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    };

    const getStatus = (s: number) => {
        if (s >= 750) return { label: "EXCELLENT", icon: ShieldCheck, color: "text-emerald-400" };
        if (s >= 500) return { label: "MODERATE RISK", icon: ShieldAlert, color: "text-yellow-400" };
        return { label: "HIGH RISK", icon: ShieldAlert, color: "text-red-500" };
    };

    const status = getStatus(score);
    const Icon = status.icon;

    return (
        <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>

            <div className="relative glass-panel p-6 rounded-2xl h-full flex flex-col justify-between bg-slate-900/90">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-400 font-medium text-sm tracking-wider uppercase">Current Trust Score</h3>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`p-2 rounded-full bg-slate-800/50 ${status.color} border border-slate-700`}
                    >
                        <Icon size={20} />
                    </motion.div>
                </div>

                <div className="flex items-end gap-3 mb-2">
                    {loading ? (
                        <div className="animate-pulse h-16 w-32 bg-slate-800 rounded"></div>
                    ) : (
                        <motion.div
                            key={score}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`text-6xl font-bold font-mono tracking-tighter ${getScoreColor(score)}`}
                        >
                            {Math.round(score)}
                        </motion.div>
                    )}
                    <span className="text-slate-500 text-sm mb-2">/ 1000</span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-4 shadow-inner">
                    <motion.div
                        className={`h-full ${score >= 750 ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : score >= 500 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-red-500 to-pink-600"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / 1000) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </div>

                <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                    <span>Updated: Just now</span>
                    <span className={`${status.color} font-bold tracking-widest`}>{status.label}</span>
                </div>
            </div>
        </div>
    );
}
