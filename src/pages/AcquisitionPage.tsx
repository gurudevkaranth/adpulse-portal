import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  generateAds, generateHierarchicalData, generateLandingPageData,
  generateChannelChartData,
} from '../data/mockData';
import type { Ad, Campaign, LandingPage, ChannelChartData } from '../types';

import ChannelsTab from '../components/acquisition/ChannelsTab';
import CreativesTab from '../components/acquisition/CreativesTab';
import CampaignsTab from '../components/acquisition/CampaignsTab';
import AdSetsTab from '../components/acquisition/AdSetsTab';
import LandingPagesTab from '../components/acquisition/LandingPagesTab';
import TopPerformersTab from '../components/acquisition/TopPerformersTab';
import ComparativeTab from '../components/acquisition/ComparativeTab';

interface OutletContext {
  filters: Record<string, string>;
  setFilters: (filters: Record<string, string>) => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

export default function AcquisitionPage() {
  const { filters, setFilters, activeSubTab } = useOutletContext<OutletContext>();

  // Single shared data source
  const ads = useMemo(() => generateAds(30) as Ad[], []);
  const campaigns = useMemo(() => generateHierarchicalData(ads) as Campaign[], [ads]);
  const landingPages = useMemo(() => generateLandingPageData(ads) as LandingPage[], [ads]);
  const channelChart = useMemo(() => generateChannelChartData(7) as ChannelChartData, []);

  const renderSubTab = () => {
    switch (activeSubTab) {
      case 'channels':
        return <ChannelsTab channelChart={channelChart} filters={filters} onFiltersChange={setFilters} />;
      case 'creatives':
        return <CreativesTab ads={ads} filters={filters} onFiltersChange={setFilters} />;
      case 'campaigns':
        return <CampaignsTab data={campaigns} filters={filters} onFiltersChange={setFilters} />;
      case 'adSets':
        return <AdSetsTab campaigns={campaigns} filters={filters} onFiltersChange={setFilters} />;
      case 'landingPages':
        return <LandingPagesTab data={landingPages} filters={filters} onFiltersChange={setFilters} />;
      case 'topPerformers':
        return <TopPerformersTab ads={ads} />;
      case 'comparative':
        return <ComparativeTab ads={ads} />;
      default:
        return <ChannelsTab channelChart={channelChart} filters={filters} onFiltersChange={setFilters} />;
    }
  };

  return (
    <div className="space-y-5">
      {renderSubTab()}
    </div>
  );
}
