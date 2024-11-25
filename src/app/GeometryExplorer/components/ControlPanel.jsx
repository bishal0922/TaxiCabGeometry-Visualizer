import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bird, 
  Car, 
  Play, 
  Pause,
  RotateCcw, 
  ArrowRight,
  LayoutGrid,
  PanelRightOpen
} from 'lucide-react';

export const ControlPanel = ({ 
  showTheory,
  setShowTheory,
  activeGeometry,
  setActiveGeometry,
  showGrid,
  setShowGrid,
  isAnimating,
  isPaused,
  startAnimation,
  pauseAnimation,
  resumeAnimation,
  resetAnimation
}) => {
  const renderTooltip = (text) => (
    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {text}
    </span>
  );

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Path Type Controls */}
      <div className="flex gap-1">
        <Button
          variant={activeGeometry === 'euclidean' ? "default" : "outline"}
          onClick={() => !isAnimating && setActiveGeometry('euclidean')}
          className="relative group"
          size="sm"
          disabled={isAnimating}
        >
          <Bird className="w-3 h-3 mr-1" />
          Flight
          {renderTooltip('Direct flight path')}
        </Button>
        <Button
          variant={activeGeometry === 'taxicab' ? "default" : "outline"}
          onClick={() => !isAnimating && setActiveGeometry('taxicab')}
          className="relative group"
          size="sm"
          disabled={isAnimating}
        >
          <Car className="w-3 h-3 mr-1" />
          Street
          {renderTooltip('Street grid path')}
        </Button>
        <Button
          variant={activeGeometry === 'both' ? "default" : "outline"}
          onClick={() => !isAnimating && setActiveGeometry('both')}
          className="relative group"
          size="sm"
          disabled={isAnimating}
        >
          <ArrowRight className="w-3 h-3 mr-1" />
          Compare
          {renderTooltip('Show both paths')}
        </Button>
      </div>

      {/* Grid Control */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowGrid(!showGrid)}
          className={`h-7 w-7 relative group ${showGrid ? 'bg-slate-100' : ''}`}
        >
          <LayoutGrid className="w-3 h-3" />
          {renderTooltip('Toggle Grid')}
        </Button>
      </div>

      {/* Animation Controls */}
      <div className="ml-auto flex gap-1">
        {!isAnimating ? (
          <Button
            variant="default"
            size="sm"
            onClick={startAnimation}
            className="relative group"
          >
            <Play className="w-3 h-3 mr-1" />
            Start
            {renderTooltip('Start Animation')}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 relative group"
              onClick={isPaused ? resumeAnimation : pauseAnimation}
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {renderTooltip(isPaused ? 'Resume' : 'Pause')}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 relative group"
              onClick={resetAnimation}
            >
              <RotateCcw className="w-3 h-3" />
              {renderTooltip('Reset')}
            </Button>
          </>
        )}
      </div>

      {/* Theory Panel Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowTheory(!showTheory)}
        className="h-7 w-7 relative group"
      >
        <PanelRightOpen className="w-3 h-3" />
        {renderTooltip('Show/Hide Theory')}
      </Button>
    </div>
  );
};
