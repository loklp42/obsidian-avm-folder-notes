import {
	Menu,
	Notice,
	Plugin,
	TAbstractFile,
	TFile,
	TFolder,
	View,
} from 'obsidian';
import { AvmFolderNotesSettings, DEFAULT_SETTINGS } from './settings';
import { AvmFolderNotesSettingTab } from './settings-tab';
import { IconRegistry } from './icon-registry';
import { IconRenderer } from './icon-renderer';
import { IconPickerModal } from './icon-picker-modal';
import { TRANSLATIONS } from './i18n';

interface FileExplorerItem {
	file: TAbstractFile;
	selfEl?: HTMLElement;
	titleEl?: HTMLElement;
	innerEl?: HTMLElement;
}

interface FileExplorerView extends View {
	fileItems?: Record<string, FileExplorerItem>;
}

export default class AvmFolderNotesPlugin extends Plugin {
	settings: AvmFolderNotesSettings = DEFAULT_SETTINGS;
	iconRegistry!: IconRegistry;
	iconRenderer!: IconRenderer;
	private _isRenaming = false;

	async onload() {
		await this.loadSettings();

		this.iconRegistry = new IconRegistry(this.app, this.settings.customIconsFolder);
		await this.iconRegistry.loadCustomIcons();

		this.iconRenderer = new IconRenderer(this.app, this, this.iconRegistry);

		this.addSettingTab(new AvmFolderNotesSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on('file-menu', (menu: Menu, file: TAbstractFile) => {
				this.handleFileOrFolderMenu(menu, file);
			}),
		);

		this.registerEvent(
			this.app.vault.on('rename', (file: TAbstractFile, oldPath: string) => {
				this.handleVaultRename(file, oldPath);
			}),
		);

		this.registerEvent(
			this.app.vault.on('create', () => {
				this.refreshFolderMarkers();
				this.iconRenderer.renderAll();
			}),
		);

		this.registerEvent(
			this.app.vault.on('delete', (file: TAbstractFile) => {
				if (this.settings.icons[file.path]) {
					delete this.settings.icons[file.path];
					void this.saveSettings();
				}
				this.refreshFolderMarkers();
				this.iconRenderer.renderAll();
			}),
		);

		this.registerEvent(
			this.app.workspace.on('layout-change', () => {
				this.iconRenderer.renderAll();
			}),
		);

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.iconRenderer.renderTabIcons();
				this.iconRenderer.renderTitleIcons();
				this.iconRenderer.renderBookmarkIcons();
			}),
		);

		this.registerDomEvent(
			activeDocument,
			'click',
			(evt: MouseEvent) => {
				this.handleGlobalClick(evt);
			},
			true,
		);

		this.app.workspace.onLayoutReady(() => {
			this.refreshFolderMarkers();
			this.iconRenderer.renderAll();
		});
	}

	onunload() {
		this.clearFolderMarkers();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		if (!this.settings.icons) {
			this.settings.icons = {};
		}
		if (!this.settings.customIconsFolder) {
			this.settings.customIconsFolder = '99_system/media/icons';
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getExpectedNotePath(folder: TFolder): string {
		if (this.settings.noteNameType === 'inside_folder_index') {
			const indexName = (this.settings.indexFileName || 'index').trim();
			return `${folder.path}/${indexName}.md`;
		}
		return `${folder.path}/${folder.name}.md`;
	}

	getFolderNote(folder: TFolder): TFile | null {
		const targetPath = this.getExpectedNotePath(folder);
		const file = this.app.vault.getAbstractFileByPath(targetPath);
		return file instanceof TFile ? file : null;
	}

	async openOrCreateFolderNote(folder: TFolder, newLeaf = false): Promise<void> {
		const t = TRANSLATIONS[this.settings.language || 'ru'];
		let note = this.getFolderNote(folder);
		if (!note) {
			const path = this.getExpectedNotePath(folder);
			const title = folder.name;
			const defaultContent = `---\ntitle: "${title}"\ntags:\n  - folder-note\n---\n\n# ${title}\n\n`;
			try {
				note = await this.app.vault.create(path, defaultContent);
				new Notice(`${t.noticeNoteCreated} ${note.basename}`);
			} catch (err) {
				console.error('[AVM Folder Notes] Failed creating folder note:', err);
				new Notice('Error creating folder note');
				return;
			}
		}

		if (note) {
			const leaf = this.app.workspace.getLeaf(newLeaf);
			await leaf.openFile(note);
			this.refreshFolderMarkers();
			this.iconRenderer.renderAll();
		}
	}

	private handleGlobalClick(evt: MouseEvent) {
		const target = evt.target as HTMLElement | null;
		if (!target) return;

		// Ignore native folder collapse trigger
		if (target.closest('.collapse-icon') || target.closest('.nav-folder-collapse-indicator')) {
			return;
		}

		// Only handle clicks on folder title content
		const titleContent = target.closest('.nav-folder-title-content');
		if (!titleContent) {
			return;
		}

		const folderTitleEl = target.closest('.nav-folder-title') as HTMLElement | null;
		if (!folderTitleEl) return;

		const folder = this.findFolderByTitleElement(folderTitleEl);
		if (!folder) return;

		// Only intercept click if the folder note actually exists.
		// If it does not exist, let Obsidian collapse/expand the folder normally without creating files.
		const existingNote = this.getFolderNote(folder);
		if (!existingNote) {
			return;
		}

		const isCtrlOrCmd = evt.ctrlKey || evt.metaKey;

		evt.preventDefault();
		evt.stopPropagation();

		void this.openOrCreateFolderNote(folder, isCtrlOrCmd);
	}

	private findFolderByTitleElement(titleEl: HTMLElement): TFolder | null {
		const directPath = titleEl.getAttribute('data-path') || titleEl.parentElement?.getAttribute('data-path');
		if (directPath) {
			const abstract = this.app.vault.getAbstractFileByPath(directPath);
			if (abstract instanceof TFolder) return abstract;
		}

		const explorerLeaves = this.app.workspace.getLeavesOfType('file-explorer');
		for (const leaf of explorerLeaves) {
			const view = leaf.view as FileExplorerView;
			if (!view?.fileItems) continue;

			for (const path in view.fileItems) {
				const item = view.fileItems[path];
				if (!item) continue;
				if (item.titleEl === titleEl || item.selfEl === titleEl || item.innerEl === titleEl) {
					if (item.file instanceof TFolder) {
						return item.file;
					}
				}
			}
		}

		return null;
	}

	private handleFileOrFolderMenu(menu: Menu, file: TAbstractFile) {
		const t = TRANSLATIONS[this.settings.language || 'ru'];

		if (file instanceof TFolder) {
			const note = this.getFolderNote(file);
			menu.addItem((item) => {
				if (note) {
					item
						.setTitle(t.menuOpenNote)
						.setIcon('file-text')
						.onClick(() => {
							void this.openOrCreateFolderNote(file, false);
						});
				} else {
					item
						.setTitle(t.menuCreateNote)
						.setIcon('file-plus')
						.onClick(() => {
							void this.openOrCreateFolderNote(file, false);
						});
				}
			});
		}

		menu.addSeparator();

		menu.addItem((item) => {
			item
				.setTitle(t.menuChangeIcon)
				.setIcon('palette')
				.onClick(() => {
					new IconPickerModal(
						this.app,
						this.iconRegistry,
						async (iconDef) => {
							this.settings.icons[file.path] = { icon: iconDef.id };
							await this.saveSettings();
							this.iconRenderer.renderAll();
							new Notice(`${t.noticeIconSet} ${iconDef.name}`);
						},
						this.settings.language || 'ru',
					).open();
				});
		});

		if (this.settings.icons[file.path]) {
			menu.addItem((item) => {
				item
					.setTitle(t.menuResetIcon)
					.setIcon('trash-2')
					.onClick(async () => {
						delete this.settings.icons[file.path];
						await this.saveSettings();
						this.iconRenderer.renderAll();
						new Notice(t.noticeIconReset);
					});
			});
		}
	}

	private async handleVaultRename(file: TAbstractFile, oldPath: string) {
		// Sync icon mapping path
		if (this.settings.icons[oldPath]) {
			this.settings.icons[file.path] = this.settings.icons[oldPath];
			delete this.settings.icons[oldPath];
			void this.saveSettings();
		}

		if (this._isRenaming) return;
		if (!this.settings.autoRenameNote) return;
		if (this.settings.noteNameType !== 'inside_folder_same_name') return;

		// Sync folder note file name
		if (file instanceof TFolder) {
			const oldFolderName = oldPath.split('/').pop();
			if (!oldFolderName) return;

			const oldNotePath = `${file.path}/${oldFolderName}.md`;
			const oldNote = this.app.vault.getAbstractFileByPath(oldNotePath);

			if (oldNote instanceof TFile) {
				const newNotePath = `${file.path}/${file.name}.md`;
				this._isRenaming = true;
				try {
					await this.app.fileManager.renameFile(oldNote, newNotePath);
				} catch (err) {
					console.error('[AVM Folder Notes] Failed renaming attached folder note:', err);
				} finally {
					this._isRenaming = false;
					this.refreshFolderMarkers();
					this.iconRenderer.renderAll();
				}
			}
		}
	}

	refreshFolderMarkers() {
		const allStyleClasses = [
			'fn-style-accent-dot',
			'fn-style-accent-text',
			'fn-style-accent-badge',
			'fn-style-accent-underline',
		];

		const currentStyleClass = `fn-style-${this.settings.highlightStyle}`;

		const explorerLeaves = this.app.workspace.getLeavesOfType('file-explorer');
		for (const leaf of explorerLeaves) {
			const view = leaf.view as FileExplorerView;
			if (!view?.fileItems) continue;

			for (const path in view.fileItems) {
				const item = view.fileItems[path];
				if (!item?.file || !(item.file instanceof TFolder)) continue;

				const targetTitle = item.titleEl || item.selfEl;
				if (!targetTitle) continue;

				allStyleClasses.forEach((cls) => targetTitle.removeClass(cls));

				const hasNote = Boolean(this.getFolderNote(item.file));

				if (this.settings.markFolderWithNote && hasNote) {
					targetTitle.addClass('has-avm-folder-note');
					targetTitle.addClass(currentStyleClass);
				} else {
					targetTitle.removeClass('has-avm-folder-note');
				}
			}
		}
	}

	private clearFolderMarkers() {
		const activeElements = activeDocument.querySelectorAll('.has-avm-folder-note');
		activeElements.forEach((el) => {
			el.className = el.className
				.split(' ')
				.filter((cls) => !cls.startsWith('fn-style-') && cls !== 'has-avm-folder-note')
				.join(' ');
		});
	}
}
