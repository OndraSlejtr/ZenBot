import { WowAuditRaider } from "./zod/schema";

export const findRaider = (raiders: WowAuditRaider[], characterName: string): WowAuditRaider | null => {
  return raiders.find((raider) => raider.name === characterName) || null;
};
