/**
 * Performance monitoring utilities for tracking app performance
 * and identifying bottlenecks in production and development
 */

import React from 'react';

// Performance metrics interface
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// Extended interfaces for performance entries
interface LCPEntry extends PerformanceEntry {
  element?: Element;
}

interface FIDEntry extends PerformanceEntry {
  processingStart?: number;
}

interface CLSEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value?: number;
}

interface ResourceEntry extends PerformanceEntry {
  responseEnd?: number;
  transferSize?: number;
}

// Performance observer for tracking Web Vitals and custom metrics
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initWebVitals();
      this.initResourceTiming();
    }
  }

  // Track Web Vitals (Core Web Vitals + other important metrics)
  private initWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observePerformanceEntries('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1] as LCPEntry;
      this.recordMetric({
        name: 'LCP',
        value: lastEntry.startTime,
        unit: 'ms',
        timestamp: Date.now(),
        metadata: { element: lastEntry.element?.tagName || 'unknown' },
      });
    });

    // First Input Delay (FID) via Pointer Events
    this.observePerformanceEntries('first-input', (entries) => {
      entries.forEach((entry) => {
        const fidEntry = entry as FIDEntry;
        this.recordMetric({
          name: 'FID',
          value: (fidEntry.processingStart || 0) - entry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
          metadata: { eventType: entry.name },
        });
      });
    });

    // Cumulative Layout Shift (CLS)
    this.observePerformanceEntries('layout-shift', (entries) => {
      let clsScore = 0;
      entries.forEach((entry) => {
        const clsEntry = entry as CLSEntry;
        if (!clsEntry.hadRecentInput) {
          clsScore += clsEntry.value || 0;
        }
      });
      
      if (clsScore > 0) {
        this.recordMetric({
          name: 'CLS',
          value: clsScore,
          unit: 'count',
          timestamp: Date.now(),
        });
      }
    });
  }

  // Monitor resource loading performance
  private initResourceTiming() {
    this.observePerformanceEntries('resource', (entries) => {
      entries.forEach((entry) => {
        const resourceEntry = entry as ResourceEntry;
        const duration = (resourceEntry.responseEnd || 0) - entry.startTime;
        
        // Track slow resources (>1s)
        if (duration > 1000) {
          this.recordMetric({
            name: 'slow_resource',
            value: duration,
            unit: 'ms',
            timestamp: Date.now(),
            metadata: {
              url: entry.name,
              type: this.getResourceType(entry.name),
              size: resourceEntry.transferSize || 0,
            },
          });
        }
      });
    });
  }

  // Helper to observe performance entries
  private observePerformanceEntries(
    entryType: string,
    callback: (entries: PerformanceEntry[]) => void
  ) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type: entryType, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Performance observer for ${entryType} not supported:`, error);
    }
  }

  // Record a custom performance metric
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${metric.name} = ${metric.value}${metric.unit}`, metric.metadata);
      
      // Warn about poor performance
      if (metric.name === 'LCP' && metric.value > 2500) {
        console.warn('🐌 Poor LCP performance detected (>2.5s)');
      }
      if (metric.name === 'FID' && metric.value > 100) {
        console.warn('🐌 Poor FID performance detected (>100ms)');
      }
      if (metric.name === 'CLS' && metric.value > 0.1) {
        console.warn('🐌 Poor CLS performance detected (>0.1)');
      }
    }
  }

  // Track API call performance
  trackAPICall(endpoint: string, duration: number, success: boolean) {
    this.recordMetric({
      name: 'api_call',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        endpoint,
        success,
        slow: duration > 1000,
      },
    });
  }

  // Track React component render performance
  trackComponentRender(componentName: string, duration: number) {
    this.recordMetric({
      name: 'component_render',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        component: componentName,
        slow: duration > 16, // 60fps = ~16ms per frame
      },
    });
  }

  // Track database query performance
  trackDatabaseQuery(query: string, duration: number, recordCount?: number) {
    this.recordMetric({
      name: 'db_query',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        query,
        recordCount,
        slow: duration > 100, // >100ms is considered slow
      },
    });
  }

  // Get performance summary
  getMetricsSummary(): Record<string, { avg: number; max: number; count: number }> {
    const summary: Record<string, { avg: number; max: number; count: number }> = {};
    
    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { avg: 0, max: 0, count: 0 };
      }
      
      summary[metric.name].count++;
      summary[metric.name].max = Math.max(summary[metric.name].max, metric.value);
    });

    // Calculate averages
    Object.keys(summary).forEach((key) => {
      const total = this.metrics
        .filter((m) => m.name === key)
        .reduce((sum, m) => sum + m.value, 0);
      summary[key].avg = total / summary[key].count;
    });

    return summary;
  }

  // Get resource type from URL
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export performance tracking functions
export const performance = {
  // Track API calls
  trackAPI: (endpoint: string, duration: number, success: boolean = true) => {
    performanceMonitor.trackAPICall(endpoint, duration, success);
  },

  // Track component renders
  trackRender: (componentName: string, duration: number) => {
    performanceMonitor.trackComponentRender(componentName, duration);
  },

  // Track database queries
  trackDB: (query: string, duration: number, recordCount?: number) => {
    performanceMonitor.trackDatabaseQuery(query, duration, recordCount);
  },

  // Get performance summary
  getSummary: () => performanceMonitor.getMetricsSummary(),

  // Record custom metric
  record: (metric: PerformanceMetric) => performanceMonitor.recordMetric(metric),
};

// React hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  const startTime = globalThis.performance.now();
  
  return {
    endTracking: () => {
      const duration = globalThis.performance.now() - startTime;
      performanceMonitor.trackComponentRender(componentName, duration);
    },
  };
}

// HOC for automatically tracking component performance
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const { endTracking } = usePerformanceTracking(
      componentName || Component.displayName || Component.name || 'Unknown'
    );

    React.useEffect(() => {
      return endTracking;
    }, [endTracking]);

    return React.createElement(Component, props);
  };
}

// Performance warning thresholds
export const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // ms
  FID: 100,  // ms
  CLS: 0.1,  // score
  API_CALL: 1000, // ms
  COMPONENT_RENDER: 16, // ms (60fps)
  DB_QUERY: 100, // ms
} as const;

export default performanceMonitor;
