"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { motion } from "framer-motion";

interface TrustTimelineProps {
    data: {
        date: string;
        score: number;
        event?: string; // e.g. "Fraud Attempt"
    }[];
}

export function TrustTimeline({ data }: TrustTimelineProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-[350px] w-full bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                    Trust Stability Curve (30 Days)
                </h3>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-slate-500">Normal</span>
                </div>
            </div>

            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 1000]}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#60a5fa', stroke: '#1e3a8a', strokeWidth: 2 }}
                        />
                        {/* Example Reference Line for threshold */}
                        <ReferenceLine y={500} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Risk Threshold', fill: '#ef4444', fontSize: 10 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
