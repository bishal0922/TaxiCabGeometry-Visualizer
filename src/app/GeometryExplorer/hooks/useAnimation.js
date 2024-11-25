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

  const calculateTaxiPath = useCallback(() => {
    if (activeGeometry === 'euclidean') return null;
    
    // Always use pathfinding to get the path, even without blocked streets
    // This ensures consistent behavior and handling of both blocked and unblocked scenarios
    const path = findPath(startPoint, endPoint, gridSize, blockedStreets);
    
    if (!path) {
      console.warn('No valid path found between points');
      return null;
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
      const currentIndex = Math.min(Math.floor(pathProgress), currentPath.length - 2);
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
      alert("No valid path available! The taxi cannot reach the destination.");
      return;
    }
    
    setCurrentPath(taxiPath);
    setIsAnimating(true);
    setIsPaused(false);
    setBirdPosition({ ...startPoint });
    setTaxiPosition({ ...startPoint });
    startTimeRef.current = Date.now();
    animate();
  }, [startPoint, calculateTaxiPath, animate, activeGeometry]);

  // Rest of the hook remains the same...
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