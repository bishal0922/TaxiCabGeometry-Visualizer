// src/app/GeometryExplorer/utils/pathfinding.js

/**
 * Creates a consistent street ID regardless of direction
 */
export const createStreetId = (x1, y1, x2, y2) => {
    // Ensure points are adjacent
    if (Math.abs(x2 - x1) + Math.abs(y2 - y1) !== 1) {
      console.error('Attempted to create street ID for non-adjacent points');
      return null;
    }
  
    // Standardize the order of points to ensure consistent IDs
    if (x1 === x2) {
      // Vertical street - order by y
      return `${x1},${Math.min(y1, y2)}-${x1},${Math.max(y1, y2)}`;
    } else {
      // Horizontal street - order by x
      return `${Math.min(x1, x2)},${y1}-${Math.max(x1, x2)},${y1}`;
    }
  };
  
  /**
   * Checks if a street between two adjacent points is blocked
   */
  const isStreetBlocked = (p1, p2, blockedStreets) => {
    const streetId = createStreetId(p1.x, p1.y, p2.x, p2.y);
    return streetId ? blockedStreets.has(streetId) : true; // If invalid street, consider it blocked
  };
  
  /**
   * Gets valid neighboring points that can be moved to
   */
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
      if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
        continue;
      }
  
      // Create new point
      const newPoint = { x: newX, y: newY };
  
      // Only add if the street isn't blocked
      if (!isStreetBlocked(point, newPoint, blockedStreets)) {
        neighbors.push(newPoint);
      }
    }
  
    return neighbors;
  };
  
  /**
   * Manhattan distance heuristic
   */
  const manhattanDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  
  /**
   * Finds a path between two points avoiding blocked streets using A* algorithm
   */
  export const findPath = (start, end, gridSize, blockedStreets) => {
    // Validate input
    if (!start || !end || gridSize <= 0 || !blockedStreets) {
      console.error('Invalid input to findPath');
      return null;
    }
  
    // If start and end are the same, return single point path
    if (start.x === end.x && start.y === end.y) {
      return [{ ...start }];
    }
  
    const startKey = `${start.x},${start.y}`;
    const endKey = `${end.x},${end.y}`;
    
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
      
      const [x, y] = currentKey.split(',').map(Number);
      const current = { x, y };
      
      // Check if we reached the end
      if (currentKey === endKey) {
        const path = [];
        let curr = currentKey;
        while (curr) {
          const [x, y] = curr.split(',').map(Number);
          path.unshift({ x, y });
          curr = cameFrom.get(curr);
        }
        return path;
      }
      
      openSet.delete(currentKey);
      
      // Check all valid neighbors
      for (const neighbor of getValidNeighbors(current, gridSize, blockedStreets)) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
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
  
    // No path found
    console.warn('No valid path found between points:', { start, end, blockedStreets: Array.from(blockedStreets) });
    return null;
  };