// src/app/GeometryExplorer/components/TheoryPanel.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * @typedef {Object} TheoryPanelProps
 * @property {() => { dx: number, dy: number, squaredDx: number, squaredDy: number, distance: number }} euclideanCalculation
 * @property {() => { dx: number, dy: number, distance: number }} taxicabCalculation
 * @property {(show: boolean) => void} setShowTheory
 */

export const TheoryPanel = ({ 
  euclideanCalculation, 
  taxicabCalculation, 
  setShowTheory 
}) => {
  return (
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
};