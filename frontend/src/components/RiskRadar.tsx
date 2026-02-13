"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { motion } from "framer-motion";

interface RiskRadarProps {
    data: {
        subject: string;
        A: number; // Value
        fullMark: number;
    }[];
}

export function RiskRadar({ data }: RiskRadarProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[300px] w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                    Risk Profile Radar
                </h3>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Real-time</span>
            </div>

            <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Risk"
                            dataKey="A"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill="#8b5cf6"
                            fillOpacity={0.3}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                            itemStyle={{ color: '#c4b5fd' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
