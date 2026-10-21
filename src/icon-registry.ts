import { App, TFolder, getIconIds, normalizePath } from 'obsidian';

export interface CustomIconDef {
	id: string;
	name: string;
	svgContent: string;
	isCustom: boolean;
}

export class IconRegistry {
	private app: App;
	private customIcons: Map<string, string> = new Map();
	private iconsFolder: string;

	constructor(app: App, iconsFolder: string) {
		this.app = app;
		this.iconsFolder = iconsFolder;
	}

	setIconsFolder(folder: string): void {
		this.iconsFolder = folder;
	}

	async loadCustomIcons(): Promise<void> {
		this.customIcons.clear();
		const targetPath = normalizePath(this.iconsFolder || '99_system/media/icons');
		const folder = this.app.vault.getAbstractFileByPath(targetPath);
		if (!(folder instanceof TFolder)) return;

		for (const child of folder.children) {
			if (child.name.toLowerCase().endsWith('.svg')) {
				const iconId = child.name.replace(/\.svg$/i, '');
				try {
					const content = await this.app.vault.adapter.read(child.path);
					this.customIcons.set(iconId, content);
				} catch (err) {
					console.error(`[AVM Folder Notes] Failed reading SVG: ${child.path}`, err);
				}
			}
		}
	}

	async addCustomIcon(fileName: string, content: string): Promise<boolean> {
		try {
			const targetPath = normalizePath(this.iconsFolder || '99_system/media/icons');
			const folderExists = await this.app.vault.adapter.exists(targetPath);
			if (!folderExists) {
				await this.app.vault.createFolder(targetPath);
			}

			const cleanName = fileName.toLowerCase().endsWith('.svg') ? fileName : `${fileName}.svg`;
			const filePath = normalizePath(`${targetPath}/${cleanName}`);
			await this.app.vault.adapter.write(filePath, content);

			const iconId = cleanName.replace(/\.svg$/i, '');
			this.customIcons.set(iconId, content);
			return true;
		} catch (err) {
			console.error('[AVM Folder Notes] Failed saving custom SVG:', err);
			return false;
		}
	}

	async deleteCustomIcon(iconId: string): Promise<boolean> {
		try {
			const targetPath = normalizePath(this.iconsFolder || '99_system/media/icons');
			const filePath = normalizePath(`${targetPath}/${iconId}.svg`);
			const exists = await this.app.vault.adapter.exists(filePath);
			if (exists) {
				await this.app.vault.adapter.remove(filePath);
			}
			this.customIcons.delete(iconId);
			return true;
		} catch (err) {
			console.error(`[AVM Folder Notes] Failed deleting SVG ${iconId}:`, err);
			return false;
		}
	}

	getCustomIcon(iconId: string): string | null {
		return this.customIcons.get(iconId) || null;
	}

	getAllCustomIcons(): { id: string; svg: string }[] {
		return Array.from(this.customIcons.entries()).map(([id, svg]) => ({ id, svg }));
	}

	getAllIcons(): CustomIconDef[] {
		const result: CustomIconDef[] = [];

		for (const [id, svg] of this.customIcons.entries()) {
			result.push({
				id,
				name: id,
				svgContent: svg,
				isCustom: true,
			});
		}

		const nativeIds = getIconIds();
		for (const id of nativeIds) {
			if (!this.customIcons.has(id)) {
				result.push({
					id,
					name: id,
					svgContent: '',
					isCustom: false,
				});
			}
		}

		return result;
	}
}
