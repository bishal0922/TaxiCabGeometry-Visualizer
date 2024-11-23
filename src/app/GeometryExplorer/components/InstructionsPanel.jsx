// src/app/GeometryExplorer/components/InstructionsPanel.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} InstructionsPanelProps
 * @property {boolean} isBlockingMode - Whether blocking mode is active
 * @property {boolean} isAnimating - Whether animation is playing
 * @property {'euclidean' | 'taxicab' | 'both'} activeGeometry - Current geometry mode
 * @property {Set<string>} blockedStreets - Set of blocked street IDs
 */

export const InstructionsPanel = ({
  isBlockingMode,
  isAnimating,
  activeGeometry,
  blockedStreets
}) => {
  const renderInstructions = () => {
    if (isBlockingMode) {
      return (
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
      );
    }

    if (isAnimating) {
      return (
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
      );
    }

    return (
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
        <p className="mt-1 text-xs text-blue-600">
          Try the theory panel to learn about distance calculations!
        </p>
      </motion.div>
    );
  };

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="space-y-2">
          {renderInstructions()}
        </div>
      </CardContent>
    </Card>
  );
};