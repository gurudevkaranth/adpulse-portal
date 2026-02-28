import { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, TrendingUp, BarChart3, Target,
  Lightbulb, ArrowRight, Loader2,
} from 'lucide-react';
import { generateCopilotSuggestions, generateAds } from '../data/mockData';
import { formatCurrency, formatRoas, formatPercent } from '../utils/formatters';
import ScoreRing from '../components/shared/ScoreRing';

// Simulated AI responses
function generateAIResponse(query, ads) {
  const q = query.toLowerCase();

  if (q.includes('scaling') || q.includes('scale')) {
    const scalingAds = ads.filter(a => a.status === 'Scaling').slice(0, 5);
    return {
      text: `I found ${scalingAds.length} creatives that are currently scaling with increasing spend week-over-week.`,
      data: scalingAds,
      type: 'ad_list',
      insights: [
        'UGC-style creatives are dominating the scaling category',
        'Problem-Solution hooks have the highest scaling rate (65%)',
        'Meta is the primary platform for scaling creatives',
      ],
    };
  }

  if (q.includes('hook') || q.includes('cpa') || q.includes('lowest')) {
    const sortedByHook = [...ads].sort((a, b) => b.scores.hookScore - a.scores.hookScore).slice(0, 5);
    return {
      text: `Here are the top-performing hooks by CPA efficiency. Problem-Solution and Social Proof hooks consistently deliver the lowest acquisition costs.`,
      data: sortedByHook,
      type: 'ad_list',
      insights: [
        'Problem-Solution hooks drive 23% lower CPA than average',
        'Testimonial-based hooks have the highest engagement but moderate conversion',
        'Curiosity hooks work best on TikTok but underperform on Meta',
      ],
    };
  }

  if (q.includes('ugc') || q.includes('polished') || q.includes('compare') || q.includes('format')) {
    const ugcAds = ads.filter(a => a.format === 'UGC');
    const videoAds = ads.filter(a => a.format === 'Video');
    const avgUGCRoas = ugcAds.reduce((s, a) => s + a.metrics.roas, 0) / Math.max(ugcAds.length, 1);
    const avgVideoRoas = videoAds.reduce((s, a) => s + a.metrics.roas, 0) / Math.max(videoAds.length, 1);
    return {
      text: `UGC creatives show a ${formatRoas(avgUGCRoas)} average ROAS compared to ${formatRoas(avgVideoRoas)} for polished videos. UGC has a significant edge in hook rates and engagement metrics.`,
      type: 'comparison',
      comparison: {
        items: [
          { label: 'UGC', roas: avgUGCRoas, count: ugcAds.length, avgScore: Math.round(ugcAds.reduce((s, a) => s + a.overallScore, 0) / Math.max(ugcAds.length, 1)) },
          { label: 'Polished Video', roas: avgVideoRoas, count: videoAds.length, avgScore: Math.round(videoAds.reduce((s, a) => s + a.overallScore, 0) / Math.max(videoAds.length, 1)) },
        ],
      },
      insights: [
        'UGC outperforms polished video on thumbstop rate by 34%',
        'Polished videos have higher watch completion rates',
        'Consider allocating more budget toward UGC for top-of-funnel',
      ],
    };
  }

  if (q.includes('declining') || q.includes('roas')) {
    const declining = ads.filter(a => a.status === 'Declining').slice(0, 5);
    return {
      text: `There are ${declining.length} creatives showing declining ROAS. These may be experiencing creative fatigue and should be reviewed for potential pausing or refreshing.`,
      data: declining,
      type: 'ad_list',
      insights: [
        'Average creative lifespan before fatigue is 14-21 days',
        'Consider creating 3-5 new variations of your top performers',
        'Declining creatives still have positive ROAS - monitor before pausing',
      ],
    };
  }

  if (q.includes('fatigue')) {
    return {
      text: `Based on performance patterns, 4 creatives are showing early fatigue signals: declining CTR with stable impressions. This typically indicates the audience has seen the ad too many times.`,
      type: 'text',
      insights: [
        'Refresh ad copy while keeping successful visual elements',
        'Test new hooks on the same landing pages',
        'Expand audience targeting to reach fresh users',
        'Consider frequency capping at 3x per 7 days',
      ],
    };
  }

  if (q.includes('platform') || q.includes('best')) {
    return {
      text: `Across your active campaigns, TikTok delivers the highest ROAS at 3.25x, followed by Meta at 2.84x. However, Meta has 2x the volume and more consistent performance.`,
      type: 'text',
      insights: [
        'TikTok excels for awareness and engagement metrics',
        'Meta provides more stable conversion performance',
        'Consider testing YouTube for long-form content repurposing',
      ],
    };
  }

  // Default
  const topAds = [...ads].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);
  return {
    text: `Here are your top 5 performing creatives based on overall score. These creatives demonstrate strong performance across hook, engagement, and conversion metrics.`,
    data: topAds,
    type: 'ad_list',
    insights: [
      'Your top creatives share common elements: strong opening hooks and clear CTAs',
      'Consider creating variations of these winning creatives',
      'Test these creative approaches on underperforming ad sets',
    ],
  };
}

