// src/app/GeometryExplorer/utils/pathfinding.js

const getValidNeighbors = (point, gridSize, blockedStreets) => {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: 1 },  // down
      { dx: 0, dy: -1 }, // up
      { dx: 1, dy: 0 },  // right
      { dx: -1, dy: 0 }  // left
    ];
  
    for (const { dx, dy } of directions) {
      const newX = point.x + dx;
      const newY = point.y + dy;
  
      // Check grid boundaries
      if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) continue;
  
      // Create street ID to check if blocked
      // Important: Ensure consistent ordering of coordinates
      const streetId = dx !== 0
        ? `${Math.min(point.x, newX)},${point.y}-${Math.max(point.x, newX)},${point.y}`
        : `${point.x},${Math.min(point.y, newY)}-${point.x},${Math.max(point.y, newY)}`;
  
      // Add neighbor if street is not blocked
      if (!blockedStreets.has(streetId)) {
        neighbors.push({ x: newX, y: newY });
      }
    }
  
    return neighbors;
  };
  
  // Manhattan distance heuristic
  const manhattanDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  
  export const findPath = (start, end, gridSize, blockedStreets) => {
    // If start and end are the same, return single point path
    if (start.x === end.x && start.y === end.y) {
      return [{ ...start }];
    }
  
    const startKey = JSON.stringify(start);
    const endKey = JSON.stringify(end);
    
    const openSet = new Set([startKey]);
    const cameFrom = new Map();
    
    // Track costs
    const gScore = new Map([[startKey, 0]]);
    const fScore = new Map([[startKey, manhattanDistance(start, end)]]);
  
    while (openSet.size > 0) {
      // Find node with lowest fScore
      let currentKey = null;
      let lowestFScore = Infinity;
      
      for (const key of openSet) {
        const score = fScore.get(key) ?? Infinity;
        if (score < lowestFScore) {
          lowestFScore = score;
          currentKey = key;
        }
      }
  
      if (!currentKey) break;
      
      const current = JSON.parse(currentKey);
      
      // Check if we reached the end
      if (currentKey === endKey) {
        const path = [];
        let curr = currentKey;
        while (curr) {
          path.unshift(JSON.parse(curr));
          curr = cameFrom.get(curr);
        }
        return path;
      }
      
      openSet.delete(currentKey);
      
      // Check all valid neighbors
      for (const neighbor of getValidNeighbors(current, gridSize, blockedStreets)) {
        const neighborKey = JSON.stringify(neighbor);
        const tentativeGScore = (gScore.get(currentKey) ?? Infinity) + 1;
        
        if (tentativeGScore < (gScore.get(neighborKey) ?? Infinity)) {
          // This path is better, record it
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + manhattanDistance(neighbor, end));
          openSet.add(neighborKey);
        }
      }
    }
    
    // Add logging to help debug path finding issues
    console.log('Path finding failed:', {
      start,
      end,
      gridSize,
      blockedStreets: Array.from(blockedStreets)
    });
    
    return null; // No path found
  };