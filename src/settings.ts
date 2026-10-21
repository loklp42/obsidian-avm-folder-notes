import type { Language } from './i18n';

export type HighlightStyle = 'accent-dot' | 'accent-text' | 'accent-badge' | 'accent-underline' | 'none';

export interface IconItemConfig {
	icon: string;
	color?: string;
}

export interface AvmFolderNotesSettings {
	language: Language;

	// Folder notes
	noteNameType: 'inside_folder_same_name' | 'inside_folder_index';
	indexFileName: string;
	markFolderWithNote: boolean;
	highlightStyle: HighlightStyle;
	autoRenameNote: boolean;

	// Custom icons folder path
	customIconsFolder: string;

	// Icon target scopes
	enableFolderIcons: boolean;
	enableFileIcons: boolean;
	enableTabIcons: boolean;
	enableTitleIcons: boolean;
	enableBookmarksIcons: boolean;
	enableRibbonIcons: boolean;

	// Assigned icons store: path / id -> { icon, color }
	icons: Record<string, IconItemConfig>;
}

export const DEFAULT_SETTINGS: AvmFolderNotesSettings = {
	language: 'ru',

	noteNameType: 'inside_folder_same_name',
	indexFileName: 'index',
	markFolderWithNote: true,
	highlightStyle: 'accent-dot',
	autoRenameNote: false,

	customIconsFolder: '99_system/media/icons',

	enableFolderIcons: true,
	enableFileIcons: true,
	enableTabIcons: true,
	enableTitleIcons: true,
	enableBookmarksIcons: true,
	enableRibbonIcons: true,

	icons: {},
};
