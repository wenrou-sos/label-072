export const calculateDistance = (
  p1: [number, number],
  p2: [number, number]
): number => {
  const R = 6371;
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getPolygonCenter = (coords: [number, number][]): [number, number] => {
  const n = coords.length;
  let lat = 0;
  let lng = 0;
  coords.forEach((c) => {
    lat += c[0];
    lng += c[1];
  });
  return [lat / n, lng / n];
};

export const interpolatePosition = (
  start: [number, number],
  end: [number, number],
  t: number
): [number, number] => {
  return [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t];
};

export const generateTrackPoints = (
  machineId: string,
  startPos: [number, number],
  endPos: [number, number],
  steps: number = 50
): { machineId: string; timestamp: number; position: [number, number]; speed: number; fuel: number }[] => {
  const points = [];
  const now = Date.now();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const pos: [number, number] = [
      startPos[0] + (endPos[0] - startPos[0]) * t + Math.sin(t * Math.PI * 4) * 0.001,
      startPos[1] + (endPos[1] - startPos[1]) * t + Math.cos(t * Math.PI * 3) * 0.0008,
    ];
    points.push({
      machineId,
      timestamp: now - (steps - i) * 60000,
      position: pos,
      speed: 3 + Math.random() * 4,
      fuel: 80 - t * 30 - Math.random() * 5,
    });
  }
  return points;
};
