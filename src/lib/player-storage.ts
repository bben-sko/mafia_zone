const ID_KEY = 'mafia_playerId';
const NAME_KEY = 'mafia_playerName';

export function savePlayer(id: string, name: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ID_KEY, id);
    localStorage.setItem(NAME_KEY, name);
  } catch {}
}

export function getSavedPlayer(): { id: string | null; name: string | null } {
  if (typeof window === 'undefined') return { id: null, name: null };
  try {
    return {
      id: localStorage.getItem(ID_KEY),
      name: localStorage.getItem(NAME_KEY),
    };
  } catch {
    return { id: null, name: null };
  }
}

export function clearPlayer() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ID_KEY);
    localStorage.removeItem(NAME_KEY);
  } catch {}
}
