import { useCallback } from 'react';

export const useGeometryCalculations = () => {
  const calculateEuclideanDistance = useCallback((p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  const calculateTaxicabDistance = useCallback((p1, p2) => {
    return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
  }, []);

  const euclideanCalculation = useCallback((p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return {
      dx,
      dy,
      squaredDx: dx * dx,
      squaredDy: dy * dy,
      distance: Math.sqrt(dx * dx + dy * dy)
    };
  }, []);

  const taxicabCalculation = useCallback((p1, p2) => {
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    return {
      dx,
      dy,
      distance: dx + dy
    };
  }, []);

  return {
    calculateEuclideanDistance,
    calculateTaxicabDistance,
    euclideanCalculation,
    taxicabCalculation
  };
};