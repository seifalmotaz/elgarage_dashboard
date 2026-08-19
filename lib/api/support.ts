import { settingsApi, UpsertSettingPayload } from './settings';

export interface SupportContent {
  title: string;
  email: string;
  phone: string;
  whatsapp: string;
  content: string;
}

function mapSettingsToContent(settings: { key: string; value: string }[]): SupportContent {
  const map: Record<string, string> = {};
  settings.forEach((s) => {
    map[s.key] = s.value;
  });
  return {
    title: map.title || '',
    email: map.email || '',
    phone: map.phone || '',
    whatsapp: map.whatsapp || '',
    content: map.content || '',
  };
}

function mapContentToPayload(content: SupportContent): UpsertSettingPayload[] {
  return [
    { key: 'title', value: content.title, category: 'support' },
    { key: 'email', value: content.email, category: 'support' },
    { key: 'phone', value: content.phone, category: 'support' },
    { key: 'whatsapp', value: content.whatsapp, category: 'support' },
    { key: 'content', value: content.content, category: 'support' },
  ];
}

export const supportApi = {
  getContent: async (): Promise<SupportContent> => {
    const settings = await settingsApi.getByCategory('support');
    return mapSettingsToContent(settings);
  },
  saveContent: async (content: SupportContent) => {
    const payload = mapContentToPayload(content);
    return settingsApi.bulkUpdate(payload);
  },
};