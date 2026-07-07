const STORAGE_KEY = 'viajeData';

export function getViajeData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setViajeData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function hasViajeData() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}