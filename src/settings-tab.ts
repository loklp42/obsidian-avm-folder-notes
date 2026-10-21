import { App, Notice, PluginSettingTab, Setting, setIcon } from 'obsidian';
import type AvmFolderNotesPlugin from './main';
import type { HighlightStyle } from './settings';
import { Language, TRANSLATIONS } from './i18n';
import { renderHeroBanner, renderDonateBanner, createSectionHeading, AVM_ICONS } from './ui-components';

export class AvmFolderNotesSettingTab extends PluginSettingTab {
	plugin: AvmFolderNotesPlugin;

	constructor(app: App, plugin: AvmFolderNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('avm-settings-container');

		const lang = this.plugin.settings.language || 'ru';
		const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;

		// Hero Banner
		renderHeroBanner(containerEl, {
			title: t.headerTitle,
			badge: 'Folder Architecture',
			desc: t.headerDesc,
			iconSvg: AVM_ICONS.folder
		});

		// Actions & Language selector
		const actionsRow = containerEl.createDiv({ cls: 'avm-set-actions' });

		const actionsLeft = actionsRow.createDiv({ cls: 'avm-actions-left' });
		const rescanBtn = actionsLeft.createEl('button', {
			cls: 'avm-action-btn avm-action-btn--cta',
			text: t.btnQuickAction,
		});
		rescanBtn.onclick = async () => {
			await this.plugin.iconRegistry.loadCustomIcons();
			this.plugin.iconRenderer.renderAll();
			new Notice(lang === 'ru' ? 'Каталог иконок обновлён' : 'Icon catalog updated');
			this.display();
		};

		const actionsRight = actionsRow.createDiv({ cls: 'avm-actions-right' });
		actionsRight.createSpan({ cls: 'avm-lang-label', text: t.langSelectLabel });
		const langSelect = actionsRight.createEl('select', { cls: 'avm-lang-select dropdown' });
		langSelect.createEl('option', { value: 'ru', text: 'Русский' });
		langSelect.createEl('option', { value: 'en', text: 'English' });
		langSelect.value = lang;
		langSelect.onchange = async () => {
			this.plugin.settings.language = langSelect.value as Language;
			await this.plugin.saveSettings();
			this.display();
		};

		// Section: Folder Notes
		createSectionHeading(containerEl, t.sectionFolderNotes, AVM_ICONS.folder);

		new Setting(containerEl)
			.setName(t.namingStrategyName)
			.setDesc(t.namingStrategyDesc)
			.addDropdown((dropdown) => {
				dropdown
					.addOption('inside_folder_same_name', t.namingStrategySameName)
					.addOption('inside_folder_index', t.namingStrategyIndex)
					.setValue(this.plugin.settings.noteNameType)
					.onChange(async (val) => {
						this.plugin.settings.noteNameType = val as 'inside_folder_same_name' | 'inside_folder_index';
						await this.plugin.saveSettings();
						this.display();
					});
			});

		if (this.plugin.settings.noteNameType === 'inside_folder_index') {
			new Setting(containerEl)
				.setName(t.indexFileNameTitle)
				.setDesc(t.indexFileNameDesc)
				.addText((text) => {
					text
						.setPlaceholder('index')
						.setValue(this.plugin.settings.indexFileName)
						.onChange(async (val) => {
							this.plugin.settings.indexFileName = val.trim() || 'index';
							await this.plugin.saveSettings();
						});
				});
		}

		new Setting(containerEl)
			.setName(t.markFolderTitle)
			.setDesc(t.markFolderDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.markFolderWithNote)
					.onChange(async (val) => {
						this.plugin.settings.markFolderWithNote = val;
						await this.plugin.saveSettings();
						this.plugin.refreshFolderMarkers();
						this.display();
					});
			});

		if (this.plugin.settings.markFolderWithNote) {
			new Setting(containerEl)
				.setName(t.highlightStyleTitle)
				.setDesc(t.highlightStyleDesc)
				.addDropdown((dropdown) => {
					dropdown
						.addOption('accent-dot', t.styleDot)
						.addOption('accent-text', t.styleText)
						.addOption('accent-badge', t.styleBadge)
						.addOption('accent-underline', t.styleUnderline)
						.setValue(this.plugin.settings.highlightStyle)
						.onChange(async (val) => {
							this.plugin.settings.highlightStyle = val as HighlightStyle;
							await this.plugin.saveSettings();
							this.plugin.refreshFolderMarkers();
							this.updatePreviewBox(previewBox);
						});
				});

			const previewCard = containerEl.createDiv({ cls: 'avm-preview-card' });
			previewCard.createDiv({
				cls: 'avm-preview-label',
				text: t.previewLabel,
			});

			const previewBox = previewCard.createDiv({
				cls: `avm-preview-box preview-style-${this.plugin.settings.highlightStyle}`,
			});

			const iconEl = previewBox.createSpan({ cls: 'avm-preview-icon' });
			setIcon(iconEl, 'folder');

			previewBox.createSpan({
				cls: 'avm-preview-text',
				text: t.previewText,
			});
		}

		new Setting(containerEl)
			.setName(t.autoRenameTitle)
			.setDesc(t.autoRenameDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.autoRenameNote)
					.onChange(async (val) => {
						this.plugin.settings.autoRenameNote = val;
						await this.plugin.saveSettings();
					});
			});

		// Section: Icon Management
		createSectionHeading(containerEl, t.sectionIcons, AVM_ICONS.sliders);

		new Setting(containerEl)
			.setName(t.iconsFolderTitle)
			.setDesc(t.iconsFolderDesc)
			.addText((text) => {
				text
					.setPlaceholder('99_system/media/icons')
					.setValue(this.plugin.settings.customIconsFolder)
					.onChange(async (val) => {
						this.plugin.settings.customIconsFolder = val.trim() || '99_system/media/icons';
						this.plugin.iconRegistry.setIconsFolder(this.plugin.settings.customIconsFolder);
						await this.plugin.saveSettings();
						await this.plugin.iconRegistry.loadCustomIcons();
						this.plugin.iconRenderer.renderAll();
					});
			});

		new Setting(containerEl)
			.setName(t.scopeFolderTree)
			.setDesc(t.scopeToggleDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.enableFolderIcons)
					.onChange(async (val) => {
						this.plugin.settings.enableFolderIcons = val;
						await this.plugin.saveSettings();
						this.plugin.iconRenderer.renderAll();
					});
			});

		new Setting(containerEl)
			.setName(t.scopeFileTree)
			.setDesc(t.scopeToggleDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.enableFileIcons)
					.onChange(async (val) => {
						this.plugin.settings.enableFileIcons = val;
						await this.plugin.saveSettings();
						this.plugin.iconRenderer.renderAll();
					});
			});

		new Setting(containerEl)
			.setName(t.scopeTabs)
			.setDesc(t.scopeToggleDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.enableTabIcons)
					.onChange(async (val) => {
						this.plugin.settings.enableTabIcons = val;
						await this.plugin.saveSettings();
						this.plugin.iconRenderer.renderTabIcons();
					});
			});

		new Setting(containerEl)
			.setName(t.scopeInlineTitle)
			.setDesc(t.scopeToggleDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.enableTitleIcons)
					.onChange(async (val) => {
						this.plugin.settings.enableTitleIcons = val;
						await this.plugin.saveSettings();
						this.plugin.iconRenderer.renderTitleIcons();
					});
			});

		new Setting(containerEl)
			.setName(t.scopeBookmarks)
			.setDesc(t.scopeToggleDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.enableBookmarksIcons)
					.onChange(async (val) => {
						this.plugin.settings.enableBookmarksIcons = val;
						await this.plugin.saveSettings();
						this.plugin.iconRenderer.renderBookmarkIcons();
					});
			});

		new Setting(containerEl)
			.setName(t.scopeRibbon)
			.setDesc(t.scopeToggleDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.enableRibbonIcons)
					.onChange(async (val) => {
						this.plugin.settings.enableRibbonIcons = val;
						await this.plugin.saveSettings();
						this.plugin.iconRenderer.renderRibbonIcons();
					});
			});

		// Section: Custom SVG Library
		createSectionHeading(containerEl, t.uploadSectionTitle, AVM_ICONS.sparkles);

		const uploadRow = containerEl.createDiv({ cls: 'avm-upload-action-row' });
		const fileInput = uploadRow.createEl('input', {
			type: 'file',
			cls: 'avm-hidden-file-input',
			attr: { accept: '.svg', multiple: 'true' },
		});

		const uploadBtn = uploadRow.createEl('button', {
			cls: 'avm-action-btn avm-action-btn--cta',
			text: t.uploadBtnText,
		});

		uploadBtn.addEventListener('click', () => {
			fileInput.click();
		});

		fileInput.addEventListener('change', async () => {
			if (!fileInput.files || fileInput.files.length === 0) return;

			let loadedCount = 0;
			for (let i = 0; i < fileInput.files.length; i++) {
				const file = fileInput.files[i];
				if (!file) continue;
				if (file.name.toLowerCase().endsWith('.svg')) {
					const text = await file.text();
					const success = await this.plugin.iconRegistry.addCustomIcon(file.name, text);
					if (success) loadedCount++;
				}
			}

			if (loadedCount > 0) {
				new Notice(`${t.uploadSuccess} (${loadedCount})`);
				this.display();
			} else {
				new Notice(t.uploadFailed);
			}
		});

		const customIcons = this.plugin.iconRegistry.getAllCustomIcons();
		const galleryWrap = containerEl.createDiv({ cls: 'avm-svg-gallery-grid' });

		if (customIcons.length === 0) {
			galleryWrap.createDiv({
				cls: 'avm-gallery-empty-notice',
				text: t.noCustomIcons,
			});
		} else {
			customIcons.forEach((item) => {
				const pill = galleryWrap.createDiv({ cls: 'avm-svg-gallery-pill' });
				const iconNode = pill.createSpan({ cls: 'avm-gallery-icon' });
				iconNode.innerHTML = item.svg;

				pill.createSpan({ text: item.id, cls: 'avm-gallery-name' });

				const deleteBtn = pill.createSpan({
					cls: 'avm-gallery-delete-btn',
					text: '×',
					attr: { title: 'Delete SVG' },
				});

				deleteBtn.addEventListener('click', async (e) => {
					e.stopPropagation();
					await this.plugin.iconRegistry.deleteCustomIcon(item.id);
					new Notice(`${t.iconDeleted} ${item.id}`);
					this.display();
				});
			});
		}

		// Donate Section
		renderDonateBanner(containerEl, t);
	}

	private updatePreviewBox(boxEl: HTMLElement) {
		boxEl.className = `avm-preview-box preview-style-${this.plugin.settings.highlightStyle}`;
	}
}
