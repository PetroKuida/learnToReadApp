/**
 * SettingsContext — global sound, music, and vibration preferences.
 *
 * State is loaded from AsyncStorage once on mount (via settingsStorage).
 * Each toggle flips state in memory immediately and writes to storage
 * in the background — the UI never waits for the write to complete.
 *
 * Components should use the useSettings() hook, not useContext directly.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { readSetting, writeSetting, KEYS } from '../utils/settingsStorage';

const SettingsContext = createContext({
  isSoundEnabled: true,
  isMusicEnabled: true,
  isVibrationEnabled: true,
  toggleSound: () => {},
  toggleMusic: () => {},
  toggleVibration: () => {},
});

export function SettingsProvider({ children }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);

  // Load all three settings in parallel on mount
  useEffect(() => {
    Promise.all([
      readSetting(KEYS.SOUND),
      readSetting(KEYS.MUSIC),
      readSetting(KEYS.VIBRATION),
    ])
      .then(([sound, music, vibration]) => {
        setIsSoundEnabled(sound);
        setIsMusicEnabled(music);
        setIsVibrationEnabled(vibration);
      })
      .catch((error) => {
        // Fall back to all-true defaults — app remains usable
        console.error('[SettingsContext] Failed to load settings:', error);
      });
  }, []);

  function toggleSound() {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    // Fire-and-forget — log errors inside writeSetting, never throw
    writeSetting(KEYS.SOUND, next);
  }

  function toggleMusic() {
    const next = !isMusicEnabled;
    setIsMusicEnabled(next);
    writeSetting(KEYS.MUSIC, next);
  }

  function toggleVibration() {
    const next = !isVibrationEnabled;
    setIsVibrationEnabled(next);
    writeSetting(KEYS.VIBRATION, next);
  }

  return (
    <SettingsContext.Provider
      value={{
        isSoundEnabled,
        isMusicEnabled,
        isVibrationEnabled,
        toggleSound,
        toggleMusic,
        toggleVibration,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Convenience hook — use instead of useContext(SettingsContext) directly.
 *
 * @returns {{ isSoundEnabled: boolean, isMusicEnabled: boolean, isVibrationEnabled: boolean,
 *             toggleSound: function, toggleMusic: function, toggleVibration: function }}
 */
export function useSettings() {
  return useContext(SettingsContext);
}
