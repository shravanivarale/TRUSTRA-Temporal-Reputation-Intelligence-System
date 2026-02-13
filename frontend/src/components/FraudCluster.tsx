"use client";

import { motion } from "framer-motion";

export function FraudCluster() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="h-[300px] w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group"
        >
            <div className="flex justify-between items-center mb-4 z-10 relative">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                    Graph Intelligence: Fraud Clusters
                </h3>
                <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded border border-red-900/50">High Severity</span>
            </div>

            {/* Fallback Visualization: Use simulated nodes/edges with simple divs or SVG */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Simple visualization of a cluster */}
                <div className="relative h-48 w-48 animate-spin-slow">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)] z-20"></div>

                    {/* Surrounding Nodes */}
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-3 w-3 bg-slate-600 rounded-full"
                            style={{
                                top: `${50 + 35 * Math.sin(i * (Math.PI / 3))}%`,
                                left: `${50 + 35 * Math.cos(i * (Math.PI / 3))}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    ))}

                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700 stroke-2">
                        {[...Array(6)].map((_, i) => (
                            <line
                                key={i}
                                x1="50%"
                                y1="50%"
                                x2={`${50 + 35 * Math.cos(i * (Math.PI / 3))}%`}
                                y2={`${50 + 35 * Math.sin(i * (Math.PI / 3))}%`}
                            />
                        ))}
                    </svg>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 z-10">
                <p className="text-xs text-slate-500">Detected: <span className="text-slate-300">Collusion Ring #A7X</span></p>
                <p className="text-xs text-slate-500">Nodes Involved: <span className="text-slate-300">7 Sellers</span></p>
            </div>
        </motion.div>
    );
}
