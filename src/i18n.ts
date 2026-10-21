export type Language = 'ru' | 'en';

export interface TranslationDict {
	headerTitle: string;
	headerDesc: string;
	langSelectLabel: string;
	btnQuickAction: string;

	// Folder Notes
	sectionFolderNotes: string;
	namingStrategyName: string;
	namingStrategyDesc: string;
	namingStrategySameName: string;
	namingStrategyIndex: string;
	indexFileNameTitle: string;
	indexFileNameDesc: string;
	markFolderTitle: string;
	markFolderDesc: string;
	highlightStyleTitle: string;
	highlightStyleDesc: string;
	styleDot: string;
	styleText: string;
	styleBadge: string;
	styleUnderline: string;
	previewLabel: string;
	previewText: string;
	autoRenameTitle: string;
	autoRenameDesc: string;

	// Icons / Navigation
	sectionIcons: string;
	iconsFolderTitle: string;
	iconsFolderDesc: string;

	// Scope labels
	scopeFolderTree: string;
	scopeFileTree: string;
	scopeTabs: string;
	scopeInlineTitle: string;
	scopeBookmarks: string;
	scopeRibbon: string;
	scopeToggleDesc: string;

	// Custom Upload UI
	uploadSectionTitle: string;
	uploadBtnText: string;
	uploadSuccess: string;
	uploadFailed: string;
	iconDeleted: string;
	noCustomIcons: string;

	// Menu & Actions
	menuOpenNote: string;
	menuCreateNote: string;
	menuChangeIcon: string;
	menuResetIcon: string;
	noticeIconSet: string;
	noticeIconReset: string;
	noticeNoteCreated: string;
	searchPlaceholder: string;
	badgeCustom: string;

