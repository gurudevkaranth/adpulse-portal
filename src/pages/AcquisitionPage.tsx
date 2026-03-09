import { useOutletContext } from 'react-router-dom';
import { useAdsWithScores } from '../hooks/useAds';
import { useChannels } from '../hooks/useChannels';
import { useCampaigns } from '../hooks/useCampaigns';
import { useLandingPages } from '../hooks/useLandingPages';

import ChannelsTab from '../components/acquisition/ChannelsTab';
import CreativesTab from '../components/acquisition/CreativesTab';
import CampaignsTab from '../components/acquisition/CampaignsTab';
import AdSetsTab from '../components/acquisition/AdSetsTab';
import LandingPagesTab from '../components/acquisition/LandingPagesTab';
import TopPerformersTab from '../components/acquisition/TopPerformersTab';
import ComparativeTab from '../components/acquisition/ComparativeTab';

export default function AcquisitionPage() {
  const { filters, setFilters, activeSubTab } = useOutletContext();

  const ads = useAdsWithScores(filters);
  const channels = useChannels(filters);
  const campaigns = useCampaigns(filters);
  const landingPages = useLandingPages(filters);

  const renderSubTab = () => {
    switch (activeSubTab) {
      case 'channels':
        return <ChannelsTab channelChart={channels.data || { channels: [], data: [] }} filters={filters} onFiltersChange={setFilters} loading={channels.loading} />;
      case 'creatives':
        return <CreativesTab ads={ads.data || []} filters={filters} onFiltersChange={setFilters} loading={ads.loading} />;
      case 'campaigns':
        return <CampaignsTab data={campaigns.data || { campaigns: [] }} filters={filters} onFiltersChange={setFilters} loading={campaigns.loading} />;
      case 'adSets':
        return <AdSetsTab campaigns={campaigns.data || { campaigns: [] }} filters={filters} onFiltersChange={setFilters} loading={campaigns.loading} />;
      case 'landingPages':
        return <LandingPagesTab data={landingPages.data || []} filters={filters} onFiltersChange={setFilters} loading={landingPages.loading} />;
      case 'topPerformers':
        return <TopPerformersTab ads={ads.data || []} loading={ads.loading} />;
      case 'comparative':
        return <ComparativeTab ads={ads.data || []} loading={ads.loading} />;
      default:
        return <ChannelsTab channelChart={channels.data || { channels: [], data: [] }} filters={filters} onFiltersChange={setFilters} loading={channels.loading} />;
    }
  };

  return (
    <div className="space-y-5">
      {renderSubTab()}
    </div>
  );
}
