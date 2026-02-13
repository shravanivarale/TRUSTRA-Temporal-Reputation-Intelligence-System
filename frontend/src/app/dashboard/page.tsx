"use client";

import { useEffect, useState } from "react";
import { TrustScoreCard } from "@/components/TrustScoreCard";
import { RiskRadar } from "@/components/RiskRadar";
import { TrustTimeline } from "@/components/TrustTimeline";
import { FraudCluster } from "@/components/FraudCluster";
import { WhyThisScore } from "@/components/WhyThisScore";
import { fetchTrustData } from "@/lib/api";
import { io } from "socket.io-client";
import { ChevronDown, RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [sellers, setSellers] = useState<any[]>([]);
    const [sellerId, setSellerId] = useState<string>("");

    useEffect(() => {
        const fetchSellers = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/sellers");
                if (!res.ok) throw new Error("Backend unavailable");
                const sellerList = await res.json();
                setSellers(sellerList);
                if (sellerList.length > 0) {
                    setSellerId(sellerList[0].id);
                } else {
                    setError("No sellers found. Please run data generator.");
                }
            } catch (e) {
                console.error("Failed to load sellers", e);
                setError("Cannot connect to TRUSTRA Backend. Ensure 'start_all.bat' is running.");
            }
        };
        fetchSellers();
    }, []);

    const loadData = async () => {
        if (!sellerId) return;
        if (!data || data.sellerId !== sellerId) setLoading(true);

        try {
            const result = await fetchTrustData(sellerId);
            if (result) {
                const uiData = {
                    sellerId: sellerId,
                    sellerName: result.seller?.name || "Unknown Seller",
                    trustScore: result.trustData?.trust_score || 0,
                    risk: {
                        volatility: result.trustData?.volatility_index || 0,
                    },
                    timeline: [
                        { date: 'Jan 1', score: 750 },
                        { date: 'Jan 5', score: 760 },
                        { date: 'Jan 10', score: 755 },
                        { date: 'Jan 15', score: 780 },
                        { date: 'Jan 20', score: 775 },
                        { date: 'Jan 25', score: 785 },
                    ],
                    radarData: [
                        { subject: 'Volatility', A: result.trustData?.volatility_index || 0, fullMark: 100 },
                        { subject: 'Fraud Prob', A: result.trustData?.risk_level === 'High' ? 80 : 10, fullMark: 100 },
                        { subject: 'Returns', A: 30, fullMark: 100 },
                        { subject: 'Disputes', A: 15, fullMark: 100 },
                        { subject: 'Velocity', A: 50, fullMark: 100 },
                        { subject: 'Identity', A: 90, fullMark: 100 },
                    ],
                    factors: [
                        { label: "Behavioral Metrics", impact: "positive", value: result.trustData?.components?.behavioral, description: "Strong delivery performance." },
                        { label: "Authenticity", impact: "positive", value: result.trustData?.components?.authenticity, description: "Reviews appear organic." },
                    ]
                };

                if (result.graphData && result.graphData.clustering_coefficient > 0.5) {
                    uiData.factors.push({
                        label: "Graph Intelligence",
                        impact: "negative",
                        value: "-50",
                        description: "High collusion risk detected in buyer network."
                    });
                }

                setData(uiData);
                setError(null);
            }
        } catch (err) {
            setError("Failed to load trust data.");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
        const socket = io("http://localhost:5000");

        socket.on("connect", () => {
            console.log("Connected to WebSocket");
        });

        socket.on("trust_update", (update: any) => {
            console.log("Received trust update:", update);
            if (update.sellerId === sellerId && data) {
                setData((prev: any) => {
                    if (!prev) return prev;
                    const newScore = Math.min(1000, Math.max(0, prev.trustScore + update.change));
                    return { ...prev, trustScore: newScore };
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [sellerId, data]); // Added data to dependency array to ensure latest data is used in socket update

    return (
        <main className="min-h-screen text-slate-200 p-6 md:p-10 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
            </div>

            <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6 glass-panel p-6 rounded-2xl relative z-10">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg">
                        TRUSTRA™
                    </h1>
                    <p className="text-slate-400 text-sm tracking-wide mt-1">Temporal Reputation Intelligence System</p>
                </div>

                {error ? (
                    <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/50">
                        <AlertTriangle size={18} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        {/* Seller Dropdown */}
                        <div className="relative group z-50">
                            <button className="flex items-center gap-3 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-sm font-medium rounded-xl border border-slate-700/50 w-72 justify-between transition-all shadow-lg backdrop-blur-sm">
                                <span className="truncate">{data?.sellerName || "Select Seller Account"}</span>
                                <ChevronDown size={16} className="text-slate-400" />
                            </button>
                            <div className="absolute top-full mt-2 w-72 bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl hidden group-hover:block z-50 max-h-80 overflow-y-auto backdrop-blur-xl">
                                {sellers.map((s) => (
                                    <div
                                        key={s.id}
                                        onClick={() => setSellerId(s.id)}
                                        className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm border-b border-white/5 last:border-0"
                                    >
                                        <div className="font-medium text-slate-200 truncate">{s.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Trust Score: {Math.round(s.baseline_trust_score)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={loadData}
                            className="p-2.5 bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 rounded-xl border border-slate-700/50 transition-all active:scale-95"
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} className={loading && !data ? "animate-spin" : ""} />
                        </button>

                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-800 shadow-lg"></div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            {(loading && !data) ? (
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-8 w-8 bg-blue-500/20 rounded-full blur-md"></div>
                        </div>
                    </div>
                    <p className="mt-8 text-slate-400 animate-pulse tracking-widest text-sm uppercase">Initializing Trust Engine...</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-12 gap-6"
                >
                    {/* Top Row */}
                    <div className="col-span-12 lg:col-span-4 h-full">
                        <div className="h-full glass-card-hover rounded-2xl"><TrustScoreCard score={data?.trustScore || 0} loading={loading} /></div>
                    </div>
                    <div className="col-span-12 lg:col-span-4 h-full">
                        <div className="h-full glass-panel p-4 rounded-2xl glass-card-hover"><RiskRadar data={data?.radarData || []} /></div>
                    </div>
                    <div className="col-span-12 lg:col-span-4 h-full">
                        <div className="h-full glass-panel p-4 rounded-2xl glass-card-hover"><WhyThisScore factors={data?.factors || []} /></div>
                    </div>

                    {/* Middle Row */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="glass-panel p-6 rounded-2xl glass-card-hover min-h-[400px]">
                            <h3 className="text-lg font-medium text-slate-300 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Historical Trust Vector
                            </h3>
                            <TrustTimeline data={data?.timeline || []} />
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-4">
                        <div className="glass-panel p-6 rounded-2xl glass-card-hover h-full">
                            <h3 className="text-lg font-medium text-slate-300 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                Graph Intelligence
                            </h3>
                            <FraudCluster />
                        </div>
                    </div>
                </motion.div>
            )}
        </main>
    );
}
