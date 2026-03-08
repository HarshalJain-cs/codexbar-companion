import logoCodex from '@/assets/logo-codex.png';
import logoClaude from '@/assets/logo-claude.png';
import logoCursor from '@/assets/logo-cursor.png';
import logoGemini from '@/assets/logo-gemini.png';
import logoCopilot from '@/assets/logo-copilot.png';
import { ProviderId } from '@/types';

export const providerLogos: Record<ProviderId, string> = {
  codex: logoCodex,
  claude: logoClaude,
  cursor: logoCursor,
  gemini: logoGemini,
  copilot: logoCopilot,
};
