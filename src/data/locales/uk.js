/**
 * Ukrainian locale — strings and letter data for the Chytaychik app.
 *
 * All 33 letters of the modern Ukrainian alphabet in canonical alphabetical order:
 * А Б В Г Ґ Д Е Є Ж З И І Ї Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ь Ю Я
 *
 * Letters without a real recording reference STUB_AUDIO_FILE.
 * Swap individual audioFile values to the real file once recordings are ready —
 * no component changes required.
 */

/** Placeholder audio used until real letter recordings are provided */
export const STUB_AUDIO_FILE = 'stub.mp3';

export default {
  id: 'uk',
  languageName: 'Українська',

  strings: {
    appName: 'Читайчик',
    settingsTitle: 'Налаштування',
    aboutTitle: 'Про застосунок',
    soundLabel: 'Звук',
    musicLabel: 'Музика',
    vibrationLabel: 'Вібрація',
    confirmStay: '✋',
    confirmMenu: '🏠',
    aboutDescription:
      'Читайчик — застосунок для дітей віком 4–7 років, який допомагає вивчати українські літери та їхню вимову.',
    versionLabel: 'Версія',
  },

  letters: [
    { id: 'uk_a',    upper: 'А', lower: 'а', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_b',    upper: 'Б', lower: 'б', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_v',    upper: 'В', lower: 'в', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_h',    upper: 'Г', lower: 'г', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_g',    upper: 'Ґ', lower: 'ґ', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_d',    upper: 'Д', lower: 'д', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_e',    upper: 'Е', lower: 'е', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_ye',   upper: 'Є', lower: 'є', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_zh',   upper: 'Ж', lower: 'ж', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_z',    upper: 'З', lower: 'з', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_y',    upper: 'И', lower: 'и', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_i',    upper: 'І', lower: 'і', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_yi',   upper: 'Ї', lower: 'ї', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_j',    upper: 'Й', lower: 'й', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_k',    upper: 'К', lower: 'к', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_l',    upper: 'Л', lower: 'л', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_m',    upper: 'М', lower: 'м', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_n',    upper: 'Н', lower: 'н', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_o',    upper: 'О', lower: 'о', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_p',    upper: 'П', lower: 'п', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_r',    upper: 'Р', lower: 'р', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_s',    upper: 'С', lower: 'с', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_t',    upper: 'Т', lower: 'т', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_u',    upper: 'У', lower: 'у', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_f',    upper: 'Ф', lower: 'ф', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_kh',   upper: 'Х', lower: 'х', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_ts',   upper: 'Ц', lower: 'ц', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_ch',   upper: 'Ч', lower: 'ч', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_sh',   upper: 'Ш', lower: 'ш', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_shch', upper: 'Щ', lower: 'щ', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_soft', upper: 'Ь', lower: 'ь', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_yu',   upper: 'Ю', lower: 'ю', audioFile: STUB_AUDIO_FILE },
    { id: 'uk_ya',   upper: 'Я', lower: 'я', audioFile: STUB_AUDIO_FILE },
  ],
};
