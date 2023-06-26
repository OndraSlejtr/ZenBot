export interface Raider {
  characters: string[];
  discord: string;
  ignoreSignups?: boolean;
}

// Idea: Take this from WowAudit note (Discord ID), along with ignore (simply parse string, OR just dont fill in name)

const raiders: Raider[] = [
  { characters: ['Aeonar'], discord: 'cynique.' },
  { characters: ['Dreamoon'], discord: 'erdmoon' },
  { characters: ['Samarae'], discord: '', ignoreSignups: true },
];

export const mapToDiscordUsername = (characterName: string): string | null => {
  return raiders.find((guildie) => guildie.characters.includes(characterName))?.discord || null;
};

export const findRaider = (characterName: string): Raider | null => {
  return raiders.find((guildie) => guildie.characters.includes(characterName)) || null;
};
