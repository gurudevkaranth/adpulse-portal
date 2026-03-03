import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  generateAds, generateHierarchicalData, generateLandingPageData,
  generateChannelChartData,
} from '../data/mockData';

import ChannelsTab from '../components/acquisition/ChannelsTab';
import CreativesTab from '../components/acquisition/CreativesTab';
import CampaignsTab from '../components/acquisition/CampaignsTab';
import AdSetsTab from '../components/acquisition/AdSetsTab';
import LandingPagesTab from '../components/acquisition/LandingPagesTab';
import TopPerformersTab from '../components/acquisition/TopPerformersTab';
import ComparativeTab from '../components/acquisition/ComparativeTab';

export default function AcquisitionPage() {
  const { filters, setFilters, activeSubTab } = useOutletContext();

  // Single shared data source
  const ads = useMemo(() => generateAds(30), []);
  const campaigns = useMemo(() => generateHierarchicalData(ads), [ads]);
  const landingPages = useMemo(() => generateLandingPageData(ads), [ads]);
  const channelChart = useMemo(() => generateChannelChartData(7), []);

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
