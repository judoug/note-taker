'use client';

import React, { useState, useEffect } from 'react';
import { performance } from '@/lib/performance';
import { Activity, Database, Globe, Monitor, Zap } from 'lucide-react';

interface PerformanceMetrics {
  [key: string]: {
    avg: number;
    max: number;
    count: number;
  };
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isOpen, setIsOpen] = useState(false);

  // Update metrics every 5 seconds
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performance.getSummary());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getMetricIcon = (metricName: string) => {
    if (metricName.includes('api')) return <Globe className="w-4 h-4" />;
    if (metricName.includes('db')) return <Database className="w-4 h-4" />;
    if (metricName.includes('component')) return <Monitor className="w-4 h-4" />;
    if (metricName.includes('LCP') || metricName.includes('FID') || metricName.includes('CLS')) {
      return <Zap className="w-4 h-4" />;
    }
    return <Activity className="w-4 h-4" />;
  };

  const getMetricColor = (metricName: string, value: number) => {
    // Performance thresholds
    if (metricName === 'LCP' && value > 2500) return 'text-red-600';
    if (metricName === 'FID' && value > 100) return 'text-red-600';
    if (metricName === 'CLS' && value > 0.1) return 'text-red-600';
    if (metricName.includes('api_call') && value > 1000) return 'text-red-600';
    if (metricName.includes('db_query') && value > 100) return 'text-red-600';
    if (metricName.includes('component_render') && value > 16) return 'text-red-600';
    
    // Warning thresholds
    if (metricName === 'LCP' && value > 1000) return 'text-yellow-600';
    if (metricName === 'FID' && value > 50) return 'text-yellow-600';
    if (metricName.includes('api_call') && value > 500) return 'text-yellow-600';
    if (metricName.includes('db_query') && value > 50) return 'text-yellow-600';
    
    return 'text-green-600';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Performance Dashboard"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Dashboard Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Performance Metrics
            </h3>
            <p className="text-sm text-gray-600">Real-time performance monitoring</p>
          </div>

          <div className="p-4 space-y-4">
            {Object.keys(metrics).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No performance data available yet.
                <br />
                Interact with the app to see metrics.
              </p>
            ) : (
              Object.entries(metrics).map(([metricName, data]) => (
                <div
                  key={metricName}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getMetricIcon(metricName)}
                      <span className="font-medium text-gray-900 text-sm">
                        {metricName.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {data.count} calls
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 block">Average</span>
                      <span className={`font-mono ${getMetricColor(metricName, data.avg)}`}>
                        {metricName === 'CLS' ? data.avg.toFixed(3) : formatTime(data.avg)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Peak</span>
                      <span className={`font-mono ${getMetricColor(metricName, data.max)}`}>
                        {metricName === 'CLS' ? data.max.toFixed(3) : formatTime(data.max)}
                      </span>
                    </div>
                  </div>

                  {/* Performance indicator */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getMetricColor(metricName, data.avg).includes('red')
                            ? 'bg-red-500'
                            : getMetricColor(metricName, data.avg).includes('yellow')
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (data.avg / Math.max(data.max, 1000)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-600 text-center">
              🚀 Performance tracking is active in development mode
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
