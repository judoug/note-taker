'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function LazyComponent({ 
  children, 
  fallback, 
  className = '' 
}: LazyComponentProps) {
  const defaultFallback = (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

// Performance: HOC for lazy loading components
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyComponent fallback={fallback}>
        <Component {...props} />
      </LazyComponent>
    );
  };
}
