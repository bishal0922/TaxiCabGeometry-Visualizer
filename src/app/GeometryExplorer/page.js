"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bird, 
  Car, 
  Play, 
  Pause,
  RotateCcw, 
  ArrowRight,
  Timer,
  LayoutGrid,
  Crosshair,
  X,
  PanelLeftOpen,
  Ban,
  Ruler,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GeometryExplorer = () => {
  // Existing state...
  const [gridSize] = useState(15);
  const [showGrid, setShowGrid] = useState(true);
  const [startPoint, setStartPoint] = useState({ x: 3, y: 3 });
  const [endPoint, setEndPoint] = useState({ x: 11, y: 11 });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [activeGeometry, setActiveGeometry] = useState('both');
  const [isDragging, setIsDragging] = useState(false);
  
  // New state for theory panel and blocked streets
  const [showTheory, setShowTheory] = useState(false);
  const [isBlockingMode, setIsBlockingMode] = useState(false);
  const [blockedStreets, setBlockedStreets] = useState(new Set());
  const [highlightedStreet, setHighlightedStreet] = useState(null);

  // Animation states...
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [birdPosition, setBirdPosition] = useState({ x: 3, y: 3 });
  const [taxiPosition, setTaxiPosition] = useState({ x: 3, y: 3 });
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(null);

  // Helper function to format a street identifier
  const getStreetId = (x1, y1, x2, y2) => {
    return `${Math.min(x1, x2)},${Math.min(y1, y2)}-${Math.max(x1, x2)},${Math.max(y1, y2)}`;
  };

  // Helper function to get coordinates from street ID
  const getStreetCoords = (streetId) => {
    const [start, end] = streetId.split('-');
    const [x1, y1] = start.split(',').map(Number);
    const [x2, y2] = end.split(',').map(Number);
    return { x1, y1, x2, y2 };
  };

  // Calculate distances
  const calculateEuclideanDistance = useCallback((p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  const calculateTaxicabDistance = useCallback((p1, p2) => {
    return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
  }, []);

  // Calculate angle for bird flight
  const getBirdAngle = useCallback(() => {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, [startPoint, endPoint]);

  // Animation handlers
  const startAnimation = () => {
    setIsAnimating(true);
    setIsPaused(false);
    setBirdPosition({ ...startPoint });
    setTaxiPosition({ ...startPoint });
    startTimeRef.current = Date.now();
    animate();
  };

  const pauseAnimation = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resumeAnimation = () => {
    setIsPaused(false);
    startTimeRef.current += Date.now() - pausedTimeRef.current;
    animate();
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setIsPaused(false);
    setBirdPosition({ ...startPoint });
    setTaxiPosition({ ...startPoint });
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const animate = () => {
    const duration = 3000;
    const elapsed = Date.now() - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    if (progress === 1) {
      setIsAnimating(false);
      return;
    }

    // Bird animation (linear)
    if (activeGeometry !== 'taxicab') {
      setBirdPosition({
        x: startPoint.x + (endPoint.x - startPoint.x) * progress,
        y: startPoint.y + (endPoint.y - startPoint.y) * progress
      });
    }

    // Taxi animation (horizontal then vertical)
    if (activeGeometry !== 'euclidean') {
      const taxiProgress = progress * 2;
      if (taxiProgress <= 1) {
        setTaxiPosition({
          x: startPoint.x + (endPoint.x - startPoint.x) * taxiProgress,
          y: startPoint.y
        });
      } else {
        setTaxiPosition({
          x: endPoint.x,
          y: startPoint.y + (endPoint.y - startPoint.y) * (taxiProgress - 1)
        });
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  };
  // Render paths
  const renderPaths = () => {
    if (!isAnimating) return null;

    return (
      <>
        {activeGeometry !== 'euclidean' && (
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
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
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
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
  };


  // Modified grid interaction handlers
  const handleGridMouseDown = (e) => {
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
  };

  const handleGridMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);

    if (isBlockingMode) {
      // Find the nearest grid line
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
      setBirdPosition(newPoint);
      setTaxiPosition(newPoint);
    } else if (selectedPoint === 'end' && (x !== startPoint.x || y !== startPoint.y)) {
      setEndPoint({
        x: Math.max(0, Math.min(x, gridSize - 1)),
        y: Math.max(0, Math.min(y, gridSize - 1))
      });
    }
  };

  // Real-time distance calculations
  const euclideanCalculation = useCallback(() => {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    return {
      dx,
      dy,
      squaredDx: dx * dx,
      squaredDy: dy * dy,
      distance: Math.sqrt(dx * dx + dy * dy)
    };
  }, [startPoint, endPoint]);

  const taxicabCalculation = useCallback(() => {
    const dx = Math.abs(endPoint.x - startPoint.x);
    const dy = Math.abs(endPoint.y - startPoint.y);
    return {
      dx,
      dy,
      distance: dx + dy
    };
  }, [startPoint, endPoint]);

  // Theory Panel Component
  const TheoryPanel = () => (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="absolute left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-sm shadow-lg z-10 p-4 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Distance Formulas</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setShowTheory(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Euclidean Distance */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-blue-600 mb-2">Flight Path (Euclidean)</h4>
        <div className="space-y-2 text-sm">
          <p className="font-mono bg-slate-50 p-2 rounded">
            d = √(Δx² + Δy²)
          </p>
          <div className="space-y-1 font-mono text-xs">
            {(() => {
              const calc = euclideanCalculation();
              return (
                <>
                  <div>Δx = {calc.dx}</div>
                  <div>Δy = {calc.dy}</div>
                  <div>Δx² = {calc.squaredDx}</div>
                  <div>Δy² = {calc.squaredDy}</div>
                  <div>√({calc.squaredDx} + {calc.squaredDy})</div>
                  <div className="text-blue-600 font-medium">
                    = {calc.distance.toFixed(2)} units
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Taxicab Distance */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-red-600 mb-2">Street Path (Manhattan)</h4>
        <div className="space-y-2 text-sm">
          <p className="font-mono bg-slate-50 p-2 rounded">
            d = |Δx| + |Δy|
          </p>
          <div className="space-y-1 font-mono text-xs">
            {(() => {
              const calc = taxicabCalculation();
              return (
                <>
                  <div>|Δx| = {calc.dx}</div>
                  <div>|Δy| = {calc.dy}</div>
                  <div>{calc.dx} + {calc.dy}</div>
                  <div className="text-red-600 font-medium">
                    = {calc.distance} units
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Additional Theory */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">Key Concepts</h4>
        <ul className="text-xs space-y-2 text-gray-600">
          <li>• The <span className="text-blue-600">Euclidean distance</span> represents the shortest possible path between two points.</li>
          <li>• The <span className="text-red-600">Manhattan distance</span> represents movement restricted to a grid, like city streets.</li>
          <li>• The Manhattan distance is always greater than or equal to the Euclidean distance.</li>
          <li>• They're equal only when the points are aligned horizontally or vertically.</li>
        </ul>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto p-3">
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardContent className="p-4">
          {/* Top Controls */}
          <div className="flex items-center gap-2 mb-4">
            {/* Theory Panel Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTheory(!showTheory)}
              className="h-7 w-7 relative group"
            >
              <PanelLeftOpen className="w-3 h-3" />
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Show/Hide Theory
              </span>
            </Button>

            {/* Path Type Controls */}
            <div className="flex gap-1">
              <Button
                variant={activeGeometry === 'euclidean' ? "default" : "outline"}
                onClick={() => !isAnimating && setActiveGeometry('euclidean')}
                className="relative group"
                size="sm"
              >
                <Bird className="w-3 h-3 mr-1" />
                Flight
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Direct flight path
                </span>
              </Button>
              <Button
                variant={activeGeometry === 'taxicab' ? "default" : "outline"}
                onClick={() => !isAnimating && setActiveGeometry('taxicab')}
                className="relative group"
                size="sm"
              >
                <Car className="w-3 h-3 mr-1" />
                Street
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Street grid path
                </span>
              </Button>
              <Button
                variant={activeGeometry === 'both' ? "default" : "outline"}
                onClick={() => !isAnimating && setActiveGeometry('both')}
                className="relative group"
                size="sm"
              >
                <ArrowRight className="w-3 h-3 mr-1" />
                Compare
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Show both paths
                </span>
              </Button>
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Grid and Block Controls */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowGrid(!showGrid)}
                className={`h-7 w-7 relative group ${showGrid ? 'bg-slate-100' : ''}`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Toggle Grid
                </span>
              </Button>

              <Button
                variant={isBlockingMode ? "default" : "outline"}
                size="icon"
                onClick={() => {
                  if (isAnimating) return;
                  setIsBlockingMode(!isBlockingMode);
                }}
                className={`h-7 w-7 relative group ${isBlockingMode ? 'bg-red-500 hover:bg-red-600' : ''}`}
                disabled={isAnimating}
              >
                <Ban className={`w-3 h-3 ${isBlockingMode ? 'text-white' : ''}`} />
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {isBlockingMode ? 'Exit Blocking Mode' : 'Block Streets'}
                </span>
              </Button>
            </div>

            {/* Animation Controls */}
            <div className="ml-auto flex gap-1">
              {!isAnimating ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={startAnimation}
                  className="relative group"
                  disabled={isBlockingMode}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Start Animation
                  </span>
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 relative group"
                    onClick={isPaused ? resumeAnimation : pauseAnimation}
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {isPaused ? 'Resume' : 'Pause'}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 relative group"
                    onClick={resetAnimation}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Reset
                    </span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Main Grid Container */}
          <div className="relative">
            {/* Theory Panel */}
            <AnimatePresence>
              {showTheory && <TheoryPanel />}
            </AnimatePresence>

            {/* Main Grid */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white shadow-inner">
              {/* Grid Background */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  showGrid ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                    linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
                  `,
                  backgroundSize: `${100 / gridSize}% ${100 / gridSize}%`
                }}
              />

              {/* SVG Layer */}
              <svg 
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 150 150"
                preserveAspectRatio="none"
              >
                {/* Blocked Streets */}
                {Array.from(blockedStreets).map(streetId => {
                  const { x1, y1, x2, y2 } = getStreetCoords(streetId);
                  return (
                    <line
                      key={streetId}
                      x1={x1 * 10}
                      y1={y1 * 10}
                      x2={x2 * 10}
                      y2={y2 * 10}
                      stroke="#ef4444"
                      strokeWidth="2"
                      className="opacity-50"
                    />
                  );
                })}

                {/* Highlighted Street */}
                {isBlockingMode && highlightedStreet && (
                  <motion.line
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    {...(() => {
                      const { x1, y1, x2, y2 } = getStreetCoords(highlightedStreet);
                      return {
                        x1: x1 * 10,
                        y1: y1 * 10,
                        x2: x2 * 10,
                        y2: y2 * 10
                      };
                    })()}
                    stroke={blockedStreets.has(highlightedStreet) ? "#22c55e" : "#ef4444"}
                    strokeWidth="2"
                    className="opacity-70"
                  />
                )}

                {/* Path Lines */}
                {renderPaths()}

                {/* Start Point */}
                <motion.g
                  initial={false}
                  animate={{
                    x: startPoint.x * 10,
                    y: startPoint.y * 10,
                    scale: isDragging && selectedPoint === 'start' ? 1.2 : 1
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`cursor-grab ${isDragging && selectedPoint === 'start' ? 'cursor-grabbing' : ''}`}
                >
                  <circle r="2.5" fill="#22c55e" />
                  <circle r="4" className="stroke-green-500 stroke-1 fill-transparent" />
                  {!isAnimating && (
                    <text
                      y="-6"
                      textAnchor="middle"
                      fill="#22c55e"
                      fontSize="3"
                      className="font-semibold pointer-events-none"
                    >
                      Start
                    </text>
                  )}
                </motion.g>

                {/* End Point */}
                <motion.g
                  initial={false}
                  animate={{
                    x: endPoint.x * 10,
                    y: endPoint.y * 10,
                    scale: isDragging && selectedPoint === 'end' ? 1.2 : 1
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`cursor-grab ${isDragging && selectedPoint === 'end' ? 'cursor-grabbing' : ''}`}
                >
                  <circle r="2.5" fill="#ef4444" />
                  <circle r="4" className="stroke-red-500 stroke-1 fill-transparent" />
                  {!isAnimating && (
                    <text
                      y="-6"
                      textAnchor="middle"
                      fill="#ef4444"
                      fontSize="3"
                      className="font-semibold pointer-events-none"
                    >
                      End
                    </text>
                  )}
                </motion.g>

                {/* Animated Vehicles */}
                <AnimatePresence>
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

                      {(activeGeometry === 'euclidean' || activeGeometry === 'both') && (
                        <motion.g
                          initial={false}
                          animate={{
                            x: birdPosition.x * 10,
                            y: birdPosition.y * 10,
                            rotate: getBirdAngle()
                          }}
                          transition={{ type: "linear" }}
                        >
                          <circle r="2.5" fill="#3b82f6" className="drop-shadow-md" />
                          <foreignObject x="-2" y="-2" width="4" height="4">
                            <div className="w-full h-full flex items-center justify-center">
                              <Bird className="w-2 h-2 text-white" />
                            </div>
                          </foreignObject>
                        </motion.g>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </svg>

              {/* Interaction Layer */}
              <div
                className={`absolute inset-0 ${isBlockingMode ? 'cursor-crosshair' : ''}`}
                onMouseDown={handleGridMouseDown}
                onMouseMove={handleGridMouseMove}
                onMouseUp={() => {
                  setIsDragging(false);
                  setSelectedPoint(null);
                  setHighlightedStreet(null);
                }}
                onMouseLeave={() => {
                  setIsDragging(false);
                  setSelectedPoint(null);
                  setHighlightedStreet(null);
                }}
              />
            </div>
          </div>

          {/* Bottom Metrics Panels */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* Distance Metrics */}
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-medium">Flight Distance</span>
                    </div>
                    <span className="font-mono text-xs">
                      {calculateEuclideanDistance(startPoint, endPoint).toFixed(2)} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-xs font-medium">Street Distance</span>
                    </div>
                    <span className="font-mono text-xs">
                    {calculateTaxicabDistance(startPoint, endPoint)} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-purple-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-xs font-medium">Difference</span>
                    </div>
                    <span className="font-mono text-xs">
                      {(calculateTaxicabDistance(startPoint, endPoint) - 
                        calculateEuclideanDistance(startPoint, endPoint)).toFixed(2)} units
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions/Info Panel */}
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="space-y-2">
                  {isBlockingMode ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-600"
                    >
                      <p className="mb-1">
                        <span className="font-medium text-gray-900">Hover</span> over streets and{' '}
                        <span className="font-medium text-gray-900">click</span> to block/unblock them.
                      </p>
                      <p>
                        Click the block button again to exit blocking mode.
                      </p>
                    </motion.div>
                  ) : isAnimating ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-600"
                    >
                      {activeGeometry === 'both' 
                        ? "Watch how the direct flight path compares to following the street grid!"
                        : activeGeometry === 'taxicab'
                          ? "The taxi must follow the street grid, moving only horizontally and vertically."
                          : "The bird can fly directly to its destination, taking the shortest possible path."}
                      {blockedStreets.size > 0 && (
                        <p className="mt-1 text-red-600">
                          Blocked streets shown in red must be avoided!
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-600"
                    >
                      <p className="mb-1">
                        <span className="font-medium text-gray-900">Drag</span> the start and end points to explore different paths.
                      </p>
                      <p className="mb-1">
                        <span className="font-medium text-gray-900">Block streets</span> to create obstacles.
                      </p>
                      <p>
                        <span className="font-medium text-gray-900">Click Start</span> to animate the journey!
                      </p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );

};

export default GeometryExplorer;