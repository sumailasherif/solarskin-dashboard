// Code in this package is used by more than one part of the project.
// Keeping it in ONE place means the backend, the simulator and (later) the
// frontend can never disagree about things like the reading format.
//
// Milestone 4 adds the zod schema for a sensor reading here.

/** Product name shown in the UI and API responses. */
export const APP_NAME = 'SolarSkin';

/**
 * Timezone used to DISPLAY times (Fergana, Uzbekistan = UTC+5, no daylight saving).
 * We always STORE times in UTC and only convert when showing them to people.
 */
export const DISPLAY_TIMEZONE = 'Asia/Tashkent';

/** All API routes start with this prefix, e.g. /api/v1/health */
export const API_PREFIX = '/api/v1';
