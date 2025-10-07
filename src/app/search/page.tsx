"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Sidebar from "@/components/Layout/Sidebar/Sidebar";
import MainPanel from "@/components/Layout/Dashboard/MainPanel/MainPanel";
import FloatingChatWidget from "@/components/chat/FloatingChatWidget";
import Filters from "@/components/search/Filters";
import CampaignReport from "@/components/search/CampaignReport";
import { useEffect, useState } from "react";
import { SEARCH_API } from "@/utils/apiUrl";
import { Campaign, CampaignsResponse, FilterResponse } from "@/types/search";
import axiosWrapper from "@/utils/api";

const NEXT_PUBLIC_CSV_API_TOKEN = process.env.NEXT_PUBLIC_CSV_API_TOKEN;

export default function Search() {
  const { collapsed } = useSelector((state: RootState) => state.theme);
  const [view, setView] = useState<"filters" | "report">("filters");
  const [loadingState, setLoadingState] = useState<boolean>(true);
  const [states, setStates] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingState(true);
        const res = (await axiosWrapper(
          "get",
          SEARCH_API.FILTER_STATES,
          undefined,
          NEXT_PUBLIC_CSV_API_TOKEN
        )) as FilterResponse;
        setStates(res.states || []);
      } catch (err) {
        console.error("Error fetching states:", err);
      } finally {
        setLoadingState(false);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoadingCampaigns(true);

        const res = (await axiosWrapper(
          "get",
          SEARCH_API.SEARCH_CAMPAIGNS,
          undefined,
          NEXT_PUBLIC_CSV_API_TOKEN
        )) as CampaignsResponse;

        setCampaigns(res.campaigns || []);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoadingCampaigns(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="layout_admin flex">
      <Sidebar />
      <div
        className={`relative transition-all duration-300 z-9 w-full 
          ${collapsed ? "lg:ml-[6%] lg:w-[94%]" : "lg:ml-[17%] lg:w-[83%]"}`}
      >
        <MainPanel />

        {/* Main Content with Toggle Button */}
        <main className="bg-gray-100 w-full min-h-[calc(100vh-97px)] px-6 py-6">
          <div className="relative max-w-7xl mx-auto">
            {/* Toggle Button - Top Right */}
            <div className="absolute top-0 left-0 z-10">
              <div className="inline-flex items-center bg-white rounded-full shadow-lg border border-gray-200 p-1">
                <button
                  onClick={() => setView("filters")}
                  className={`relative px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out ${
                    view === "filters"
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Filters
                </button>
                <button
                  onClick={() => setView("report")}
                  className={`relative px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out ${
                    view === "report"
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Campaign Report
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex items-center justify-center min-h-[calc(100vh-145px)]">
              {view === "filters" ? (
                <Filters states={states} loadingState={loadingState} />
              ) : (
                <CampaignReport
                  campaigns={campaigns}
                  loadingCampaigns={loadingCampaigns}
                />
              )}
            </div>
          </div>
        </main>

        <FloatingChatWidget />
      </div>
    </div>
  );
}
