// src/app/GeometryExplorer/hooks/useAnimation.js

import { useState, useRef, useCallback } from 'react';
import { findPath } from '../utils/pathfinding';

export const useAnimation = (startPoint, endPoint, activeGeometry, gridSize, blockedStreets) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [birdPosition, setBirdPosition] = useState({ ...startPoint });
  const [taxiPosition, setTaxiPosition] = useState({ ...startPoint });
  const [currentPath, setCurrentPath] = useState(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(null);

  // Calculate path for taxi movement
// src/app/GeometryExplorer/hooks/useAnimation.js

const calculateTaxiPath = useCallback(() => {
    if (activeGeometry === 'euclidean') return null;
    
    if (blockedStreets.size > 0) {
      const path = findPath(startPoint, endPoint, gridSize, blockedStreets);
      if (!path) {
        alert("No valid street path available! The taxi cannot reach the destination with the current blocked streets.");
        return null;
      }
      return path;
    }
    
    // If no streets are blocked, create a simple manhattan path
    const path = [];
    path.push({ ...startPoint }); // Start point
    
    // Horizontal movement first (if needed)
    if (startPoint.x !== endPoint.x) {
      // Add all intermediate points for horizontal movement
      const direction = endPoint.x > startPoint.x ? 1 : -1;
      let currentX = startPoint.x;
      while (currentX !== endPoint.x) {
        currentX += direction;
        path.push({ x: currentX, y: startPoint.y });
      }
    }
    
    // Vertical movement (if needed)
    if (startPoint.y !== endPoint.y) {
      // Add all intermediate points for vertical movement
      const direction = endPoint.y > startPoint.y ? 1 : -1;
      let currentY = startPoint.y;
      while (currentY !== endPoint.y) {
        currentY += direction;
        path.push({ x: endPoint.x, y: currentY });
      }
    }
    
    return path;
  }, [startPoint, endPoint, activeGeometry, gridSize, blockedStreets]);
  
  const animate = useCallback(() => {
    const calculateDuration = () => {
      if (activeGeometry === 'both' || activeGeometry === 'taxicab') {
        // Duration should be proportional to the actual path length
        const taxiPathLength = currentPath ? currentPath.length - 1 : 0;
        const birdDistance = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) + 
          Math.pow(endPoint.y - startPoint.y, 2)
        );
        // Use the longer of the two paths to set the duration
        return Math.max(birdDistance, taxiPathLength) * 300;
      }
      
      // For euclidean only
      return Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + 
        Math.pow(endPoint.y - startPoint.y, 2)
      ) * 300;
    };
  
    const duration = calculateDuration();
    const elapsed = Date.now() - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
  
    if (progress === 1) {
      setIsAnimating(false);
      return;
    }
  
    // Bird animation (for euclidean and both modes)
    if (activeGeometry !== 'taxicab') {
      setBirdPosition({
        x: startPoint.x + (endPoint.x - startPoint.x) * progress,
        y: startPoint.y + (endPoint.y - startPoint.y) * progress
      });
    }
  
    // Taxi animation (for taxicab and both modes)
    if ((activeGeometry === 'taxicab' || activeGeometry === 'both') && currentPath?.length > 1) {
      const pathProgress = progress * (currentPath.length - 1);
      const currentIndex = Math.floor(pathProgress);
      const nextIndex = Math.min(currentIndex + 1, currentPath.length - 1);
      const subProgress = pathProgress - currentIndex;
  
      const current = currentPath[currentIndex];
      const next = currentPath[nextIndex];
  
      setTaxiPosition({
        x: current.x + (next.x - current.x) * subProgress,
        y: current.y + (next.y - current.y) * subProgress
      });
    }
  
    animationRef.current = requestAnimationFrame(animate);
  }, [startPoint, endPoint, activeGeometry, currentPath]);

  const startAnimation = useCallback(() => {
    const taxiPath = calculateTaxiPath();
    if ((activeGeometry === 'taxicab' || activeGeometry === 'both') && !taxiPath) {
      return;
    }
    
    setCurrentPath(taxiPath);
    setIsAnimating(true);
    setIsPaused(false);
    setBirdPosition({ ...startPoint });
    setTaxiPosition({ ...startPoint });
    startTimeRef.current = Date.now();
    animate();
  }, [startPoint, calculateTaxiPath, animate]);

  const pauseAnimation = useCallback(() => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const resumeAnimation = useCallback(() => {
    setIsPaused(false);
    startTimeRef.current += Date.now() - pausedTimeRef.current;
    animate();
  }, [animate]);

  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setIsPaused(false);
    setBirdPosition({ ...startPoint });
    setTaxiPosition({ ...startPoint });
    setCurrentPath(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [startPoint]);

  return {
    isAnimating,
    isPaused,
    birdPosition,
    taxiPosition,
    currentPath,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    resetAnimation
  };
};