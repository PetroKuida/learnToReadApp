/**
 * Unit tests for src/utils/soundManager.js
 *
 * expo-audio is mocked entirely — no real audio hardware needed.
 * Each test resets the module between runs to clear module-level player state.
 */

// Mock expo-audio before any imports
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(),
}));

// Mock all audio asset requires to return a stable value
jest.mock('../../src/assets/audio/stub.mp3', () => 1, { virtual: true });

import { createAudioPlayer } from 'expo-audio';

// Helper: build a fresh mock player object
function makeMockPlayer() {
  return {
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    loop: false,
  };
}

// Reset module state and mocks between each test
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// playSfx
// ---------------------------------------------------------------------------

describe('playSfx', () => {
  test('does NOT call createAudioPlayer when isSoundEnabled is false', async () => {
    const { createAudioPlayer } = require('expo-audio');
    const { playSfx } = require('../../src/utils/soundManager');

    await playSfx('uk_a.mp3', false);

    expect(createAudioPlayer).not.toHaveBeenCalled();
  });

  test('calls createAudioPlayer and play() when isSoundEnabled is true', async () => {
    const { createAudioPlayer } = require('expo-audio');
    const mockPlayer = makeMockPlayer();
    createAudioPlayer.mockReturnValue(mockPlayer);

    const { playSfx } = require('../../src/utils/soundManager');

    await playSfx('uk_a.mp3', true);

    expect(createAudioPlayer).toHaveBeenCalledTimes(1);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });

  test('calls remove() on existing player and creates a new one on repeat call', async () => {
    const { createAudioPlayer } = require('expo-audio');
    const firstPlayer = makeMockPlayer();
    const secondPlayer = makeMockPlayer();
    createAudioPlayer
      .mockReturnValueOnce(firstPlayer)
      .mockReturnValueOnce(secondPlayer);

    const { playSfx } = require('../../src/utils/soundManager');

    await playSfx('uk_a.mp3', true);
    await playSfx('uk_b.mp3', true);

    // First player must be released before second is created
    expect(firstPlayer.remove).toHaveBeenCalledTimes(1);
    expect(createAudioPlayer).toHaveBeenCalledTimes(2);
    expect(secondPlayer.play).toHaveBeenCalledTimes(1);
  });

  test('does not throw when createAudioPlayer throws (missing file simulation)', async () => {
    const { createAudioPlayer } = require('expo-audio');
    createAudioPlayer.mockImplementation(() => {
      throw new Error('File not found');
    });

    const { playSfx } = require('../../src/utils/soundManager');

    // Must not throw — missing audio must never crash the app
    await expect(playSfx('missing.mp3', true)).resolves.not.toThrow();
  });

  test('uses stub when filename is falsy', async () => {
    const { createAudioPlayer } = require('expo-audio');
    const mockPlayer = makeMockPlayer();
    createAudioPlayer.mockReturnValue(mockPlayer);

    const { playSfx } = require('../../src/utils/soundManager');

    await playSfx(null, true);

    expect(createAudioPlayer).toHaveBeenCalledTimes(1);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// playMusic
// ---------------------------------------------------------------------------

describe('playMusic', () => {
  test('does NOT call createAudioPlayer when isMusicEnabled is false', async () => {
    const { createAudioPlayer } = require('expo-audio');
    const { playMusic } = require('../../src/utils/soundManager');

    await playMusic('background.mp3', false);

    expect(createAudioPlayer).not.toHaveBeenCalled();
  });

  test('sets loop = true and calls play() when isMusicEnabled is true', async () => {
    const { createAudioPlayer } = require('expo-audio');
    const mockPlayer = makeMockPlayer();
    createAudioPlayer.mockReturnValue(mockPlayer);

    const { playMusic } = require('../../src/utils/soundManager');

    await playMusic('background.mp3', true);

    expect(mockPlayer.loop).toBe(true);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// stopMusic / pauseMusic / resumeMusic
// ---------------------------------------------------------------------------

describe('stopMusic', () => {
  test('calls pause() and remove() on the music player', async () => {
    const { createAudioPlayer } = require('expo-audio');
    const mockPlayer = makeMockPlayer();
    createAudioPlayer.mockReturnValue(mockPlayer);

    const { playMusic, stopMusic } = require('../../src/utils/soundManager');

    await playMusic('background.mp3', true);
    stopMusic();

    expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
    expect(mockPlayer.remove).toHaveBeenCalledTimes(1);
  });

  test('does nothing when no music player exists', () => {
    const { stopMusic } = require('../../src/utils/soundManager');
    // Should not throw
    expect(() => stopMusic()).not.toThrow();
  });
});

describe('pauseMusic', () => {
  test('calls pause() on the music player', async () => {
    const { createAudioPlayer } = require('expo-audio');
    const mockPlayer = makeMockPlayer();
    createAudioPlayer.mockReturnValue(mockPlayer);

    const { playMusic, pauseMusic } = require('../../src/utils/soundManager');

    await playMusic('background.mp3', true);
    pauseMusic();

    expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
  });
});

describe('resumeMusic', () => {
  test('calls play() on the music player when isMusicEnabled is true', async () => {
    const { createAudioPlayer } = require('expo-audio');
    const mockPlayer = makeMockPlayer();
    createAudioPlayer.mockReturnValue(mockPlayer);

    const { playMusic, resumeMusic } = require('../../src/utils/soundManager');

    await playMusic('background.mp3', true);
    mockPlayer.play.mockClear(); // reset call count after initial play
    resumeMusic(true);

    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });

  test('does NOT call play() when isMusicEnabled is false', async () => {
    const { createAudioPlayer } = require('expo-audio');
    const mockPlayer = makeMockPlayer();
    createAudioPlayer.mockReturnValue(mockPlayer);

    const { playMusic, resumeMusic } = require('../../src/utils/soundManager');

    await playMusic('background.mp3', true);
    mockPlayer.play.mockClear();
    resumeMusic(false);

    expect(mockPlayer.play).not.toHaveBeenCalled();
  });
});
