import { settingsApi, UpsertSettingPayload } from './settings';

export interface GeneralSettings {
  platformName: string;
  defaultLanguage: string;
  maintenanceMode: string;
  defaultPaginationLimit: string;
}

function mapSettingsToContent(settings: { key: string; value: string }[]): GeneralSettings {
  const map: Record<string, string> = {};
  settings.forEach((s) => {
    map[s.key] = s.value;
  });
  return {
    platformName: map.platformName || '',
    defaultLanguage: map.defaultLanguage || 'ar',
    maintenanceMode: map.maintenanceMode || 'false',
    defaultPaginationLimit: map.defaultPaginationLimit || '20',
  };
}

function mapContentToPayload(content: GeneralSettings): UpsertSettingPayload[] {
  return [
    { key: 'platformName', value: content.platformName, category: 'general' },
    { key: 'defaultLanguage', value: content.defaultLanguage, category: 'general' },
    { key: 'maintenanceMode', value: content.maintenanceMode, category: 'general' },
    { key: 'defaultPaginationLimit', value: content.defaultPaginationLimit, category: 'general' },
  ];
}

export const generalSettingsApi = {
  getSettings: async (): Promise<GeneralSettings> => {
    const settings = await settingsApi.getByCategory('general');
    return mapSettingsToContent(settings);
  },
  saveSettings: async (content: GeneralSettings) => {
    const payload = mapContentToPayload(content);
    return settingsApi.bulkUpdate(payload);
  },
};