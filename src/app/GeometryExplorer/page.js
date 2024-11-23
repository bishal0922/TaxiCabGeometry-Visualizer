"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Grid,
  Move,
  Play,
  RotateCcw,
  Target,
  Maximize2,
  Circle,
  Square,
  Trophy,
  Book,
  Map,
  Undo2,
  Redo2,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const MODES = {
  EXPLORE: 'explore',
  CHALLENGE: 'challenge',
  LEARN: 'learn'
};

const CHALLENGES = [
  {
    id: 1,
    title: "Equal Paths",
    description: "Find a point where Euclidean and Taxicab distances are equal",
    validator: (start, end) => {
      const euclidean = calculateEuclideanDistance(start, end);
      const taxicab = calculateTaxicabDistance(start, end);
      return Math.abs(euclidean - taxicab) < 0.1;
    }
  },
  {
    id: 2,
    title: "Maximum Difference",
    description: "Place points to maximize the difference between path types",
    validator: (start, end) => {
      const euclidean = calculateEuclideanDistance(start, end);
      const taxicab = calculateTaxicabDistance(start, end);
      return (taxicab - euclidean) > 5;
    }
  },
  {
    id: 3,
    title: "Multiple Paths",
    description: "Create a scenario with exactly 4 equivalent taxicab paths",
    validator: (start, end, obstacles) => {
      return countValidPaths(start, end, obstacles) === 4;
    }
  }
];

