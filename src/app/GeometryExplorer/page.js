// src/app/GeometryExplorer/page.js
"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {motion,  AnimatePresence } from 'framer-motion';
import { ControlPanel } from './components/ControlPanel';
import { TheoryPanel } from './components/TheoryPanel';
import { Grid } from './components/Grid';
import { MetricsPanel } from './components/MetricsPanel';
import { useAnimation } from './hooks/useAnimation';
import { useGeometryCalculations } from './hooks/useGeometryCalculations';
import { InstructionsPanel } from './components/InstructionsPanel';
import { getTaxicabPath } from './utils/pathfinding';
import {Car} from 'lucide-react';

const useTaxicabPath = (startPoint, endPoint, activeGeometry) => {
  const [displayPath, setDisplayPath] = useState(null);

  useEffect(() => {
    if (activeGeometry === 'taxicab' || activeGeometry === 'both') {
      const path = getTaxicabPath(startPoint, endPoint);
      setDisplayPath(path);
    } else {
      setDisplayPath(null);
    }
  }, [startPoint, endPoint, activeGeometry]);

  return displayPath;
};

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
  const displayPath = useTaxicabPath(startPoint, endPoint, activeGeometry);
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


  const handleStreetClick = (x1, y1, x2, y2) => {
    if (isBlockingMode) {
      const streetId = createStreetId(x1, y1, x2, y2);
      if (streetId) {
        setBlockedStreets(prev => {
          const newBlockedStreets = new Set(prev);
          if (newBlockedStreets.has(streetId)) {
            newBlockedStreets.delete(streetId);
          } else {
            newBlockedStreets.add(streetId);
          }
          return newBlockedStreets;
        });
      }
    }
  };
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
  
    // Enhanced hit detection area for points
    const hitRadius = 0.3;
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
      const roundedX = Math.round(exactX);
      const roundedY = Math.round(exactY);
      
      // Only proceed if we're within grid bounds
      if (roundedX >= 0 && roundedX < gridSize && roundedY >= 0 && roundedY < gridSize) {
        const distToHorizontal = Math.abs(exactY - roundedY);
        const distToVertical = Math.abs(exactX - roundedX);
        
        let streetId = null;
        if (distToHorizontal < distToVertical) {
          // Closer to horizontal street
          const x = Math.floor(exactX);
          if (x >= 0 && x + 1 < gridSize) {
            streetId = createStreetId(x, roundedY, x + 1, roundedY);
          }
        } else {
          // Closer to vertical street
          const y = Math.floor(exactY);
          if (y >= 0 && y + 1 < gridSize) {
            streetId = createStreetId(roundedX, y, roundedX, y + 1);
          }
        }
        
        if (streetId !== highlightedStreet) {
          setHighlightedStreet(streetId);
        }
      }
      return;
    }
    if (!isDragging || !selectedPoint) return;
  
    const newX = Math.max(0, Math.min(Math.round(exactX), gridSize - 1));
    const newY = Math.max(0, Math.min(Math.round(exactY), gridSize - 1));
  
    if (selectedPoint === 'start' && (newX !== endPoint.x || newY !== endPoint.y)) {
      setStartPoint({ x: newX, y: newY });
    } else if (selectedPoint === 'end' && (newX !== startPoint.x || newY !== startPoint.y)) {
      setEndPoint({ x: newX, y: newY });
    }
  }, [isDragging, selectedPoint, isBlockingMode, gridSize, startPoint, endPoint]);

  // Render paths helper
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
        {(activeGeometry === 'taxicab' || activeGeometry === 'both') && displayPath && (
          <>
            {displayPath.map((point, index) => (
              <circle
                key={`path-point-${index}`}
                cx={point.x * 10}
                cy={point.y * 10}
                r="0.5"
                fill="#ef4444"
                className="opacity-50"
              />
            ))}
            
            <path
              d={`M ${displayPath.map(p => `${p.x * 10} ${p.y * 10}`).join(' L ')}`}
              stroke="#ef4444"
              strokeWidth="0.5"
              strokeDasharray="2"
              fill="none"
              className="opacity-50"
            />
          </>
        )}

        {/* Animated vehicles */}
        {isAnimating && (
          <>
            {(activeGeometry === 'taxicab' || activeGeometry === 'both') && (
              <motion.g
                initial={false}
                animate={{
                  x: taxiPosition.x * 10,
                  y: taxiPosition.y * 10,
                  rotate: taxiPosition.x === endPoint.x ? 90 : 0
                }}
                transition={{ type: "linear" }}
              >
                <circle r="2.5" fill="#fbbf24" className="drop-shadow-md" />
                <foreignObject x="-2" y="-2" width="4" height="4">
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-2 h-2 text-black" />
                  </div>
                </foreignObject>
              </motion.g>
            )}
            
            {/* Keep existing bird animation code */}
          </>
        )}
      </>
    );
  }, [activeGeometry, startPoint, endPoint, displayPath, isAnimating, taxiPosition, endPoint]);

  return (
    <div className="min-h-screen flex justify-center mt-4">
      <div className="flex items-start gap-4">
        <div className="w-[700px]">
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4">
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
                  currentPath={currentPath}
                />
              </div>

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