export default function AICopilot() {
  const suggestions = generateCopilotSuggestions();
  const ads = generateAds(30);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const query = text || input;
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const response = generateAIResponse(query, ads);
    const aiMessage = { role: 'assistant', ...response };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-text-primary">AI Copilot</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Ask questions about your ad performance and get AI-powered insights
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white rounded-xl border border-border overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-1">Ad Insights Copilot</h2>
              <p className="text-sm text-text-secondary mb-6 text-center max-w-md">
                Ask me anything about your ad creative performance. I can analyze trends,
                compare formats, identify winners, and suggest optimizations.
              </p>

              {/* Suggestion chips */}
              <div className="grid grid-cols-2 gap-3 max-w-lg">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 rounded-xl text-sm text-text-secondary text-left transition-colors group"
                  >
                    <Sparkles className="w-4 h-4 text-text-tertiary group-hover:text-primary-500 shrink-0" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="bg-primary-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-md text-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="text-sm text-text-primary leading-relaxed">{msg.text}</div>

                        {/* Ad list */}
                        {msg.type === 'ad_list' && msg.data && (
                          <div className="space-y-2">
                            {msg.data.map((ad) => (
                              <div key={ad.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-lg shrink-0" style={{ background: ad.thumbnail }} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-text-primary truncate">{ad.name}</div>
                                  <div className="text-[11px] text-text-tertiary">{ad.platform} &middot; {ad.format}</div>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                  <div className="text-center">
                                    <div className="text-text-tertiary">ROAS</div>
                                    <div className="font-semibold">{formatRoas(ad.metrics.roas)}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-text-tertiary">CTR</div>
                                    <div className="font-semibold">{formatPercent(ad.metrics.ctr)}</div>
                                  </div>
                                  <ScoreRing score={ad.overallScore} size={32} strokeWidth={3} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comparison */}
                        {msg.type === 'comparison' && msg.comparison && (
                          <div className="grid grid-cols-2 gap-3">
                            {msg.comparison.items.map((item) => (
                              <div key={item.label} className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-sm font-semibold text-text-primary mb-2">{item.label}</div>
                                <div className="space-y-1.5 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-text-tertiary">ROAS</span>
                                    <span className="font-medium">{formatRoas(item.roas)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-text-tertiary">Creatives</span>
                                    <span className="font-medium">{item.count}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-text-tertiary">Avg Score</span>
                                    <ScoreRing score={item.avgScore} size={28} strokeWidth={2} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Insights */}
                        {msg.insights && (
                          <div className="bg-primary-50/50 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 mb-2">
                              <Lightbulb className="w-3.5 h-3.5" />
                              Key Insights
                            </div>
                            <ul className="space-y-1.5">
                              {msg.insights.map((insight, j) => (
                                <li key={j} className="flex items-start gap-2 text-xs text-text-secondary">
                                  <ArrowRight className="w-3 h-3 text-primary-500 mt-0.5 shrink-0" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing your data...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border p-4">
          {messages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {suggestions.slice(0, 4).map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 rounded-full text-xs text-text-secondary whitespace-nowrap transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Ask about your ad performance..."
              className="flex-1 px-4 py-3 bg-surface-tertiary rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder:text-text-tertiary"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
