"use client";

import { motion } from "framer-motion";

interface WhyThisScoreProps {
    factors: {
        label: string;
        impact: "positive" | "negative";
        value: string;
        description: string;
    }[];
}

export function WhyThisScore({ factors }: WhyThisScoreProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm"
        >
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">
                Deep Explainability: Why This Score?
            </h3>

            <div className="space-y-4">
                {factors.map((factor, idx) => (
                    <div key={idx} className="group relative">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-slate-300">{factor.label}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${factor.impact === 'positive'
                                    ? 'text-emerald-400 bg-emerald-900/20 category-badge'
                                    : 'text-red-400 bg-red-900/20 category-badge'
                                }`}>
                                {factor.impact === 'positive' ? '+' : ''}{factor.value}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">{factor.description}</p>
                        <div className={`mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden`}>
                            <div
                                className={`h-full rounded-full ${factor.impact === 'positive' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: factor.impact === 'positive' ? '70%' : '40%' }} // Dynamic width simulation
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
