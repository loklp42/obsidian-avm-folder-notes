import {
	App,
	TAbstractFile,
	TFile,
	TFolder,
	View,
	WorkspaceLeaf,
	setIcon,
} from 'obsidian';
import type AvmFolderNotesPlugin from './main';
import type { IconRegistry } from './icon-registry';

interface FileExplorerItem {
	file: TAbstractFile;
	selfEl?: HTMLElement;
	titleEl?: HTMLElement;
	innerEl?: HTMLElement;
}

interface FileExplorerView extends View {
	fileItems?: Record<string, FileExplorerItem>;
}

export class IconRenderer {
	private app: App;
	private plugin: AvmFolderNotesPlugin;
	private registry: IconRegistry;

	constructor(app: App, plugin: AvmFolderNotesPlugin, registry: IconRegistry) {
		this.app = app;
		this.plugin = plugin;
		this.registry = registry;
	}

	renderAll(): void {
		this.renderFileExplorerIcons();
		this.renderTabIcons();
		this.renderTitleIcons();
		this.renderBookmarkIcons();
		this.renderRibbonIcons();
	}

	renderIconToElement(container: HTMLElement, iconId: string): void {
		if (container.getAttribute('data-avm-icon') === iconId) {
			return;
		}

		container.empty();
		container.addClass('avm-icon-node');
		container.setAttribute('data-avm-icon', iconId);

		const customSvg = this.registry.getCustomIcon(iconId);
		if (customSvg) {
			container.innerHTML = customSvg;
		} else {
			setIcon(container, iconId);
		}
	}

	renderFileExplorerIcons(): void {
		if (!this.plugin.settings.enableFolderIcons && !this.plugin.settings.enableFileIcons) {
			return;
		}

		const explorerLeaves = this.app.workspace.getLeavesOfType('file-explorer');
		for (const leaf of explorerLeaves) {
			const view = leaf.view as FileExplorerView;
			if (!view?.fileItems) continue;

			for (const path in view.fileItems) {
				const item = view.fileItems[path];
				if (!item?.file) continue;

				const isFolder = item.file instanceof TFolder;
				if (isFolder && !this.plugin.settings.enableFolderIcons) continue;
				if (!isFolder && !this.plugin.settings.enableFileIcons) continue;

				const targetTitle = item.titleEl || item.selfEl;
				if (!targetTitle) continue;

				const config = this.plugin.settings.icons[item.file.path];
				let iconContainer = targetTitle.querySelector('.avm-file-icon') as HTMLElement | null;

				if (config?.icon) {
					if (!iconContainer) {
						iconContainer = createSpan({ cls: 'avm-file-icon' });
						const inner = targetTitle.querySelector('.nav-folder-title-content, .nav-file-title-content');
						if (inner) {
							targetTitle.insertBefore(iconContainer, inner);
						} else {
							targetTitle.prepend(iconContainer);
						}
					}
					this.renderIconToElement(iconContainer, config.icon);
				} else if (iconContainer) {
					iconContainer.remove();
				}
			}
		}
	}

	renderTabIcons(): void {
		if (!this.plugin.settings.enableTabIcons) return;

		this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
			const tabHeaderEl = (leaf as { tabHeaderEl?: HTMLElement }).tabHeaderEl;
			if (!tabHeaderEl) return;

			const viewState = leaf.getViewState();
			const filePath = (viewState.state as { file?: string })?.file;
			if (!filePath) return;

			const config = this.plugin.settings.icons[filePath];
			let iconEl = tabHeaderEl.querySelector('.avm-tab-icon') as HTMLElement | null;

			if (config?.icon) {
				if (!iconEl) {
					iconEl = createSpan({ cls: 'avm-tab-icon' });
					const titleEl = tabHeaderEl.querySelector('.workspace-tab-header-inner-title');
					if (titleEl) {
						tabHeaderEl.querySelector('.workspace-tab-header-inner')?.insertBefore(iconEl, titleEl);
					}
				}
				if (iconEl) {
					this.renderIconToElement(iconEl, config.icon);
				}
			} else if (iconEl) {
				iconEl.remove();
			}
		});
	}

	renderTitleIcons(): void {
		if (!this.plugin.settings.enableTitleIcons) return;

		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) return;

		const config = this.plugin.settings.icons[activeFile.path];
		const view = this.app.workspace.getActiveViewOfType(View);
		if (!view) return;

		const inlineTitleEl = view.containerEl.querySelector('.inline-title') as HTMLElement | null;
		if (!inlineTitleEl) return;

		let titleIcon = inlineTitleEl.parentElement?.querySelector('.avm-inline-title-icon') as HTMLElement | null;

		if (config?.icon) {
			if (!titleIcon) {
				titleIcon = createSpan({ cls: 'avm-inline-title-icon' });
				inlineTitleEl.parentElement?.insertBefore(titleIcon, inlineTitleEl);
			}
			this.renderIconToElement(titleIcon, config.icon);
		} else if (titleIcon) {
			titleIcon.remove();
		}
	}

	renderBookmarkIcons(): void {
		if (!this.plugin.settings.enableBookmarksIcons) return;

		const bookmarkLeaves = this.app.workspace.getLeavesOfType('bookmarks');
		for (const leaf of bookmarkLeaves) {
			const container = leaf.view?.containerEl;
			if (!container) continue;

			const items = container.querySelectorAll('.tree-item');
			items.forEach((itemEl) => {
				const selfEl = itemEl.querySelector('.tree-item-self');
				if (!selfEl) return;

				const dataPath = selfEl.getAttribute('data-path') || itemEl.getAttribute('data-path');
				if (!dataPath) return;

				const config = this.plugin.settings.icons[dataPath];
				let iconContainer = selfEl.querySelector('.avm-bookmark-icon') as HTMLElement | null;

				if (config?.icon) {
					if (!iconContainer) {
						iconContainer = createSpan({ cls: 'avm-bookmark-icon' });
						const inner = selfEl.querySelector('.tree-item-inner');
						if (inner) {
							selfEl.insertBefore(iconContainer, inner);
						} else {
							selfEl.prepend(iconContainer);
						}
					}
					this.renderIconToElement(iconContainer, config.icon);
				} else if (iconContainer) {
					iconContainer.remove();
				}
			});
		}
	}

	renderRibbonIcons(): void {
		if (!this.plugin.settings.enableRibbonIcons) return;

		for (const path in this.plugin.settings.icons) {
			if (path.startsWith('ribbon:')) {
				const actionId = path.replace(/^ribbon:/, '');
				const ribbonBtn = activeDocument.querySelector(`.side-dock-ribbon-action[aria-label*="${actionId}"]`) as HTMLElement | null;
				const config = this.plugin.settings.icons[path];
				if (ribbonBtn && config?.icon) {
					this.renderIconToElement(ribbonBtn, config.icon);
				}
			}
		}
	}
}