	donateHeading: string;
	donateTitle: string;
	donateDesc: string;
	donateBtn: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
	ru: {
		headerTitle: 'AVM Folder Notes',
		headerDesc: 'Управление структурой папок-документов и векторными иконками проводника, вкладок, заголовков и закладок в экосистеме Ave Maria.',
		langSelectLabel: 'Язык:',
		btnQuickAction: 'Пересканировать иконки',

		sectionFolderNotes: 'Структура папок-заметок',
		namingStrategyName: 'Стратегия именования',
		namingStrategyDesc: 'Определяет формат имени документа, привязанного к папке.',
		namingStrategySameName: 'Имя папки (Папка/Папка.md)',
		namingStrategyIndex: 'Индексный файл (Папка/index.md)',
		indexFileNameTitle: 'Имя индексного файла',
		indexFileNameDesc: 'Название файла без расширения .md внутри папки.',
		markFolderTitle: 'Индикация папки с заметкой',
		markFolderDesc: 'Отображать визуальный маркер у папок, имеющих привязанную заметку.',
		highlightStyleTitle: 'Стиль индикатора',
		highlightStyleDesc: 'Выберите визуальный тип подсветки папки в проводнике.',
		styleDot: 'Золотая точка (Акцентная марка)',
		styleText: 'Цвет названия (Золотой заголовок)',
		styleBadge: 'Мини-бейдж [DOC]',
		styleUnderline: 'Тонкое подчеркивание',
		previewLabel: 'Предпросмотр в проводнике:',
		previewText: '01_Проекты',
		autoRenameTitle: 'Автопереименование заметки',
		autoRenameDesc: 'Автоматически переименовывать файл заметки при переименовании папки.',

		sectionIcons: 'Управление иконками',
		iconsFolderTitle: 'Папка кастомных SVG',
		iconsFolderDesc: 'Путь к директории хранилища с векторными SVG файлами.',

		scopeFolderTree: 'Папки в проводнике',
		scopeFileTree: 'Файлы в проводнике',
		scopeTabs: 'Вкладки (Tabs)',
		scopeInlineTitle: 'Заголовки заметок',
		scopeBookmarks: 'Панель закладок (Bookmarks)',
		scopeRibbon: 'Боковой риббон',
		scopeToggleDesc: 'Отображение назначенных иконок в данной области интерфейса.',

		uploadSectionTitle: 'Коллекция и загрузка SVG',
		uploadBtnText: 'Загрузить SVG...',
		uploadSuccess: 'Иконка успешно загружена:',
		uploadFailed: 'Ошибка загрузки SVG файла',
		iconDeleted: 'Иконка удалена:',
		noCustomIcons: 'Кастомные SVG пока не загружены. Нажмите «Загрузить SVG...», чтобы добавить иконку.',

		menuOpenNote: 'Открыть заметку папки',
		menuCreateNote: 'Создать заметку папки',
		menuChangeIcon: 'Сменить иконку...',
		menuResetIcon: 'Сбросить иконку',
		noticeIconSet: 'Установлена иконка:',
		noticeIconReset: 'Иконка сброшена',
		noticeNoteCreated: 'Создана заметка папки:',
		searchPlaceholder: 'Поиск иконки (Lucide и локальные SVG)...',
		badgeCustom: 'Кастомная',

		donateHeading: 'Поддержка проекта',
		donateTitle: 'Поддержать разработку экосистемы Ave Maria',
		donateDesc: 'Если вам нравятся наши плагины и вы хотите поддержать развитие открытых инструментов для Obsidian — вы можете отправить донат автору.',
		donateBtn: 'Поддержать через DonationAlerts',
	},
	en: {
		headerTitle: 'AVM Folder Notes',
		headerDesc: 'Folder notes architecture and vector icons management for explorer, tabs, headers, and bookmarks in the Ave Maria ecosystem.',
		langSelectLabel: 'Language:',
		btnQuickAction: 'Rescan Icons',

		sectionFolderNotes: 'Folder Notes Structure',
		namingStrategyName: 'Naming Strategy',
		namingStrategyDesc: 'Determines the name format of the document attached to a folder.',
		namingStrategySameName: 'Folder Name (Folder/Folder.md)',
		namingStrategyIndex: 'Index File (Folder/index.md)',
		indexFileNameTitle: 'Index File Name',
		indexFileNameDesc: 'File name without .md extension inside the folder.',
		markFolderTitle: 'Folder Note Indicator',
		markFolderDesc: 'Show a visual indicator for folders with an attached note.',
		highlightStyleTitle: 'Indicator Style',
		highlightStyleDesc: 'Choose the visual style for folders with notes in the file tree.',
		styleDot: 'Golden Dot (Accent Mark)',
		styleText: 'Title Color (Accent Heading)',
		styleBadge: 'Mini Badge [DOC]',
		styleUnderline: 'Subtle Underline',
		previewLabel: 'Explorer Preview:',
		previewText: '01_Projects',
		autoRenameTitle: 'Auto-Rename Note',
		autoRenameDesc: 'Automatically rename the attached note file when renaming its folder.',

		sectionIcons: 'Icon Management',
		iconsFolderTitle: 'Custom SVG Folder',
		iconsFolderDesc: 'Vault folder path containing your vector SVG files.',

		scopeFolderTree: 'Folders in Explorer',
		scopeFileTree: 'Files in Explorer',
		scopeTabs: 'Editor Tabs',
		scopeInlineTitle: 'Note Titles',
		scopeBookmarks: 'Bookmarks Sidebar',
		scopeRibbon: 'Side Ribbon Dock',
		scopeToggleDesc: 'Display assigned icons in this interface area.',

		uploadSectionTitle: 'Custom SVG Library & Upload',
		uploadBtnText: 'Upload SVG...',
		uploadSuccess: 'Icon successfully uploaded:',
		uploadFailed: 'Failed to upload SVG file',
		iconDeleted: 'Icon deleted:',
		noCustomIcons: 'No custom SVGs uploaded yet. Click "Upload SVG..." to add an icon.',

		menuOpenNote: 'Open folder note',
		menuCreateNote: 'Create folder note',
		menuChangeIcon: 'Change icon...',
		menuResetIcon: 'Reset icon',
		noticeIconSet: 'Icon set to:',
		noticeIconReset: 'Icon reset',
		noticeNoteCreated: 'Folder note created:',
		searchPlaceholder: 'Search icons (Lucide & local SVGs)...',
		badgeCustom: 'Custom',

		donateHeading: 'Support the Project',
		donateTitle: 'Support Ave Maria Ecosystem Development',
		donateDesc: 'If you enjoy our plugins and want to support the development of modern open-source Obsidian tools, consider sending a donation.',
		donateBtn: 'Support via DonationAlerts',
	},
};
