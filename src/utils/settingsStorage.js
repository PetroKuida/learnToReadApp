/**
 * Settings persistence layer — the only place in the codebase that calls AsyncStorage.
 *
 * All other modules (SettingsContext, components) call readSetting / writeSetting here.
 * This boundary makes storage easy to mock in tests and easy to swap in the future.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Storage key constants — import these instead of writing the raw strings */
export const KEYS = {
  SOUND:     '@settings/sound',
  MUSIC:     '@settings/music',
  VIBRATION: '@settings/vibration',
};

/**
 * Read a boolean setting from storage.
 *
 * Returns `true` by default if the key has never been set or if the stored
 * value cannot be parsed (e.g. corrupt data after an app update).
 *
 * @param {string} key - One of the KEYS constants
 * @returns {Promise<boolean>}
 */
export async function readSetting(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      // Key not found — first run or key was removed
      return true;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[settingsStorage] Failed to read key "${key}":`, error);
    return true;
  }
}

/**
 * Persist a boolean setting to storage.
 *
 * Write errors are logged but not re-thrown — the in-memory state in
 * SettingsContext remains the source of truth for the current session.
 *
 * @param {string} key   - One of the KEYS constants
 * @param {boolean} value
 * @returns {Promise<void>}
 */
export async function writeSetting(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[settingsStorage] Failed to write key "${key}":`, error);
  }
}
