"use client";

import { useEffect, useState } from "react";
import { TrustScoreCard } from "@/components/TrustScoreCard";
import { RiskRadar } from "@/components/RiskRadar";
import { TrustTimeline } from "@/components/TrustTimeline";
import { FraudCluster } from "@/components/FraudCluster";
import { WhyThisScore } from "@/components/WhyThisScore";
import { fetchTrustData } from "@/lib/api";
import { io } from "socket.io-client";
import { ChevronDown } from "lucide-react";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [sellers, setSellers] = useState<any[]>([]);
    const [sellerId, setSellerId] = useState<string>("");

    useEffect(() => {
        // 1. Fetch Sellers List First
        const fetchSellers = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/sellers");
                const sellerList = await res.json();
                setSellers(sellerList);
                if (sellerList.length > 0) {
                    setSellerId(sellerList[0].id);
                }
            } catch (e) {
                console.error("Failed to load sellers", e);
            }
        };
        fetchSellers();
    }, []);

    const loadData = async () => {
        if (!sellerId) return;

        // Only set loading on initial load or manual refresh, not background updates
        if (!data || data.sellerId !== sellerId) setLoading(true);

        const result = await fetchTrustData(sellerId);
        if (result) {
            // Adapter: Convert API response to UI model
            const uiData = {
                sellerId: sellerId,
                sellerName: result.seller?.name || "Unknown Seller",
                trustScore: result.trustData?.trust_score || 0,
                risk: {
                    volatility: result.trustData?.volatility_index || 0,
                },
                // Mock timeline for now as history is empty
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

            // Merge Graph Data if available
            if (result.graphData) {
                // Add graph insights to factors or alerts
                if (result.graphData.clustering_coefficient > 0.5) {
                    uiData.factors.push({
                        label: "Graph Intelligence",
                        impact: "negative",
                        value: "-50",
                        description: "High collusion risk detected in buyer network."
                    });
                }
            }

            setData(uiData);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();

        // Connect to WebSocket
        const socket = io("http://localhost:5000");

        socket.on("connect", () => {
            console.log("Connected to WebSocket");
        });

        socket.on("trust_update", (update: any) => {
            console.log("Received trust update:", update);
            // In demo mode, we just apply the update if it matches current seller OR
            // since we don't have real updates for all IDs, we apply broad updates for demo effect
            // But let's check ID to be correct
            if (update.sellerId === sellerId) {
                setData((prev: any) => {
                    if (!prev) return prev;
                    const newScore = Math.min(1000, Math.max(0, prev.trustScore + update.change));
                    return {
                        ...prev,
                        trustScore: newScore
                    };
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [sellerId]);

    return (
        <main className="min-h-screen bg-[#0b1120] text-slate-200 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        TRUSTRA™
                    </h1>
                    <p className="text-slate-500 text-sm">Temporal Reputation Intelligence System</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Seller Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm rounded border border-slate-700 w-64 justify-between">
                            <span className="truncate">{data?.sellerName || "Select Seller"}</span>
                            <ChevronDown size={14} />
                        </button>
                        <div className="absolute top-full mt-1 w-64 bg-slate-800 border border-slate-700 rounded shadow-xl hidden group-hover:block z-50 max-h-60 overflow-y-auto">
                            {sellers.map((s) => (
                                <div
                                    key={s.id}
                                    onClick={() => setSellerId(s.id)}
                                    className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-sm truncate"
                                >
                                    {s.name} <span className="text-slate-500 text-xs">({Math.round(s.baseline_trust_score)})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm rounded border border-slate-700"
                    >
                        Refresh
                    </button>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-300">{data?.sellerName || "Loading..."}</p>
                        <p className="text-xs text-slate-500">Seller ID: #{sellerId.slice(0, 8)}...</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700"></div>
                </div>
            </header>

            {loading && !data ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-6">
                    {/* Top Row: Score & Radar */}
                    <div className="col-span-12 md:col-span-4">
                        <TrustScoreCard score={data?.trustScore || 0} loading={loading} />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <RiskRadar data={data?.radarData || []} />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <WhyThisScore factors={data?.factors || []} />
                    </div>

                    {/* Middle Row: Timeline & Graph */}
                    <div className="col-span-12 md:col-span-8">
                        <TrustTimeline data={data?.timeline || []} />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <FraudCluster />
                    </div>
                </div>
            )}
        </main>
    );
}
