/**
 * Save data to localStorage
 * @param key - The key under which the data will be stored
 * @param value - The data to store (will be stringified)
 */
export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
}

/**
 * Retrieve data from localStorage
 * @param key - The key to retrieve data from
 * @returns The parsed data or null if not found
 */
export function getFromLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(`Error retrieving from localStorage: ${error}`);
    return null;
  }
}

/**
 * Remove data from localStorage
 * @param key - The key of the data to remove
 */
export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`);
  }
}

/**
 * Clear all data from localStorage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
}
