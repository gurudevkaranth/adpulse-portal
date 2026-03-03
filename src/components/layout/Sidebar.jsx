import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Switch } from '@headlessui/react';
import {
  LayoutDashboard, BarChart3, TrendingUp, ShoppingCart,
  Grid3x3, Trophy, GitCompareArrows, Bot,
  ChevronLeft, ChevronRight, ChevronDown, Zap,
  Star, HelpCircle, Settings,
  Activity, Layers, Filter, Globe, Target, HeartPulse, Brain,
  FileText, Image,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Home' },
    ],
  },
  {
    label: 'Analyze', icon: BarChart3,
    items: [
      {
        to: '/analyze/acquisition', icon: TrendingUp, label: 'Acquisition',
        children: [
          { to: '/analyze/acquisition', icon: Globe, label: 'Channels', tab: 'channels' },
          { to: '/analyze/acquisition', icon: Target, label: 'Campaigns', tab: 'campaigns' },
          { to: '/analyze/acquisition', icon: Layers, label: 'Ad Sets', tab: 'adSets' },
          { to: '/analyze/acquisition', icon: Image, label: 'Creatives', tab: 'creatives' },
          { to: '/analyze/acquisition', icon: FileText, label: 'Landing Pages', tab: 'landingPages' },
        ],
      },
      { to: '/analyze/conversion', icon: ShoppingCart, label: 'Conversion' },
    ],
  },
  {
    label: 'Creative Intel', icon: Brain,
    items: [
      { to: '/analyze/acquisition', icon: Grid3x3, label: 'Creative Library', tab: 'creatives' },
      { to: '/analyze/acquisition', icon: Trophy, label: 'Top Performers', tab: 'topPerformers' },
      { to: '/analyze/acquisition', icon: GitCompareArrows, label: 'Comparative', tab: 'comparative' },
      { to: '/copilot', icon: Bot, label: 'AI Copilot' },
    ],
  },
];

const BOTTOM_LINKS = [
  { icon: Star, label: 'North Star' },
  { icon: HelpCircle, label: 'Support' },
  { icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState({ 'Analyze': true, 'Creative Intel': true, 'Acquisition': true });
  const [demoMode, setDemoMode] = useState(false);

  const toggleGroup = (label) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isGroupActive = (group) => {
    return group.items.some(item => {
      if (item.to === '/') return location.pathname === '/';
      if (item.children) return item.children.some(c => isItemActive(c));
      if (item.tab) {
        const params = new URLSearchParams(location.search);
        return location.pathname === item.to && params.get('tab') === item.tab;
      }
      return location.pathname.startsWith(item.to);
    });
  };

  const isItemActive = (item) => {
    if (item.to === '/') return location.pathname === '/';
    if (item.tab) {
      const params = new URLSearchParams(location.search);
      return location.pathname === item.to && params.get('tab') === item.tab;
    }
    // For parent items with children, active if any child is active
    if (item.children) return item.children.some(c => isItemActive(c));
    return location.pathname.startsWith(item.to);
  };

  const handleNavClick = (e, item) => {
    if (item.tab) {
      e.preventDefault();
      navigate(`${item.to}?tab=${item.tab}`);
    }
    // For parent items with children, toggle expansion instead of navigating
    if (item.children) {
      e.preventDefault();
      setExpandedGroups(prev => ({ ...prev, [item.label]: !prev[item.label] }));
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-border z-30 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg text-text-primary tracking-tight">AdPulse</span>
        )}
      </div>

      {/* Tenant Selector */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-lg bg-surface-tertiary border border-border-light cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate">TheBeardStruggle</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded font-medium">US</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
          </div>
        </div>
      )}
      {collapsed && (
        <div className="mx-auto mt-3 mb-1 w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
          T
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {/* Group header (if labeled) */}
            {group.label && (
              <>
                {gi > 0 && <div className="h-px bg-border-light my-2" />}
                <button
                  onClick={() => !collapsed && toggleGroup(group.label)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded-lg ${
                    isGroupActive(group) ? 'text-primary-600' : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  {group.icon && <group.icon className="w-4 h-4 shrink-0" />}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedGroups[group.label] ? '' : '-rotate-90'}`} />
                    </>
                  )}
                </button>
              </>
            )}

            {/* Group items */}
            <div className={`space-y-0.5 ${
              group.label && !collapsed
                ? `overflow-hidden transition-all duration-200 ${expandedGroups[group.label] ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`
                : ''
            }`}>
              {group.items.map((item, idx) => (
                <div key={`${item.to}-${item.tab || idx}`}>
                  <NavLink
                    to={item.tab ? `${item.to}?tab=${item.tab}` : item.to}
                    end={item.to === '/' && !item.tab}
                    onClick={(e) => handleNavClick(e, item)}
                    className={() =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        group.label && !collapsed ? 'ml-2' : ''
                      } ${
                        isItemActive(item)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                      }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.children && (
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedGroups[item.label] ? '' : '-rotate-90'}`} />
                        )}
                      </>
                    )}
                  </NavLink>

                  {/* Expandable children (e.g., Acquisition sub-pages) */}
                  {item.children && !collapsed && (
                    <div className={`space-y-0.5 overflow-hidden transition-all duration-200 ${
                      expandedGroups[item.label] ? 'max-h-96 opacity-100 mt-0.5' : 'max-h-0 opacity-0'
                    }`}>
                      {item.children.map((child) => (
                        <NavLink
                          key={`${child.to}-${child.tab}`}
                          to={`${child.to}?tab=${child.tab}`}
                          onClick={(e) => handleNavClick(e, child)}
                          className={() =>
                            `flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ml-6 ${
                              isItemActive(child)
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-text-tertiary hover:bg-gray-50 hover:text-text-secondary'
                            }`
                          }
                        >
                          <child.icon className="w-[15px] h-[15px] shrink-0" />
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border px-3 py-2 space-y-0.5 shrink-0">
        {/* Demo Mode */}
        {!collapsed && (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-text-secondary">Demo Mode</span>
            <Switch
              checked={demoMode}
              onChange={setDemoMode}
              className={`${demoMode ? 'bg-primary-600' : 'bg-gray-200'} relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
            >
              <span className={`${demoMode ? 'translate-x-[18px]' : 'translate-x-[2px]'} inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm`} />
            </Switch>
          </div>
        )}

        {/* Links */}
        {BOTTOM_LINKS.map(item => (
          <button
            key={item.label}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors"
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}

        {/* User Profile */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1 border-t border-border-light pt-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            GK
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-text-primary truncate">Gurudev Karanth</div>
              <div className="text-[10px] text-text-tertiary truncate">gurudev@outoftheblue.ai</div>
            </div>
          )}
          {!collapsed && <ChevronDown className="w-3 h-3 text-text-tertiary shrink-0" />}
        </div>
      </div>
    </aside>
  );
}
