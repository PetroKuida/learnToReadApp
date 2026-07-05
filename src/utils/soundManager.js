/**
 * soundManager — the only place in the codebase that touches expo-audio.
 *
 * Two independent channels:
 *   sfx   — one-shot sounds (letter pronunciation, pop SFX)
 *   music — looping background track
 *
 * Settings values (isSoundEnabled, isMusicEnabled) are passed as arguments
 * by the caller so this file stays a pure utility with no React context dependency.
 * That makes it easy to unit-test without any React setup.
 */
import { createAudioPlayer } from 'expo-audio';

// Module-level player references — one per channel
let _sfxPlayer = null;
let _musicPlayer = null;

/**
 * Play a one-shot letter or SFX sound.
 *
 * If a sound is already playing on the sfx channel, the existing player is
 * released and a fresh one is created — this restarts from the beginning.
 *
 * Audio file is resolved from /src/assets/audio/letters/<filename>.
 * If filename is falsy the stub placeholder is used instead.
 *
 * @param {string} filename       - e.g. 'uk_a.mp3' or 'pop.mp3'
 * @param {boolean} isSoundEnabled
 */
export async function playSfx(filename, isSoundEnabled) {
  if (!isSoundEnabled) return;

  try {
    // Release previous sfx player if one exists
    if (_sfxPlayer) {
      _sfxPlayer.remove();
      _sfxPlayer = null;
    }

    // Resolve the audio source — fall back to stub if filename is falsy
    const source = filename
      ? getLetterAudioSource(filename)
      : require('../assets/audio/stub.mp3');

    _sfxPlayer = createAudioPlayer(source);
    _sfxPlayer.play();
  } catch (error) {
    console.error(`[soundManager] playSfx failed for "${filename}":`, error);
    // Never throw — a missing audio file must not crash the app
  }
}

/**
 * Load and loop a background music track.
 *
 * @param {string} filename       - e.g. 'background.mp3'
 * @param {boolean} isMusicEnabled
 */
export async function playMusic(filename, isMusicEnabled) {
  if (!isMusicEnabled) return;

  try {
    if (_musicPlayer) {
      _musicPlayer.remove();
      _musicPlayer = null;
    }

    const source = getMusicAudioSource(filename);
    _musicPlayer = createAudioPlayer(source);
    _musicPlayer.loop = true;
    _musicPlayer.play();
  } catch (error) {
    console.error(`[soundManager] playMusic failed for "${filename}":`, error);
  }
}

/**
 * Stop and release the background music player.
 */
export function stopMusic() {
  if (_musicPlayer) {
    try {
      _musicPlayer.pause();
      _musicPlayer.remove();
    } catch (error) {
      console.error('[soundManager] stopMusic failed:', error);
    } finally {
      _musicPlayer = null;
    }
  }
}

/**
 * Pause the background music player (keeps it loaded).
 */
export function pauseMusic() {
  if (_musicPlayer) {
    try {
      _musicPlayer.pause();
    } catch (error) {
      console.error('[soundManager] pauseMusic failed:', error);
    }
  }
}

/**
 * Resume the background music player if music is enabled.
 *
 * @param {boolean} isMusicEnabled
 */
export function resumeMusic(isMusicEnabled) {
  if (!isMusicEnabled) return;
  if (_musicPlayer) {
    try {
      _musicPlayer.play();
    } catch (error) {
      console.error('[soundManager] resumeMusic failed:', error);
    }
  }
}

// ---------------------------------------------------------------------------
// Internal helpers — map filenames to require() calls.
//
// Metro bundler requires static require() paths — we cannot build a dynamic
// path string and pass it to require() at runtime. The approach below maps
// known filenames to their static require() at module load time.
// Any filename not in the map falls back to stub.mp3.
// ---------------------------------------------------------------------------

const LETTER_AUDIO_MAP = {
  'stub.mp3':    require('../assets/audio/stub.mp3'),
  'uk_a.mp3':   require('../assets/audio/stub.mp3'),
  'uk_b.mp3':   require('../assets/audio/stub.mp3'),
  'uk_v.mp3':   require('../assets/audio/stub.mp3'),
  'uk_h.mp3':   require('../assets/audio/stub.mp3'),
  'uk_g.mp3':   require('../assets/audio/stub.mp3'),
  'uk_d.mp3':   require('../assets/audio/stub.mp3'),
  'uk_e.mp3':   require('../assets/audio/stub.mp3'),
  'uk_ye.mp3':  require('../assets/audio/stub.mp3'),
  'uk_zh.mp3':  require('../assets/audio/stub.mp3'),
  'uk_z.mp3':   require('../assets/audio/stub.mp3'),
  'uk_y.mp3':   require('../assets/audio/stub.mp3'),
  'uk_i.mp3':   require('../assets/audio/stub.mp3'),
  'uk_yi.mp3':  require('../assets/audio/stub.mp3'),
  'uk_j.mp3':   require('../assets/audio/stub.mp3'),
  'uk_k.mp3':   require('../assets/audio/stub.mp3'),
  'uk_l.mp3':   require('../assets/audio/stub.mp3'),
  'uk_m.mp3':   require('../assets/audio/stub.mp3'),
  'uk_n.mp3':   require('../assets/audio/stub.mp3'),
  'uk_o.mp3':   require('../assets/audio/stub.mp3'),
  'uk_p.mp3':   require('../assets/audio/stub.mp3'),
  'uk_r.mp3':   require('../assets/audio/stub.mp3'),
  'uk_s.mp3':   require('../assets/audio/stub.mp3'),
  'uk_t.mp3':   require('../assets/audio/stub.mp3'),
  'uk_u.mp3':   require('../assets/audio/stub.mp3'),
  'uk_f.mp3':   require('../assets/audio/stub.mp3'),
  'uk_kh.mp3':  require('../assets/audio/stub.mp3'),
  'uk_ts.mp3':  require('../assets/audio/stub.mp3'),
  'uk_ch.mp3':  require('../assets/audio/stub.mp3'),
  'uk_sh.mp3':  require('../assets/audio/stub.mp3'),
  'uk_shch.mp3':require('../assets/audio/stub.mp3'),
  'uk_soft.mp3':require('../assets/audio/stub.mp3'),
  'uk_yu.mp3':  require('../assets/audio/stub.mp3'),
  'uk_ya.mp3':  require('../assets/audio/stub.mp3'),
  'pop.mp3':    require('../assets/audio/stub.mp3'),
};

function getLetterAudioSource(filename) {
  return LETTER_AUDIO_MAP[filename] ?? require('../assets/audio/stub.mp3');
}

function getMusicAudioSource(filename) {
  // No music files yet — all fall back to stub
  return require('../assets/audio/stub.mp3');
}
