import { settingsApi, UpsertSettingPayload } from './settings';

export interface PrivacyContent {
  privacyPolicy: string;
  termsOfService: string;
  lastUpdated: string;
}

function mapSettingsToContent(settings: { key: string; value: string }[]): PrivacyContent {
  const map: Record<string, string> = {};
  settings.forEach((s) => {
    map[s.key] = s.value;
  });
  return {
    privacyPolicy: map.privacyPolicy || '',
    termsOfService: map.termsOfService || '',
    lastUpdated: map.lastUpdated || '',
  };
}

function mapContentToPayload(content: PrivacyContent): UpsertSettingPayload[] {
  return [
    { key: 'privacyPolicy', value: content.privacyPolicy, category: 'privacy' },
    { key: 'termsOfService', value: content.termsOfService, category: 'privacy' },
    { key: 'lastUpdated', value: content.lastUpdated, category: 'privacy' },
  ];
}

export const privacyApi = {
  getContent: async (): Promise<PrivacyContent> => {
    const settings = await settingsApi.getByCategory('privacy');
    return mapSettingsToContent(settings);
  },
  saveContent: async (content: PrivacyContent) => {
    const payload = mapContentToPayload(content);
    return settingsApi.bulkUpdate(payload);
  },
};