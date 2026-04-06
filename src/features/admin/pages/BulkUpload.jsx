import { useState, useMemo } from "react";
import Papa from "papaparse";
import { 
    Upload, FileText, CheckCircle2, AlertCircle, 
    ChevronLeft, ChevronRight, Download, Trash2, 
    Database, Loader2, X, Filter
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../../services/api";

const COLLECTIONS = [
    { id: "listing-home", label: "Homes (Homes Collection)", icon: "🏠" },
    { id: "crashpads", label: "Crashpads (crashpads_listings)", icon: "⛺" },
    { id: "travel-buddy", label: "Travel Buddy (travel_buddies)", icon: "🧭" },
];

const PAGE_SIZE = 10;

export default function BulkUpload() {
    const [selectedCollection, setSelectedCollection] = useState(COLLECTIONS[0].id);
    const [csvData, setCsvData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [results, setResults] = useState(null);

    // ─── CSV Parsing ───────────────────────────────────────────────
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setCsvData(results.data);
                setHeaders(results.meta.fields);
                setLoading(false);
                setCurrentPage(1);
                setResults(null);
                toast.success(`Loaded ${results.data.length} rows`);
            },
            error: (err) => {
                toast.error("Error parsing CSV: " + err.message);
                setLoading(false);
            }
        });
    };

    // ─── Validation Logic ──────────────────────────────────────────
    const validation = useMemo(() => {
        return csvData.map((row) => {
            const errors = [];
            
            if (selectedCollection === "listing-home") {
                if (!row.title) errors.push("Title is required");
                if (!row.price || isNaN(parseFloat(row.price))) errors.push("Valid price is required");
                if (!row.location) errors.push("Location is required");
            } else if (selectedCollection === "crashpads") {
                if (!row.name) errors.push("Name is required");
                if (!row.pricePerNight || isNaN(parseFloat(row.pricePerNight))) errors.push("Valid pricePerNight is required");
                if (!row.location) errors.push("Location is required");
            } else if (selectedCollection === "travel-buddy") {
                if (!row.destination) errors.push("Destination is required");
                if (!row.travelDates || !row.travelDates.includes(" to ")) errors.push("Format: YYYY-MM-DD to YYYY-MM-DD");
            }

            return { isValid: errors.length === 0, errors };
        });
    }, [csvData, selectedCollection]);

    const totalValid = validation.filter(v => v.isValid).length;
    const totalInvalid = csvData.length - totalValid;

    // ─── Pagination ────────────────────────────────────────────────
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return csvData.slice(start, start + PAGE_SIZE);
    }, [csvData, currentPage]);

    const totalPages = Math.ceil(csvData.length / PAGE_SIZE);

    // ─── Upload Action ─────────────────────────────────────────────
    const handleBulkUpload = async () => {
        if (totalInvalid > 0) {
            const proceed = window.confirm(`There are ${totalInvalid} invalid rows. They will be skipped. Proceed?`);
            if (!proceed) return;
        }

        const validData = csvData.filter((_, i) => validation[i].isValid);
        if (validData.length === 0) {
            toast.error("No valid rows to upload.");
            return;
        }

        setIsUploading(true);
        try {
            const res = await API.post("/admin/bulk-upload", {
                collectionType: selectedCollection,
                data: validData
            });
            setResults(res.data);
            toast.success("Bulk upload complete!");
        } catch (err) {
            toast.error("Upload failed: " + (err.response?.data?.detail || err.message));
        } finally {
            setIsUploading(false);
        }
    };

    // ─── Error Export ──────────────────────────────────────────────
    const downloadErrors = () => {
        const errorRows = csvData
            .map((row, i) => ({ ...row, bulk_upload_error: validation[i].errors.join(", ") }))
            .filter((_, i) => !validation[i].isValid);
            
        if (results?.errorRows?.length > 0) {
            // Also append server-side errors if available
            results.errorRows.forEach(err => {
                errorRows.push({ ...err.data, bulk_upload_error: err.error });
            });
        }

        const csv = Papa.unparse(errorRows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `bulk_upload_errors_${selectedCollection}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600">
                        <Upload size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Bulk Upload Listings</h2>
                        <p className="text-gray-500 font-medium">Add multiple properties or travel buddies using CSV.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedCollection}
                        onChange={(e) => setSelectedCollection(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-5 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-orange-500/20"
                    >
                        {COLLECTIONS.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>

                    <label className="bg-black hover:bg-gray-800 text-white px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all active:scale-95">
                        <FileText size={18} />
                        Select CSV
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
            </div>

            {/* Results / Stats Dashboard */}
            {(csvData.length > 0 || results) && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard 
                        label="Total Rows" 
                        value={csvData.length} 
                        icon={Database} 
                        color="text-blue-600" 
                        bg="bg-blue-50" 
                    />
                    <StatCard 
                        label="Valid Rows" 
                        value={totalValid} 
                        icon={CheckCircle2} 
                        color="text-green-600" 
                        bg="bg-green-50" 
                    />
                    <StatCard 
                        label="Failed Items" 
                        value={results ? results.failureCount : totalInvalid} 
                        icon={AlertCircle} 
                        color="text-red-600" 
                        bg="bg-red-50" 
                    />
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleBulkUpload}
                            disabled={isUploading || csvData.length === 0}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                            {isUploading ? "Uploading..." : "Start Upload"}
                        </button>
                        {totalInvalid > 0 && (
                            <button
                                onClick={downloadErrors}
                                className="py-3 px-4 border-2 border-red-100 text-red-600 rounded-2xl text-[10px] uppercase font-black tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={14} /> Download Errors
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Preview Table */}
            {csvData.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
                            <Filter size={16} className="text-orange-500" />
                            Data Preview
                        </h3>
                        <button onClick={() => setCsvData([])} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-x-auto relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                <Loader2 className="animate-spin text-orange-500" size={40} />
                            </div>
                        )}
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-[5]">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 w-16">Status</th>
                                    {headers.map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {paginatedData.map((row, i) => {
                                    const actualIndex = (currentPage - 1) * PAGE_SIZE + i;
                                    const v = validation[actualIndex];
                                    return (
                                        <tr key={i} className={`group transition-colors ${v.isValid ? "hover:bg-gray-50/50" : "bg-red-50/30 hover:bg-red-50/50"}`}>
                                            <td className="px-6 py-4">
                                                {v.isValid ? (
                                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                        <CheckCircle2 size={14} />
                                                    </div>
                                                ) : (
                                                    <div className="relative group/err">
                                                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                                            <AlertCircle size={14} />
                                                        </div>
                                                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover/err:block bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-20 shadow-xl">
                                                            {v.errors.join(", ")}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            {headers.map(h => (
                                                <td key={h} className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                                                    {row[h] || "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50">
                        <span className="text-xs font-bold text-gray-500">
                            Showing {((currentPage -1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, csvData.length)} of {csvData.length} rows
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${currentPage === p ? "bg-black text-white" : "hover:bg-white text-gray-500"}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Results Modal */}
            {results && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-2xl animate-scale-in">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 size={48} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Upload Finished</h3>
                        <p className="text-gray-500 font-medium mb-8">Data has been processed successfully.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="bg-green-50 p-6 rounded-2xl">
                                <p className="text-2xl font-black text-green-600">{results.successCount}</p>
                                <p className="text-[10px] font-black uppercase text-green-700/50 tracking-widest mt-1">Succeeded</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-2xl">
                                <p className="text-2xl font-black text-red-600">{results.failureCount}</p>
                                <p className="text-[10px] font-black uppercase text-red-700/50 tracking-widest mt-1">Failed</p>
                            </div>
                        </div>

                        <button
                            onClick={() => { setResults(null); setCsvData([]); }}
                            className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-800 transition-all active:scale-95"
                        >
                            Back to Admin
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-[2rem] shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center`}>
                <Icon size={24} />
            </div>
            <div>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white">{value}</h4>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-0.5">{label}</p>
            </div>
        </div>
    );
}
