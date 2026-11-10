/** Configure only custom emoji IDs you own/control. Missing assets always use Unicode fallback. */
export const emojiManifest = {
  branding:['⚡','👑','✨'], loading:['🔄','⏳'], scanning:['🔍'], active:['🟢'], inactive:['🔴'], atRisk:['🟡'], ticket:['🎫'],
  success:['✅'], approved:['🟢'], rejected:['❌'], security:['🛡️'], owner:['👑'], reports:['📊'], performance:['🚀'], notifications:['🔔'], database:['💾'], health:['💜'], premium:['💎'], error:['🚨'], work:['⚙️']
} as const;
export type EmojiKey = keyof typeof emojiManifest;
export function emoji(key: EmojiKey, customIds: Partial<Record<EmojiKey,string>> = {}): string {
  const id=customIds[key]; return id && /^\d{17,20}$/.test(id) ? `<a:${key}:${id}>` : emojiManifest[key][0];
}
