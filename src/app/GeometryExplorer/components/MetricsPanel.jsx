import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const MetricsPanel = ({
  calculateEuclideanDistance,
  calculateTaxicabDistance,
  startPoint,
  endPoint
}) => {
  const euclideanDistance = calculateEuclideanDistance(startPoint, endPoint);
  const taxicabDistance = calculateTaxicabDistance(startPoint, endPoint);
  const difference = taxicabDistance - euclideanDistance;

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium">Flight Distance</span>
            </div>
            <span className="font-mono text-xs">
              {euclideanDistance.toFixed(2)} units
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-medium">Street Distance</span>
            </div>
            <span className="font-mono text-xs">
              {taxicabDistance} units
            </span>
          </div>
          <div className="flex items-center justify-between text-purple-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-xs font-medium">Difference</span>
            </div>
            <span className="font-mono text-xs">
              {difference.toFixed(2)} units
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};