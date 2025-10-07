export interface FilterResponse {
  zips?: string[];
  counties?: string[];
  states?: string[];
}

export interface Campaign {
  campaignId: number;
  campaignName: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
}