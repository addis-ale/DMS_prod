"use client";

import { RefreshCw, Rocket, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ErrorState() {
  const router = useRouter();
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = () => {
    setIsRotating(true);
    setTimeout(() => router.refresh(), 500);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Projects
        </h1>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 shadow-xl border border-slate-700 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
            <Rocket className="h-20 w-20 text-purple-400 relative z-10" />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white">
              Houston, we have a problem!
            </h2>
            <p className="text-slate-300">
              We couldn&apos;t reach the mothership to fetch your projects.
            </p>

            <div className="flex items-center justify-center mt-2 text-red-300">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>Connection failed</span>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="group relative px-6 py-3 overflow-hidden rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium shadow-lg transition-all duration-300 hover:shadow-purple-500/25 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="flex items-center">
              <RefreshCw
                className={`mr-2 h-5 w-5 ${isRotating ? "animate-spin" : ""}`}
              />
              <span>Launch Retry Sequence</span>
            </div>
          </button>

          <div className="text-xs text-slate-400 animate-pulse">
            Attempting to establish connection...
          </div>
        </div>
      </div>

      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl">
        <div
          className="absolute top-20 left-20 w-2 h-2 rounded-full bg-white opacity-70 animate-ping"
          style={{ animationDuration: "3s", animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-40 right-40 w-1 h-1 rounded-full bg-purple-300 opacity-70 animate-ping"
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-70 animate-ping"
          style={{ animationDuration: "5s", animationDelay: "1.5s" }}
        ></div>
      </div>
    </div>
  );
}
