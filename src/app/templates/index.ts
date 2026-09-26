import type { TemplateConfig } from './types';
import { heroTemplate } from './hero';
import { announcementTemplate } from './announcement';
import { quoteTemplate } from './quote';
import { imageLedTemplate } from './image-led';

export const TEMPLATES: Record<string, TemplateConfig> = {
  hero: heroTemplate,
  announcement: announcementTemplate,
  quote: quoteTemplate,
  'image-led': imageLedTemplate,
};

export const TEMPLATE_LIST: TemplateConfig[] = Object.values(TEMPLATES);

export { type TemplateConfig } from './types';
export { FONT_PAIRINGS, FONT_PAIRING_LIST, getPairing } from './fonts';
export type { FontPairingId, FontPairing } from './fonts';
