// src/app/GeometryExplorer/hooks/useAnimation.js
import { useState, useRef, useCallback, useEffect } from 'react';
import { getTaxicabPath } from '../utils/pathfinding';

export const useAnimation = (startPoint, endPoint, activeGeometry) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [birdPosition, setBirdPosition] = useState({ ...startPoint });
  const [taxiPosition, setTaxiPosition] = useState({ ...startPoint });
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(null);
  const elapsedRef = useRef(0);

  const animate = useCallback(() => {
    const calculateDuration = () => {
      const path = getTaxicabPath(startPoint, endPoint);
      if (activeGeometry === 'both' || activeGeometry === 'taxicab') {
        const taxiPathLength = path ? path.length - 1 : 0;
        const birdDistance = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) + 
          Math.pow(endPoint.y - startPoint.y, 2)
        );
        return Math.max(birdDistance, taxiPathLength) * 300;
      }
      
      return Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + 
        Math.pow(endPoint.y - startPoint.y, 2)
      ) * 300;
    };

    const duration = calculateDuration();
    const elapsed = Date.now() - startTimeRef.current;
    elapsedRef.current = elapsed;
    const progress = Math.min(elapsed / duration, 1);

    if (progress === 1) {
      setIsAnimating(false);
      cancelAnimationFrame(animationRef.current);
      return;
    }

    // Bird animation (for euclidean and both modes)
    if (activeGeometry !== 'taxicab') {
      setBirdPosition({
        x: startPoint.x + (endPoint.x - startPoint.x) * progress,
        y: startPoint.y + (endPoint.y - startPoint.y) * progress
      });
    }

    // Taxi animation
    if (activeGeometry === 'taxicab' || activeGeometry === 'both') {
      const path = getTaxicabPath(startPoint, endPoint);
      if (path?.length > 1) {
        const pathProgress = progress * (path.length - 1);
        const currentIndex = Math.min(Math.floor(pathProgress), path.length - 2);
        const nextIndex = Math.min(currentIndex + 1, path.length - 1);
        const subProgress = pathProgress - currentIndex;

        const current = path[currentIndex];
        const next = path[nextIndex];

        setTaxiPosition({
          x: current.x + (next.x - current.x) * subProgress,
          y: current.y + (next.y - current.y) * subProgress
        });
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [startPoint, endPoint, activeGeometry]);

  const startAnimation = useCallback(() => {
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Reset positions
    setBirdPosition({ ...startPoint });
    setTaxiPosition({ ...startPoint });
    
    // Set up new animation
    setIsAnimating(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    elapsedRef.current = 0;
    
    // Immediately request the first animation frame
    animationRef.current = requestAnimationFrame(animate);
  }, [startPoint, animate]);

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
    animationRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const resetAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
    setIsPaused(false);
    setBirdPosition({ ...startPoint });
    setTaxiPosition({ ...startPoint });
    elapsedRef.current = 0;
  }, [startPoint]);

  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    isPaused,
    birdPosition,
    taxiPosition,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    resetAnimation
  };
};