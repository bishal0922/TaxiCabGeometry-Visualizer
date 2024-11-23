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
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    resetAnimation
  } = useAnimation(startPoint, endPoint, activeGeometry);

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
    const x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);

    if (isBlockingMode) {
      if (highlightedStreet) {
        const newBlockedStreets = new Set(blockedStreets);
        if (newBlockedStreets.has(highlightedStreet)) {
          newBlockedStreets.delete(highlightedStreet);
        } else {
          newBlockedStreets.add(highlightedStreet);
        }
        setBlockedStreets(newBlockedStreets);
      }
      return;
    }

    if (startPoint.x === x && startPoint.y === y) {
      setSelectedPoint('start');
      setIsDragging(true);
    } else if (endPoint.x === x && endPoint.y === y) {
      setSelectedPoint('end');
      setIsDragging(true);
    }
  }, [isAnimating, isBlockingMode, highlightedStreet, blockedStreets, startPoint, endPoint, gridSize]);

  const handleGridMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);

    if (isBlockingMode) {
      const exactX = (e.clientX - rect.left) / rect.width * gridSize;
      const exactY = (e.clientY - rect.top) / rect.height * gridSize;
      
      const isHorizontal = Math.abs(exactY - Math.round(exactY)) < Math.abs(exactX - Math.round(exactX));
      
      if (isHorizontal) {
        const roundedY = Math.round(exactY);
        if (roundedY >= 0 && roundedY < gridSize) {
          setHighlightedStreet(getStreetId(x, roundedY, x + 1, roundedY));
        }
      } else {
        const roundedX = Math.round(exactX);
        if (roundedX >= 0 && roundedX < gridSize) {
          setHighlightedStreet(getStreetId(roundedX, y, roundedX, y + 1));
        }
      }
      return;
    }

    if (!isDragging || !selectedPoint) return;

    if (selectedPoint === 'start' && (x !== endPoint.x || y !== endPoint.y)) {
      const newPoint = {
        x: Math.max(0, Math.min(x, gridSize - 1)),
        y: Math.max(0, Math.min(y, gridSize - 1))
      };
      setStartPoint(newPoint);
    } else if (selectedPoint === 'end' && (x !== startPoint.x || y !== startPoint.y)) {
      setEndPoint({
        x: Math.max(0, Math.min(x, gridSize - 1)),
        y: Math.max(0, Math.min(y, gridSize - 1))
      });
    }
  }, [isDragging, selectedPoint, isBlockingMode, gridSize, startPoint, endPoint, getStreetId]);

  // src/app/GeometryExplorer/page.js (continued)

  // Render paths (continued)
  const renderPaths = useCallback(() => {
    if (!isAnimating) return null;

    return (
      <>
        {activeGeometry !== 'euclidean' && (
          <path
            d={`M ${startPoint.x * 10} ${startPoint.y * 10} 
                H ${endPoint.x * 10} 
                V ${endPoint.y * 10}`}
            stroke="#ef4444"
            strokeWidth="0.5"
            strokeDasharray="2"
            fill="none"
            className="opacity-50"
          />
        )}
        {activeGeometry !== 'taxicab' && (
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
      </>
    );
  }, [isAnimating, activeGeometry, startPoint, endPoint]);

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