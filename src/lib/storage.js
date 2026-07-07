const STORAGE_KEY = 'viajeGraph';

export function getViajeGraph() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setViajeGraph(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function hasViajeGraph() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}