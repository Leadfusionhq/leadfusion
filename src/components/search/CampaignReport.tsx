"use client";

import { useState } from "react";
import axiosWrapper from "@/utils/api";
import { SEARCH_API } from "@/utils/apiUrl";
import { useLoader } from "@/context/LoaderContext";
import { Campaign } from "@/types/search";

const NEXT_PUBLIC_CSV_API_TOKEN = process.env.NEXT_PUBLIC_CSV_API_TOKEN;

interface CampaignReportData {
  campaignId: number;
  campaignName: string;
  totalContacts: number;
  confirmedAddresses: number;
  replied: number;
  failedMessages: number;
}

interface CampaignReportResponse {
  report: CampaignReportData;
}

export default function CampaignReport({
  campaigns,
  loadingCampaigns,
}: {
  campaigns: Campaign[];
  loadingCampaigns: boolean;
}) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | "">("");
  const [report, setReport] = useState<CampaignReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const { showLoader, hideLoader } = useLoader();

  const handleCampaignSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = Number(e.target.value);
    setSelectedCampaignId(id);
    setReport(null);

    if (!id) return;

    try {
      setLoadingReport(true);
      showLoader();

      const res = (await axiosWrapper(
        "get",
        SEARCH_API.SEARCH_CAMPAIGN_REPORTS.replace(":id", String(id)),
        undefined,
        NEXT_PUBLIC_CSV_API_TOKEN
      )) as CampaignReportResponse;

      setReport(res.report);
    } catch (err) {
      console.error("Error fetching campaign report:", err);
    } finally {
      hideLoader();
      setLoadingReport(false);
    }
  };

  return (
    <div className="layout_admin flex flex-col gap-6 p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800">Campaign Report</h2>

      {/* Campaign Dropdown */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Campaign
        </label>

        <select
          value={selectedCampaignId}
          onChange={handleCampaignSelect}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={loadingCampaigns}
        >
          {loadingCampaigns ? (
            <option value="">Loading campaigns...</option>
          ) : (
            <>
              <option value="">Select Campaign</option>
              {campaigns.map((c) => (
                <option key={c.campaignId} value={c.campaignId}>
                  {c.campaignName}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      {/* Campaign Report */}
      {loadingReport && (
        <p className="text-gray-500 text-center">Loading report...</p>
      )}

      {report && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
          <ul className="text-gray-700 space-y-2">
            <li>
              <strong>Total Contacts:</strong>{" "}
              {report.totalContacts.toLocaleString()}
            </li>
            <li>
              <strong>Confirmed Addresses:</strong>{" "}
              {report.confirmedAddresses.toLocaleString()}
            </li>
            <li>
              <strong>Replied:</strong> {report.replied.toLocaleString()}
            </li>
            <li>
              <strong>Failed Messages:</strong>{" "}
              {report.failedMessages.toLocaleString()}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
