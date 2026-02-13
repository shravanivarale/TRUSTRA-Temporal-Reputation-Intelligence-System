"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import clsx from "clsx";

interface TrustScoreCardProps {
    score: number;
    loading?: boolean;
}

export function TrustScoreCard({ score, loading }: TrustScoreCardProps) {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        if (loading) return;
        const controls = { value: displayScore };
        // Simple animation logic - ideally use framer-motion useSpring or similar
        const duration = 1500;
        const start = performance.now();

        const animate = (time: number) => {
            const timeFraction = (time - start) / duration;
            if (timeFraction > 1) {
                setDisplayScore(score);
                return;
            }
            const progress = 1 - Math.pow(1 - timeFraction, 3); // easeOutCubic
            setDisplayScore(Math.floor(progress * score));
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [score, loading]);

    const getStatus = (s: number) => {
        if (s >= 750) return { label: "Excellent", color: "text-emerald-400", icon: ShieldCheck };
        if (s >= 500) return { label: "Good", color: "text-yellow-400", icon: Shield };
        return { label: "High Risk", color: "text-red-500", icon: ShieldAlert };
    };

    const status = getStatus(score);
    const Icon = status.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl backdrop-blur-sm relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon size={120} />
            </div>

            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
                Digital Trust Score
            </h3>

            <div className="flex items-end gap-2 mb-4">
                <span className={clsx("text-6xl font-bold font-mono tracking-tight", status.color)}>
                    {displayScore}
                </span>
                <span className="text-slate-500 text-lg mb-2">/ 1000</span>
            </div>

            <div className="flex items-center gap-2">
                <div className={clsx("h-2 w-2 rounded-full animate-pulse",
                    score >= 750 ? "bg-emerald-400" : score >= 500 ? "bg-yellow-400" : "bg-red-500"
                )} />
                <span className={clsx("text-lg font-medium", status.color)}>
                    {status.label}
                </span>
            </div>

            {loading && (
                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
        </motion.div>
    );
}
