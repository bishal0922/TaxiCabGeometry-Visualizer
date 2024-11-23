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
  Crosshair
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GeometryExplorer = () => {
  // Core state
  const [gridSize] = useState(15);
  const [showGrid, setShowGrid] = useState(true);
  const [startPoint, setStartPoint] = useState({ x: 3, y: 3 });
  const [endPoint, setEndPoint] = useState({ x: 11, y: 11 });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [activeGeometry, setActiveGeometry] = useState('both');
  const [isDragging, setIsDragging] = useState(false);
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [birdPosition, setBirdPosition] = useState({ x: 3, y: 3 });
  const [taxiPosition, setTaxiPosition] = useState({ x: 3, y: 3 });
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(null);

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

  // Grid interaction handlers
  const handleGridMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);

    if (startPoint.x === x && startPoint.y === y) {
      setSelectedPoint('start');
      setIsDragging(true);
    } else if (endPoint.x === x && endPoint.y === y) {
      setSelectedPoint('end');
      setIsDragging(true);
    }
  };

  const handleGridMouseMove = (e) => {
    if (!isDragging || !selectedPoint) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);
    
    // Ensure points don't overlap
    if (selectedPoint === 'start' && (x !== endPoint.x || y !== endPoint.y)) {
      setStartPoint({ x: Math.max(0, Math.min(x, gridSize - 1)), y: Math.max(0, Math.min(y, gridSize - 1)) });
      setBirdPosition({ x: Math.max(0, Math.min(x, gridSize - 1)), y: Math.max(0, Math.min(y, gridSize - 1)) });
      setTaxiPosition({ x: Math.max(0, Math.min(x, gridSize - 1)), y: Math.max(0, Math.min(y, gridSize - 1)) });
    } else if (selectedPoint === 'end' && (x !== startPoint.x || y !== startPoint.y)) {
      setEndPoint({ x: Math.max(0, Math.min(x, gridSize - 1)), y: Math.max(0, Math.min(y, gridSize - 1)) });
    }
  };

  const handleGridMouseUp = () => {
    setIsDragging(false);
    setSelectedPoint(null);
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

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={activeGeometry === 'euclidean' ? "default" : "outline"}
                onClick={() => !isAnimating && setActiveGeometry('euclidean')}
                className="relative group"
              >
                <Bird className="w-4 h-4 mr-2" />
                Flight Path
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Direct path through air
                </span>
              </Button>
              <Button
                variant={activeGeometry === 'taxicab' ? "default" : "outline"}
                onClick={() => !isAnimating && setActiveGeometry('taxicab')}
                className="relative group"
              >
                <Car className="w-4 h-4 mr-2" />
                Street Path
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Path following streets
                </span>
              </Button>
              <Button
                variant={activeGeometry === 'both' ? "default" : "outline"}
                onClick={() => !isAnimating && setActiveGeometry('both')}
                className="relative group"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Compare
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Show both paths
                </span>
              </Button>
            </div>
            
            <div className="h-6 w-px bg-slate-200 mx-2" />
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowGrid(!showGrid)}
              className={showGrid ? 'bg-slate-100' : ''}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>

            <div className="ml-auto flex gap-2">
              {!isAnimating ? (
                <Button
                  variant="default"
                  onClick={startAnimation}
                  className="relative group"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Begin animation
                  </span>
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={isPaused ? resumeAnimation : pauseAnimation}
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetAnimation}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

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

            {/* Interactive Layer */}
            <div
              className="absolute inset-0"
              onMouseDown={handleGridMouseDown}
              onMouseMove={handleGridMouseMove}
              onMouseUp={handleGridMouseUp}
              onMouseLeave={handleGridMouseUp}
            >
              {/* Visualization Layer */}
              <svg 
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 150 150"
                preserveAspectRatio="none"
              >
                {/* Paths */}
                {renderPaths()}

                {/* Start Point Marker */}
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
                  <circle r="4" fill="#22c55e" />
                  <circle r="6" className="stroke-green-500 stroke-2 fill-transparent" />
                  {!isAnimating && (
                    <text
                      y="-8"
                      textAnchor="middle"
                      fill="#22c55e"
                      fontSize="4"
                      className="font-semibold pointer-events-none"
                    >
                      Start
                    </text>
                  )}
                </motion.g>

                {/* End Point Marker */}
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
                  <circle r="4" fill="#ef4444" />
                  <circle r="6" className="stroke-red-500 stroke-2 fill-transparent" />
                  {!isAnimating && (
                    <text
                      y="-8"
                      textAnchor="middle"
                      fill="#ef4444"
                      fontSize="4"
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
                              <circle r="3.5" fill="#fbbf24" className="drop-shadow-md" />
                              <foreignObject x="-3" y="-3" width="6" height="6">
                                <div className="w-full h-full flex items-center justify-center">
                                  <Car className="w-2.5 h-2.5 text-black" />
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
                              <circle r="3.5" fill="#3b82f6" className="drop-shadow-md" />
                              <foreignObject x="-3" y="-3" width="6" height="6">
                                <div className="w-full h-full flex items-center justify-center">
                                  <Bird className="w-2.5 h-2.5 text-white" />
                                </div>
                              </foreignObject>
                            </motion.g>
                          )}
                        </>
                      )}
                    </AnimatePresence>
                </svg>
              </div>
            </div>

            {/* Metrics Panel */}
            <div className="mt-6 grid grid-cols-2 gap-6">
              {/* Distance Metrics */}
              <Card className="bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">Flight Distance</span>
                      </div>
                      <span className="font-mono text-sm">
                        {calculateEuclideanDistance(startPoint, endPoint).toFixed(2)} units
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm font-medium">Street Distance</span>
                      </div>
                      <span className="font-mono text-sm">
                        {calculateTaxicabDistance(startPoint, endPoint)} units
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-purple-600">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-sm font-medium">Difference</span>
                      </div>
                      <span className="font-mono text-sm">
                        {(calculateTaxicabDistance(startPoint, endPoint) - 
                          calculateEuclideanDistance(startPoint, endPoint)).toFixed(2)} units
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions/Info Panel */}
              <Card className="bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {isAnimating ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-gray-600"
                      >
                        {activeGeometry === 'both' 
                          ? "Watch how the direct flight path compares to following the street grid!"
                          : activeGeometry === 'taxicab'
                            ? "The taxi must follow the street grid, moving only horizontally and vertically."
                            : "The bird can fly directly to its destination, taking the shortest possible path."}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-gray-600"
                      >
                        <p className="mb-2">
                          <span className="font-medium text-gray-900">Drag</span> the start and end points to explore different paths.
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