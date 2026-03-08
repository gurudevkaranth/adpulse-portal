import { ShoppingCart } from 'lucide-react';

export default function ConversionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Conversion Analysis</h1>
        <p className="text-sm text-text-secondary mt-0.5">Conversion funnel performance across all creatives</p>
      </div>
      <div className="bg-white rounded-xl border border-border p-12 text-center">
        <ShoppingCart className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">Coming Soon</h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Conversion analysis with funnel visualization, drop-off analysis, and optimization recommendations.
        </p>
      </div>
    </div>
  );
}