const GeometryExplorer = () => {
  // State Management
  const [mode, setMode] = useState(MODES.EXPLORE);
  const [activeGeometry, setActiveGeometry] = useState('both');
  const [gridSize, setGridSize] = useState(15);
  const [showGrid, setShowGrid] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const [startPoint, setStartPoint] = useState({ x: 2, y: 2 });
  const [endPoint, setEndPoint] = useState({ x: 7, y: 7 });
  const [obstacles, setObstacles] = useState([]);
  const [isDragging, setIsDragging] = useState(null);
  const [showCircles, setShowCircles] = useState(false);
  const [circleRadius, setCircleRadius] = useState(3);
  const [activeTool, setActiveTool] = useState('point');
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Metrics history for the chart
  const [metricsHistory, setMetricsHistory] = useState([]);

  // Calculate distances
  const calculateEuclideanDistance = useCallback((p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  const calculateTaxicabDistance = useCallback((p1, p2) => {
    return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
  }, []);

  // Generate all possible taxicab paths
  const generateTaxicabPaths = useCallback(() => {
    const paths = [];
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    
    const generatePath = (currentPath, remainingX, remainingY) => {
      if (remainingX === 0 && remainingY === 0) {
        paths.push([...currentPath]);
        return;
      }
      
      if (remainingX > 0) {
        generatePath([...currentPath, { x: 1, y: 0 }], remainingX - 1, remainingY);
      }
      if (remainingY > 0) {
        generatePath([...currentPath, { x: 0, y: 1 }], remainingX, remainingY - 1);
      }
    };
    
    generatePath([], Math.abs(dx), Math.abs(dy));
    return paths;
  }, [startPoint, endPoint]);

  // Visualization helpers
  const drawCircle = useCallback((center, radius, type) => {
    if (type === 'euclidean') {
      return Array.from({ length: 360 }).map((_, i) => {
        const angle = (i * Math.PI) / 180;
        return {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle)
        };
      });
    } else {
      // Taxicab circle (diamond shape)
      return [
        { x: center.x, y: center.y - radius },
        { x: center.x + radius, y: center.y },
        { x: center.x, y: center.y + radius },
        { x: center.x - radius, y: center.y }
      ];
    }
  }, []);

  // Challenge management
  const checkChallengeCompletion = useCallback(() => {
    if (!activeChallenge) return false;
    return CHALLENGES[activeChallenge - 1].validator(startPoint, endPoint, obstacles);
  }, [activeChallenge, startPoint, endPoint, obstacles]);

  // History management
  const addToHistory = useCallback(() => {
    const newState = {
      startPoint: { ...startPoint },
      endPoint: { ...endPoint },
      obstacles: [...obstacles]
    };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(prev => prev + 1);
  }, [startPoint, endPoint, obstacles, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setStartPoint(previousState.startPoint);
      setEndPoint(previousState.endPoint);
      setObstacles(previousState.obstacles);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setStartPoint(nextState.startPoint);
      setEndPoint(nextState.endPoint);
      setObstacles(nextState.obstacles);
      setHistoryIndex(prev => prev + 1);
    }
  };

  // Animation effect
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 1) {
            setIsAnimating(false);
            return 0;
          }
          return prev + 0.02;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  // Metrics tracking
  useEffect(() => {
    const euclidean = calculateEuclideanDistance(startPoint, endPoint);
    const taxicab = calculateTaxicabDistance(startPoint, endPoint);
    setMetricsHistory(prev => [
      ...prev,
      {
        time: new Date().getTime(),
        euclidean,
        taxicab,
        difference: taxicab - euclidean
      }
    ].slice(-20));
  }, [startPoint, endPoint]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Tabs defaultValue={MODES.EXPLORE} onValueChange={setMode}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value={MODES.EXPLORE}>
              <Map className="w-4 h-4 mr-2" />
              Explore
            </TabsTrigger>
            <TabsTrigger value={MODES.CHALLENGE}>
              <Trophy className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value={MODES.LEARN}>
              <Book className="w-4 h-4 mr-2" />
              Learn
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid className="w-4 h-4 mr-1" />
              Grid
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetrics(!showMetrics)}
            >
              <Zap className="w-4 h-4 mr-1" />
              Metrics
            </Button>
          </div>
        </div>

        <TabsContent value={MODES.EXPLORE}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Geometry Explorer</span>
                <div className="flex gap-2">
                  <Button
                    variant={activeGeometry === 'euclidean' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveGeometry('euclidean')}
                  >
                    <Circle className="w-4 h-4 mr-1" />
                    Euclidean
                  </Button>
                  <Button
                    variant={activeGeometry === 'taxicab' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveGeometry('taxicab')}
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Taxicab
                  </Button>
                  <Button
                    variant={activeGeometry === 'both' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveGeometry('both')}
                  >
                    <Maximize2 className="w-4 h-4 mr-1" />
                    Both
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8">
                {/* Main Grid */}
                <div className="col-span-2">
                  <div 
                    className="relative aspect-square border rounded-lg overflow-hidden"
                    style={{
                      backgroundColor: '#f8fafc',
                      backgroundImage: showGrid ? `
                        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
                      ` : 'none',
                      backgroundSize: `${100 / gridSize}% ${100 / gridSize}%`
                    }}
                  >
                    {/* Grid cells */}
                    {Array.from({ length: gridSize }).map((_, y) =>
                      Array.from({ length: gridSize }).map((_, x) => {
                        const isStart = startPoint.x === x && startPoint.y === y;
                        const isEnd = endPoint.x === x && endPoint.y === y;
                        const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);

                        return (
                          <div
                            key={`${x}-${y}`}
                            className={`absolute cursor-pointer transition-colors duration-200 ${
                              isObstacle ? 'bg-gray-800 hover:bg-gray-700' :
                              isStart ? 'bg-green-500 hover:bg-green-400' :
                              isEnd ? 'bg-red-500 hover:bg-red-400' : 
                              'hover:bg-gray-100'
                            }`}
                            style={{
                              left: `${(x / gridSize) * 100}%`,
                              top: `${(y / gridSize) * 100}%`,
                              width: `${100 / gridSize}%`,
                              height: `${100 / gridSize}%`,
                            }}
                            onClick={() => activeTool === 'obstacle' && !isStart && !isEnd && 
                              setObstacles(prev => 
                                isObstacle 
                                  ? prev.filter(o => !(o.x === x && o.y === y))
                                  : [...prev, { x, y }]
                              )
                            }
                            onMouseDown={() => {
                              if (activeTool === 'point') {
                                if (isStart) setIsDragging('start');
                                if (isEnd) setIsDragging('end');
                              }
                            }}
                          />
                        );
                      })
                    )}

                    {/* Paths and Visualizations */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {/* Distance Circles */}
                      {showCircles && (
                        <>
                          {activeGeometry !== 'taxicab' && 
                            drawCircle(startPoint, circleRadius, 'euclidean').map((point, i) => (
                              <circle
                                key={`euclidean-${i}`}
                                cx={`${(point.x / gridSize) * 100}%`}
                                cy={`${(point.y / gridSize) * 100}%`}
                                r="1"
                                fill="#3b82f6"
                                opacity="0.5"
                              />
                            ))
                          }
                          {activeGeometry !== 'euclidean' &&
                            drawCircle(startPoint, circleRadius, 'taxicab').map((point, i) => (
                              <circle
                                key={`taxicab-${i}`}
                                cx={`${(point.x / gridSize) * 100}%`}
                                cy={`${(point.y / gridSize) * 100}%`}
                                r="1"
                                fill="#ef4444"
                                opacity="0.5"
                              />
                            ))
                          }
                        </>
                      )}

                       {/* Paths continued */}
                       {(activeGeometry === 'euclidean' || activeGeometry === 'both') && (
                        <line
                          x1={`${(startPoint.x / gridSize) * 100}%`}
                          y1={`${(startPoint.y / gridSize) * 100}%`}
                          x2={`${((startPoint.x + (endPoint.x - startPoint.x) * animationProgress) / gridSize) * 100}%`}
                          y2={`${((startPoint.y + (endPoint.y - startPoint.y) * animationProgress) / gridSize) * 100}%`}
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeDasharray="4"
                          className="transition-all duration-300"
                        />
                      )}
                      
                      {(activeGeometry === 'taxicab' || activeGeometry === 'both') && (
                        <path
                          d={`
                            M ${(startPoint.x / gridSize) * 100}% ${(startPoint.y / gridSize) * 100}%
                            H ${((startPoint.x + (endPoint.x - startPoint.x) * animationProgress) / gridSize) * 100}%
                            V ${((startPoint.y + (endPoint.y - startPoint.y) * animationProgress) / gridSize) * 100}%
                          `}
                          stroke="#ef4444"
                          strokeWidth="2"
                          fill="none"
                          className="transition-all duration-300"
                        />
                      )}

                      {/* Multiple taxicab paths */}
                      {activeGeometry === 'taxicab' && 
                        generateTaxicabPaths().map((path, index) => (
                          <path
                            key={index}
                            d={path.reduce((acc, step, i) => {
                              const x = startPoint.x + step.x;
                              const y = startPoint.y + step.y;
                              return `${acc} ${i === 0 ? 'M' : 'L'} ${(x / gridSize) * 100}% ${(y / gridSize) * 100}%`;
                            }, '')}
                            stroke="#ef4444"
                            strokeWidth="1"
                            strokeOpacity="0.3"
                            fill="none"
                          />
                        ))
                      }
                    </svg>
                  </div>

                  {/* Tool Panel */}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        variant={activeTool === 'point' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTool('point')}
                      >
                        <Target className="w-4 h-4 mr-1" />
                        Points
                      </Button>
                      <Button
                        variant={activeTool === 'obstacle' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTool('obstacle')}
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Obstacles
                      </Button>
                      <Button
                        variant={showCircles ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCircles(!showCircles)}
                      >
                        <Circle className="w-4 h-4 mr-1" />
                        Distance Circles
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={undo}
                        disabled={historyIndex <= 0}
                      >
                        <Undo2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                      >
                        <Redo2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAnimating(true)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Metrics Panel */}
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Distance Metrics</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-500">Euclidean:</span>
                          <span className="font-mono">
                            {calculateEuclideanDistance(startPoint, endPoint).toFixed(2)} units
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-500">Taxicab:</span>
                          <span className="font-mono">
                            {calculateTaxicabDistance(startPoint, endPoint).toFixed(2)} units
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-500">Difference:</span>
                          <span className="font-mono">
                            {(calculateTaxicabDistance(startPoint, endPoint) - 
                              calculateEuclideanDistance(startPoint, endPoint)).toFixed(2)} units
                          </span>
                        </div>
                      </div>

                      {/* Distance Circle Radius Control */}
                      {showCircles && (
                        <div className="space-y-2">
                          <label className="text-sm text-gray-600">Circle Radius</label>
                          <Slider
                            value={[circleRadius]}
                            min={1}
                            max={10}
                            step={0.5}
                            onValueChange={([value]) => setCircleRadius(value)}
                          />
                        </div>
                      )}

                      {/* Metrics Chart */}
                      <div className="h-40">
                        <LineChart data={metricsHistory} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" hide />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="euclidean" stroke="#3b82f6" dot={false} />
                          <Line type="monotone" dataKey="taxicab" stroke="#ef4444" dot={false} />
                          <Line type="monotone" dataKey="difference" stroke="#a855f7" dot={false} />
                        </LineChart>
                      </div>
                    </div>
                  </Card>

                  {/* Challenge Status (if in challenge mode) */}
                  {mode === MODES.CHALLENGE && activeChallenge && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Challenge Progress</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {CHALLENGES[activeChallenge - 1].description}
                      </p>
                      {checkChallengeCompletion() ? (
                        <div className="text-green-500 font-semibold">
                          Challenge Complete! 🎉
                        </div>
                      ) : (
                        <div className="text-orange-500">
                          Keep trying...
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenge Mode Content */}
        <TabsContent value={MODES.CHALLENGE}>
          <div className="grid grid-cols-3 gap-4">
            {CHALLENGES.map(challenge => (
              <Card key={challenge.id} className="p-4">
                <h3 className="font-semibold mb-2">{challenge.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
                <Button
                  variant={activeChallenge === challenge.id ? "default" : "outline"}
                  onClick={() => setActiveChallenge(challenge.id)}
                >
                  {activeChallenge === challenge.id ? "Active" : "Start"}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Learn Mode Content */}
        <TabsContent value={MODES.LEARN}>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Understanding Geometric Distances</h2>
            <div className="space-y-4">
              <section>
                <h3 className="text-xl font-semibold mb-2">Euclidean Distance</h3>
                <p className="text-gray-600">
                  Euclidean distance is the "as the crow flies" straight-line distance between two points.
                  It's calculated using the Pythagorean theorem: d = √((x₂-x₁)² + (y₂-y₁)²)
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold mb-2">Taxicab Distance</h3>
                <p className="text-gray-600">
                  Taxicab (Manhattan) distance is the path between points along a grid.
                  It's calculated by adding the absolute differences: d = |x₂-x₁| + |y₂-y₁|
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold mb-2">Real-world Applications</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  <li>City Navigation and Urban Planning</li>
                  <li>Robot Path Planning</li>
                  <li>Network Cable Routes</li>
                  <li>Emergency Response Planning</li>
                </ul>
              </section>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeometryExplorer;