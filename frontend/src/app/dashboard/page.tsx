"use client";

import { useEffect, useState, useRef } from "react";
import { TrustScoreCard } from "@/components/TrustScoreCard";
import { RiskRadar } from "@/components/RiskRadar";
import { TrustTimeline } from "@/components/TrustTimeline";
import { FraudCluster } from "@/components/FraudCluster";
import { WhyThisScore } from "@/components/WhyThisScore";
import { DetailModal, ExpandablePanel } from "@/components/DetailModal";
import { fetchTrustData } from "@/lib/api";
import { io } from "socket.io-client";
import { ChevronDown, RefreshCw, AlertTriangle, User, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PanelId = "trust-score" | "risk-radar" | "why-score" | "trust-timeline" | "fraud-cluster" | null;

const panelTitles: Record<string, string> = {
    "trust-score": "Trust Score — Deep Analysis",
    "risk-radar": "Risk Profile Radar — Threat Vectors",
    "why-score": "Score Explainability — Factor Breakdown",
    "trust-timeline": "Historical Trust Vector — Stability Curve",
    "fraud-cluster": "Graph Intelligence — Fraud Cluster Analysis",
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [sellers, setSellers] = useState<any[]>([]);
    const [sellerId, setSellerId] = useState<string>("");
    const [expandedPanel, setExpandedPanel] = useState<PanelId>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
                setSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch sellers on mount
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

    const loadData = async (targetId?: string) => {
        const idToLoad = targetId || sellerId;
        if (!idToLoad) return;
        setLoading(true);

        try {
            const result = await fetchTrustData(idToLoad);
            if (result) {
                const sellerName = sellers.find(s => s.id === idToLoad)?.name || result.seller?.name || "Unknown Seller";
                const uiData = {
                    sellerId: idToLoad,
                    sellerName: sellerName,
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

    // Load data whenever sellerId changes
    useEffect(() => {
        if (sellerId) {
            loadData(sellerId);
        }
    }, [sellerId]);

    // WebSocket connection
    useEffect(() => {
        const socket = io("http://localhost:5000");

        socket.on("connect", () => {
            console.log("Connected to WebSocket");
        });

        socket.on("trust_update", (update: any) => {
            if (update.sellerId === sellerId) {
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
    }, [sellerId]);

    // Handle seller selection
    const handleSelectSeller = (id: string) => {
        setSellerId(id);
        setDropdownOpen(false);
        setSearchQuery("");
    };

    // Filter sellers by search
    const filteredSellers = sellers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get selected seller info
    const selectedSeller = sellers.find(s => s.id === sellerId);

    /* Render the content for a specific panel */
    const renderPanelContent = (panelId: string) => {
        switch (panelId) {
            case "trust-score":
                return <TrustScoreCard score={data?.trustScore || 0} loading={loading} />;
            case "risk-radar":
                return <RiskRadar data={data?.radarData || []} />;
            case "why-score":
                return <WhyThisScore factors={data?.factors || []} />;
            case "trust-timeline":
                return <TrustTimeline data={data?.timeline || []} />;
            case "fraud-cluster":
                return <FraudCluster />;
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen text-slate-200 p-6 md:p-10 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row justify-between items-center gap-6 glass-panel p-6 rounded-2xl relative z-10">
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
                        {/* Seller Dropdown — Click-based */}
                        <div className="relative z-50" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className={`flex items-center gap-3 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-sm font-medium rounded-xl border w-72 justify-between transition-all shadow-lg backdrop-blur-sm ${dropdownOpen ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-slate-700/50'}`}
                            >
                                <span className="truncate">{selectedSeller?.name || "Select Seller Account"}</span>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full mt-2 w-72 bg-slate-900/98 border border-slate-700/50 rounded-xl shadow-2xl z-50 backdrop-blur-xl overflow-hidden"
                                    >
                                        {/* Search Box */}
                                        <div className="p-2 border-b border-slate-800">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-lg">
                                                <Search size={14} className="text-slate-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Search sellers..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none w-full"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        {/* Seller List — Proper Scrollable */}
                                        <div className="max-h-64 overflow-y-auto overscroll-contain" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                                            {filteredSellers.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-sm text-slate-500">No sellers found</div>
                                            ) : (
                                                filteredSellers.map((s) => (
                                                    <div
                                                        key={s.id}
                                                        onClick={() => handleSelectSeller(s.id)}
                                                        className={`px-4 py-3 cursor-pointer text-sm border-b border-white/5 last:border-0 transition-colors ${s.id === sellerId
                                                            ? 'bg-blue-500/10 border-l-2 border-l-blue-500'
                                                            : 'hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <div className="font-medium text-slate-200 truncate">{s.name}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">
                                                            Baseline: {Math.round(s.baseline_trust_score)}
                                                            {s.id === sellerId && <span className="ml-2 text-blue-400">● Selected</span>}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => loadData()}
                            className="p-2.5 bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 rounded-xl border border-slate-700/50 transition-all active:scale-95"
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>

                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-800 shadow-lg"></div>
                    </div>
                )}
            </header>

            {/* Selected Seller Banner */}
            {data && !error && (
                <div
                    className="mb-6 glass-panel px-6 py-4 rounded-2xl flex items-center justify-between relative z-[5]"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                            <User size={22} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">Analyzing Seller</p>
                            <h2 className="text-xl font-bold text-slate-100">{data.sellerName}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xs text-slate-500">Trust Score</p>
                            <p className={`text-2xl font-bold font-mono ${data.trustScore >= 750 ? 'text-emerald-400' : data.trustScore >= 500 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {Math.round(data.trustScore)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">Risk Level</p>
                            <p className={`text-sm font-bold ${data.trustScore >= 750 ? 'text-emerald-400' : data.trustScore >= 500 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {data.trustScore >= 750 ? '● LOW' : data.trustScore >= 500 ? '● MEDIUM' : '● HIGH'}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider border ${data.trustScore >= 750
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : data.trustScore >= 500
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}>
                            {data.trustScore >= 750 ? 'TRUSTED' : data.trustScore >= 500 ? 'MONITOR' : 'FLAGGED'}
                        </div>
                    </div>
                </div>
            )}

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
                <div
                    className="grid grid-cols-12 gap-6"
                >
                    {/* Top Row */}
                    <div className="col-span-12 lg:col-span-4 h-full">
                        <ExpandablePanel onClick={() => setExpandedPanel("trust-score")}>
                            <div className="h-full glass-card-hover rounded-2xl"><TrustScoreCard score={data?.trustScore || 0} loading={loading} /></div>
                        </ExpandablePanel>
                    </div>
                    <div className="col-span-12 lg:col-span-4 h-full">
                        <ExpandablePanel onClick={() => setExpandedPanel("risk-radar")}>
                            <div className="h-full glass-panel p-4 rounded-2xl glass-card-hover"><RiskRadar data={data?.radarData || []} /></div>
                        </ExpandablePanel>
                    </div>
                    <div className="col-span-12 lg:col-span-4 h-full">
                        <ExpandablePanel onClick={() => setExpandedPanel("why-score")}>
                            <div className="h-full glass-panel p-4 rounded-2xl glass-card-hover"><WhyThisScore factors={data?.factors || []} /></div>
                        </ExpandablePanel>
                    </div>

                    {/* Middle Row */}
                    <div className="col-span-12 lg:col-span-8">
                        <ExpandablePanel onClick={() => setExpandedPanel("trust-timeline")}>
                            <div className="glass-panel p-6 rounded-2xl glass-card-hover min-h-[400px]">
                                <h3 className="text-lg font-medium text-slate-300 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                    Historical Trust Vector
                                </h3>
                                <TrustTimeline data={data?.timeline || []} />
                            </div>
                        </ExpandablePanel>
                    </div>
                    <div className="col-span-12 lg:col-span-4">
                        <ExpandablePanel onClick={() => setExpandedPanel("fraud-cluster")}>
                            <div className="glass-panel p-6 rounded-2xl glass-card-hover h-full">
                                <h3 className="text-lg font-medium text-slate-300 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                    Graph Intelligence
                                </h3>
                                <FraudCluster />
                            </div>
                        </ExpandablePanel>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            <DetailModal
                isOpen={expandedPanel !== null}
                onClose={() => setExpandedPanel(null)}
                title={expandedPanel ? panelTitles[expandedPanel] : ""}
                panelId={expandedPanel || "trust-score"}
                analysisData={data}
            >
                {expandedPanel && renderPanelContent(expandedPanel)}
            </DetailModal>
        </main>
    );
}
