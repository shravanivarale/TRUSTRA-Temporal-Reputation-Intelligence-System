"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, TrendingUp, Shield, AlertTriangle, BarChart3, Activity } from "lucide-react";
import { ReactNode } from "react";

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    panelId: string;
    children: ReactNode;
    analysisData?: any;
}

const panelInsights: Record<string, { icon: any; color: string; insights: string[]; description: string }> = {
    "trust-score": {
        icon: Shield,
        color: "emerald",
        description: "The Trust Score is a composite metric combining behavioral patterns, review authenticity, temporal decay, and graph intelligence signals. It dynamically adjusts based on real-time seller activity.",
        insights: [
            "Score is computed using a weighted ensemble: 60% Behavioral + 40% Authenticity",
            "Temporal decay reduces stale scores by 0.1% daily to reflect recency bias",
            "Graph intelligence can penalize up to -50 points for collusion signals",
            "Scores above 750 indicate consistently reliable seller behavior",
            "Scores below 500 trigger enhanced monitoring and buyer warnings",
        ],
    },
    "risk-radar": {
        icon: Activity,
        color: "purple",
        description: "The Risk Radar visualizes 6 key threat vectors simultaneously. Each axis represents a different risk dimension, allowing evaluators to quickly identify which areas need attention.",
        insights: [
            "Volatility: Measures score fluctuation over 30 days — high volatility = unstable trust",
            "Fraud Probability: ML-derived likelihood of fraudulent behavior based on transaction patterns",
            "Returns Rate: Percentage of transactions resulting in product returns or refunds",
            "Disputes: Active and historical buyer disputes filed against this seller",
            "Velocity: Transaction frequency anomalies — sudden spikes may indicate wash trading",
            "Identity Score: Verification completeness and consistency of seller identity",
        ],
    },
    "why-score": {
        icon: BarChart3,
        color: "cyan",
        description: "Deep Explainability breaks down exactly which factors contributed to the current trust score. Each factor shows its positive or negative impact with a confidence weight.",
        insights: [
            "Behavioral Metrics: Derived from delivery times, completion rates, and response patterns",
            "Authenticity Score: NLP analysis of review text for synthetic or incentivized patterns",
            "Graph Intelligence: Network analysis detects unusual buyer-seller relationship clusters",
            "Each factor contributes independently — no single factor can override the composite",
            "Negative factors are weighted 1.5x to prioritize consumer protection",
        ],
    },
    "trust-timeline": {
        icon: TrendingUp,
        color: "blue",
        description: "The Trust Stability Curve tracks how a seller's score has evolved over time. Sudden drops often correlate with fraudulent events, while steady climbs indicate genuine reputation building.",
        insights: [
            "The red dashed line at 500 represents the Risk Threshold boundary",
            "Scores below this threshold for >7 days trigger automatic investigation flags",
            "Sharp drops (>100 points in 24hrs) indicate potential fraud events",
            "Gradual upward trends confirm organic reputation building",
            "The curve uses temporal smoothing to filter out noise from single transactions",
            "Historical data powers the behavioral engine's prediction confidence",
        ],
    },
    "fraud-cluster": {
        icon: AlertTriangle,
        color: "red",
        description: "Graph Intelligence uses NetworkX to map buyer-seller transaction networks. Dense clusters of interconnected accounts often indicate coordinated fraud rings that manipulate trust scores.",
        insights: [
            "Louvain community detection identifies tightly-connected sub-networks",
            "Clustering coefficient >0.5 flags a seller as 'high collusion risk'",
            "In-degree centrality measures how many unique buyers transact with a seller",
            "Fraud rings typically show 3-10 accounts with circular transaction patterns",
            "PageRank-inspired scoring identifies influential nodes in the fraud network",
            "Cross-referencing with temporal data reveals coordinated timing patterns",
        ],
    },
};

export function DetailModal({ isOpen, onClose, title, panelId, children, analysisData }: DetailModalProps) {
    const panel = panelInsights[panelId] || panelInsights["trust-score"];
    const Icon = panel.icon;

    const colorMap: Record<string, string> = {
        emerald: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400",
        purple: "from-purple-500/20 to-purple-900/10 border-purple-500/30 text-purple-400",
        cyan: "from-cyan-500/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400",
        blue: "from-blue-500/20 to-blue-900/10 border-blue-500/30 text-blue-400",
        red: "from-red-500/20 to-red-900/10 border-red-500/30 text-red-400",
    };

    const colors = colorMap[panel.color] || colorMap.blue;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.85, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-slate-700/50 rounded-3xl shadow-2xl backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-20 flex justify-between items-center p-6 pb-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors} border`}>
                                    <Icon size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-100">{title}</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">In-Depth Analysis View</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-200"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Chart Area - takes 3/5 */}
                            <div className="lg:col-span-3">
                                <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 min-h-[400px]">
                                    {children}
                                </div>
                            </div>

                            {/* Insights Panel - takes 2/5 */}
                            <div className="lg:col-span-2 space-y-5">
                                {/* Description */}
                                <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5">
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Overview</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">{panel.description}</p>
                                </div>

                                {/* Key Insights */}
                                <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5">
                                    <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Key Insights</h4>
                                    <ul className="space-y-3">
                                        {panel.insights.map((insight, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * i }}
                                                className="flex items-start gap-2.5 text-sm text-slate-400"
                                            >
                                                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-${panel.color}-500`} />
                                                <span className="leading-relaxed">{insight}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Data Source Badge */}
                                <div className={`bg-gradient-to-r ${colors} border rounded-xl p-4 flex items-center gap-3`}>
                                    <Icon size={18} />
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider">Data Source</p>
                                        <p className="text-xs opacity-70 mt-0.5">Supabase PostgreSQL — Real-time</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* Expandable Panel Wrapper — wraps any chart panel to add click-to-maximize */
interface ExpandablePanelProps {
    children: ReactNode;
    onClick: () => void;
}

export function ExpandablePanel({ children, onClick }: ExpandablePanelProps) {
    return (
        <div className="relative cursor-pointer group/expand" onClick={onClick}>
            {children}
            {/* Maximize badge */}
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover/expand:opacity-100 transition-opacity duration-200">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/90 border border-slate-600/50 rounded-lg text-xs text-slate-300 shadow-lg backdrop-blur-sm">
                    <Maximize2 size={12} />
                    <span>Click to expand</span>
                </div>
            </div>
        </div>
    );
}
