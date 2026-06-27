// ============================================================
// ESTADO GLOBAL
// ============================================================
export const state = {
  sb: null,
  ME: null,
  SETS: null,
  MATCHES: [],
  IS_ADMIN: false,
  CUR_SCREEN: 'predictions',
  ADM_TAB: 'matches',
  DET_MATCH: 1,
  ALL_PREDICTIONS: [],
  ALL_PLAYERS: []
};

/**
 * Resetea el estado a valores iniciales (logout)
 */
export function resetState() {
  state.ME = null;
  state.SETS = null;
  state.MATCHES = [];
  state.IS_ADMIN = false;
  state.ALL_PREDICTIONS = [];
  state.ALL_PLAYERS = [];
}
