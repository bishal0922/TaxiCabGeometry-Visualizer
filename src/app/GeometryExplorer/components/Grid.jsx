// src/app/GeometryExplorer/components/Grid.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bird, Car } from 'lucide-react';

export const Grid = ({
  showGrid,
  gridSize,
  blockedStreets,
  highlightedStreet,
  isBlockingMode,
  renderPaths,
  startPoint,
  endPoint,
  isDragging,
  selectedPoint,
  isAnimating,
  birdPosition,
  taxiPosition,
  activeGeometry,
  getBirdAngle,
  handleGridMouseDown,
  handleGridMouseMove,
  handleGridMouseUp,
  handleGridMouseLeave
}) => {
  const getStreetCoords = (streetId) => {
    const [start, end] = streetId.split('-');
    const [x1, y1] = start.split(',').map(Number);
    const [x2, y2] = end.split(',').map(Number);
    return { x1, y1, x2, y2 };
  };

  // Enhanced Point Component with larger hit area
  const Point = ({ type, position, isSelected }) => (
    <motion.g
      initial={false}
      animate={{
        x: position.x * 10,
        y: position.y * 10,
        scale: isSelected ? 1.2 : 1
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`cursor-grab ${isSelected ? 'cursor-grabbing' : ''}`}
    >
      {/* Invisible larger hit area */}
      <circle 
        r="6" 
        fill="transparent" 
        className="hover:fill-current hover:opacity-10 transition-opacity"
      />
      {/* Visible point */}
      <circle 
        r="2.5" 
        fill={type === 'start' ? "#22c55e" : "#ef4444"} 
      />
      <circle 
        r="4" 
        className={`stroke-${type === 'start' ? 'green' : 'red'}-500 stroke-1 fill-transparent`} 
      />
      {!isAnimating && (
        <text
          y="-6"
          textAnchor="middle"
          fill={type === 'start' ? "#22c55e" : "#ef4444"}
          fontSize="3"
          className="font-semibold pointer-events-none"
        >
          {type === 'start' ? 'Start' : 'End'}
        </text>
      )}
    </motion.g>
  );

  return (
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

        {/* Points with enhanced hit areas */}
        <Point 
          type="start" 
          position={startPoint} 
          isSelected={isDragging && selectedPoint === 'start'} 
        />
        <Point 
          type="end" 
          position={endPoint} 
          isSelected={isDragging && selectedPoint === 'end'} 
        />

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
        onMouseUp={handleGridMouseUp}
        onMouseLeave={handleGridMouseLeave}
      />
    </div>
  );
};