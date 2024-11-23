import { useState, useRef, useCallback } from 'react';

export const useAnimation = (startPoint, endPoint, activeGeometry) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [birdPosition, setBirdPosition] = useState({ ...startPoint });
  const [taxiPosition, setTaxiPosition] = useState({ ...startPoint });
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(null);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setIsPaused(false);
    setBirdPosition({ ...startPoint });
    setTaxiPosition({ ...startPoint });
    startTimeRef.current = Date.now();
    animate();
  }, [startPoint]);

  const animate = useCallback(() => {
    const duration = 3000; // 3 seconds
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
  }, [startPoint, endPoint, activeGeometry]);

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
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [startPoint]);

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
