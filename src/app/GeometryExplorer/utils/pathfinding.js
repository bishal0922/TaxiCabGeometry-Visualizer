export const getTaxicabPath = (start, end) => {
  const path = [];
  let current = { ...start };
  path.push({ ...current });

  // First move horizontally
  while (current.x !== end.x) {
    current.x += current.x < end.x ? 1 : -1;
    path.push({ ...current });
  }

  // Then move vertically
  while (current.y !== end.y) {
    current.y += current.y < end.y ? 1 : -1;
    path.push({ ...current });
  }

  return path;
};