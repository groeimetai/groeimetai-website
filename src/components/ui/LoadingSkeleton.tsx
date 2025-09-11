'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/10",
        className
      )}
    />
  );
}

// Dashboard-specific skeleton components
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16 mb-2" />
          <div className="flex items-center">
            <Skeleton className="h-3 w-3 mr-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border border-white/10">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function JourneyTimelineSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex items-center">
              <Skeleton className="h-3 w-3 mr-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-4 w-16 mb-4" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}

export function ConsultantMatchSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-white/10 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="absolute bottom-0 right-0 h-3 w-3 rounded-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-40 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-1">
                <Skeleton className="h-4 w-4 mr-1" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center">
              <Skeleton className="h-4 w-20 mr-1" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgressOverviewSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="text-right">
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      
      <Skeleton className="h-4 w-full mb-6" />
      
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-6 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default {
  Skeleton,
  DashboardStatsSkeleton,
  ProjectListSkeleton,
  ActivityFeedSkeleton,
  JourneyTimelineSkeleton,
  MetricCardSkeleton,
  ConsultantMatchSkeleton,
  ProgressOverviewSkeleton,
  QuickActionsSkeleton
};