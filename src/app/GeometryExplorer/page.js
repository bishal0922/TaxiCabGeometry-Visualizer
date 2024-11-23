// src/app/GeometryExplorer/page.js
"use client"

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence } from 'framer-motion';
import { ControlPanel } from './components/ControlPanel';
import { TheoryPanel } from './components/TheoryPanel';
import { Grid } from './components/Grid';
import { MetricsPanel } from './components/MetricsPanel';
import { useAnimation } from './hooks/useAnimation';
import { useGeometryCalculations } from './hooks/useGeometryCalculations';
import { InstructionsPanel } from './components/InstructionsPanel';
import { PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GeometryExplorer = () => {
  // Core state
  const [gridSize] = useState(15);
  const [showGrid, setShowGrid] = useState(true);
  const [startPoint, setStartPoint] = useState({ x: 3, y: 3 });
  const [endPoint, setEndPoint] = useState({ x: 11, y: 11 });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [activeGeometry, setActiveGeometry] = useState('both');
  const [isDragging, setIsDragging] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const [isBlockingMode, setIsBlockingMode] = useState(false);
  const [blockedStreets, setBlockedStreets] = useState(new Set());
  const [highlightedStreet, setHighlightedStreet] = useState(null);

  // Custom hooks
  const {
    isAnimating,
    isPaused,
    birdPosition,
    taxiPosition,
    currentPath,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    resetAnimation
  } = useAnimation(startPoint, endPoint, activeGeometry, gridSize, blockedStreets);

  const {
    calculateEuclideanDistance,
    calculateTaxicabDistance,
    euclideanCalculation,
    taxicabCalculation
  } = useGeometryCalculations();

  // Calculate bird angle
  const getBirdAngle = useCallback(() => {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, [startPoint, endPoint]);

  // Helper function to format street identifier
  const getStreetId = useCallback((x1, y1, x2, y2) => {
    return `${Math.min(x1, x2)},${Math.min(y1, y2)}-${Math.max(x1, x2)},${Math.max(y1, y2)}`;
  }, []);

  // Grid interaction handlers
  const handleGridMouseDown = useCallback((e) => {
    if (isAnimating) return;
  
    const rect = e.currentTarget.getBoundingClientRect();
    const exactX = (e.clientX - rect.left) / rect.width * gridSize;
    const exactY = (e.clientY - rect.top) / rect.height * gridSize;
    
    if (isBlockingMode) {
      if (highlightedStreet) {
        setBlockedStreets(prev => {
          const newBlockedStreets = new Set(prev);
          if (newBlockedStreets.has(highlightedStreet)) {
            newBlockedStreets.delete(highlightedStreet);
          } else {
            newBlockedStreets.add(highlightedStreet);
          }
          return newBlockedStreets;
        });
      }
      return;
    }
  
    // Round for point selection
    const x = Math.floor(exactX);
    const y = Math.floor(exactY);
  
    // Enhanced hit detection area for points (increased from exact match)
    const hitRadius = 0.3; // 30% of a grid cell
    const isNearStart = Math.abs(startPoint.x - exactX) < hitRadius && 
                       Math.abs(startPoint.y - exactY) < hitRadius;
    const isNearEnd = Math.abs(endPoint.x - exactX) < hitRadius && 
                     Math.abs(endPoint.y - exactY) < hitRadius;
  
    if (isNearStart) {
      setSelectedPoint('start');
      setIsDragging(true);
    } else if (isNearEnd) {
      setSelectedPoint('end');
      setIsDragging(true);
    }
  }, [isAnimating, isBlockingMode, highlightedStreet, startPoint, endPoint, gridSize]);
  
  const handleGridMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const exactX = (e.clientX - rect.left) / rect.width * gridSize;
    const exactY = (e.clientY - rect.top) / rect.height * gridSize;
  
    if (isBlockingMode) {
      // Determine if we're closer to a horizontal or vertical street
      const roundedX = Math.round(exactX);
      const roundedY = Math.round(exactY);
      const distToHorizontal = Math.abs(exactY - roundedY);
      const distToVertical = Math.abs(exactX - roundedX);
      
      if (roundedX >= 0 && roundedX < gridSize && roundedY >= 0 && roundedY < gridSize) {
        if (distToHorizontal < distToVertical) {
          // Closer to horizontal street
          const x = Math.floor(exactX);
          setHighlightedStreet(getStreetId(x, roundedY, x + 1, roundedY));
        } else {
          // Closer to vertical street
          const y = Math.floor(exactY);
          setHighlightedStreet(getStreetId(roundedX, y, roundedX, y + 1));
        }
      }
      return;
    }
  
    if (!isDragging || !selectedPoint) return;
  
    // Constrain to grid boundaries
    const newX = Math.max(0, Math.min(Math.round(exactX), gridSize - 1));
    const newY = Math.max(0, Math.min(Math.round(exactY), gridSize - 1));
  
    if (selectedPoint === 'start' && (newX !== endPoint.x || newY !== endPoint.y)) {
      setStartPoint({ x: newX, y: newY });
    } else if (selectedPoint === 'end' && (newX !== startPoint.x || newY !== startPoint.y)) {
      setEndPoint({ x: newX, y: newY });
    }
  }, [isDragging, selectedPoint, isBlockingMode, gridSize, startPoint, endPoint, getStreetId]);

  // Render paths (continued)
  const renderPaths = useCallback(() => {
    return (
      <>
        {/* Bird path (for euclidean and 'both' modes) */}
        {(activeGeometry === 'euclidean' || activeGeometry === 'both') && (
          <line
            x1={startPoint.x * 10}
            y1={startPoint.y * 10}
            x2={endPoint.x * 10}
            y2={endPoint.y * 10}
            stroke="#3b82f6"
            strokeWidth="0.5"
            strokeDasharray="2"
            className="opacity-50"
          />
        )}
  
        {/* Taxi path (for taxicab and 'both' modes) */}
        {(activeGeometry === 'taxicab' || activeGeometry === 'both') && currentPath && (
          <>
            {/* Debug markers for path points */}
            {currentPath.map((point, index) => (
              <circle
                key={`path-point-${index}`}
                cx={point.x * 10}
                cy={point.y * 10}
                r="0.5"
                fill="#ef4444"
                className="opacity-50"
              />
            ))}
            
            {/* Path segments */}
            <path
              d={`M ${currentPath.map(p => `${p.x * 10} ${p.y * 10}`).join(' L ')}`}
              stroke="#ef4444"
              strokeWidth="0.5"
              strokeDasharray="2"
              fill="none"
              className="opacity-50"
            />
          </>
        )}
  
        {/* Debug - current positions */}
        {isAnimating && (activeGeometry === 'taxicab' || activeGeometry === 'both') && (
          <circle
            cx={taxiPosition.x * 10}
            cy={taxiPosition.y * 10}
            r="0.5"
            fill="#000000"
            className="opacity-50"
          />
        )}
      </>
    );
  }, [isAnimating, activeGeometry, startPoint, endPoint, currentPath, taxiPosition]);
  
  return (
    <div className="min-h-screen flex justify-center mt-4" >
      <div className="flex items-start gap-4">
        {/* Main Content - Keep original width */}
        <div className="w-[700px]">
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4">
              {/* Keep original ControlPanel with the theory toggle */}
              <ControlPanel
                showTheory={showTheory}
                setShowTheory={setShowTheory}
                activeGeometry={activeGeometry}
                setActiveGeometry={setActiveGeometry}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                isBlockingMode={isBlockingMode}
                setIsBlockingMode={setIsBlockingMode}
                isAnimating={isAnimating}
                isPaused={isPaused}
                startAnimation={startAnimation}
                pauseAnimation={pauseAnimation}
                resumeAnimation={resumeAnimation}
                resetAnimation={resetAnimation}
              />
              
              {/* Main Grid Container */}
              <div className="relative">
                <Grid
                  showGrid={showGrid}
                  gridSize={gridSize}
                  blockedStreets={blockedStreets}
                  highlightedStreet={highlightedStreet}
                  isBlockingMode={isBlockingMode}
                  renderPaths={renderPaths}
                  startPoint={startPoint}
                  endPoint={endPoint}
                  isDragging={isDragging}
                  selectedPoint={selectedPoint}
                  isAnimating={isAnimating}
                  birdPosition={birdPosition}
                  taxiPosition={taxiPosition}
                  activeGeometry={activeGeometry}
                  getBirdAngle={getBirdAngle}
                  handleGridMouseDown={handleGridMouseDown}
                  currentPath={currentPath}
                  handleGridMouseMove={handleGridMouseMove}
                  handleGridMouseUp={() => {
                    setIsDragging(false);
                    setSelectedPoint(null);
                    setHighlightedStreet(null);
                  }}
                  handleGridMouseLeave={() => {
                    setIsDragging(false);
                    setSelectedPoint(null);
                    setHighlightedStreet(null);
                  }}
                />
              </div>

              {/* Bottom Panels */}
              <div className="mt-4 grid grid-cols-2 gap-4">
              <MetricsPanel
  calculateEuclideanDistance={calculateEuclideanDistance}
  calculateTaxicabDistance={calculateTaxicabDistance}
  startPoint={startPoint}
  endPoint={endPoint}
  gridSize={gridSize}
  blockedStreets={blockedStreets}
/>
                <InstructionsPanel
                  isBlockingMode={isBlockingMode}
                  isAnimating={isAnimating}
                  activeGeometry={activeGeometry}
                  blockedStreets={blockedStreets}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Theory Panel */}
        <AnimatePresence mode="wait">
          {showTheory && (
            <div className="w-64 shrink-0">
              <TheoryPanel
                euclideanCalculation={() => euclideanCalculation(startPoint, endPoint)}
                taxicabCalculation={() => taxicabCalculation(startPoint, endPoint)}
                setShowTheory={setShowTheory}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GeometryExplorer;