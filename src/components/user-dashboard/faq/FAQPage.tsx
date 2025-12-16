"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Search, HelpCircle } from "lucide-react";
import axiosWrapper from "@/utils/api";
import { FAQ_API } from "@/utils/apiUrl";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// Types
interface FAQ {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FAQResponse {
  message?: string;
  faqs?: FAQ[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

const FAQPage: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [leftColumnFaqs, setLeftColumnFaqs] = useState<FAQ[]>([]);
  const [rightColumnFaqs, setRightColumnFaqs] = useState<FAQ[]>([]);

  // Fetch FAQs - use public endpoint
  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        isActive: "true",
        limit: "100"
      });

      const response = (await axiosWrapper(
        "get",
        `${FAQ_API.GET_PUBLIC_FAQS}?${params.toString()}`,
        {},
        token || undefined
      )) as FAQResponse;

      if (response.faqs) {
        setFaqs(response.faqs);
        setFilteredFaqs(response.faqs);
      } else {
        throw new Error(response.message || 'Failed to fetch FAQs');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // Search logic
  useEffect(() => {
    const filtered = faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFaqs(filtered);
  }, [searchQuery, faqs]);

  // Split FAQs for masonry layout
  useEffect(() => {
    const midpoint = Math.ceil(filteredFaqs.length / 2);
    setLeftColumnFaqs(filteredFaqs.slice(0, midpoint));
    setRightColumnFaqs(filteredFaqs.slice(midpoint));
  }, [filteredFaqs]);

  const toggleExpanded = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const FAQItem: React.FC<{ faq: FAQ }> = ({ faq }) => {
    const isExpanded = expandedFAQ === faq._id;

    return (
      <div
        className={`mb-4 rounded-xl border transition-all duration-300 overflow-hidden group
          ${isExpanded
            ? 'bg-white border-black shadow-md ring-1 ring-black/5'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
      >
        <button
          onClick={() => toggleExpanded(faq._id)}
          className="w-full px-6 py-5 text-left flex items-start justify-between focus:outline-none"
        >
          <span className={`text-base font-medium pr-8 transition-colors duration-200
            ${isExpanded ? 'text-black' : 'text-gray-900 group-hover:text-black'}`
          }>
            {faq.question}
          </span>
          <div className={`flex-shrink-0 mt-1 p-1 rounded-full transition-colors duration-200
            ${isExpanded ? 'bg-gray-100 text-black' : 'text-gray-400 group-hover:bg-gray-100 group-hover:text-black'}`
          }>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden
            ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`
          }
        >
          <div className="px-6 pb-6 pt-0">
            <p className="text-gray-600 leading-relaxed text-[15px]">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={fetchFAQs}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-gray-100 rounded-full mb-6">
            <HelpCircle className="w-5 h-5 text-black mr-2" />
            <span className="text-sm font-medium text-black">Help Center</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Search for answers to common questions about managing your leads, account settings, and more.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-0 text-gray-900 rounded-xl ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-base transition-all duration-200"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matching results</h3>
            <p className="text-gray-500">
              We couldn't find any FAQs matching "{searchQuery}". Try different keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column */}
            <div className="space-y-4">
              {leftColumnFaqs.map((faq) => (
                <FAQItem key={faq._id} faq={faq} />
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {rightColumnFaqs.map((faq) => (
                <FAQItem key={faq._id} faq={faq} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            © 2025 Lead Fusion. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;