import { App, FuzzySuggestModal, setIcon } from 'obsidian';
import type { CustomIconDef, IconRegistry } from './icon-registry';
import { TRANSLATIONS } from './i18n';
import type { Language } from './i18n';

export class IconPickerModal extends FuzzySuggestModal<CustomIconDef> {
	private registry: IconRegistry;
	private onChoose: (iconDef: CustomIconDef) => void;
	private lang: Language;

	constructor(
		app: App,
		registry: IconRegistry,
		onChoose: (iconDef: CustomIconDef) => void,
		lang: Language = 'ru',
	) {
		super(app);
		this.registry = registry;
		this.onChoose = onChoose;
		this.lang = lang;
		const t = TRANSLATIONS[this.lang] || TRANSLATIONS.ru;
		this.setPlaceholder(t.searchPlaceholder);
		this.modalEl.addClass('avm-icon-picker-modal');
	}

	getItems(): CustomIconDef[] {
		return this.registry.getAllIcons();
	}

	getItemText(item: CustomIconDef): string {
		return `${item.name} ${item.isCustom ? 'custom svg' : 'lucide'}`;
	}

	renderSuggestion(item: { item: CustomIconDef }, el: HTMLElement): void {
		const t = TRANSLATIONS[this.lang] || TRANSLATIONS.ru;
		el.empty();
		el.addClass('avm-icon-suggestion-item');

		const iconBox = el.createSpan({ cls: 'avm-suggestion-icon' });
		if (item.item.isCustom && item.item.svgContent) {
			iconBox.innerHTML = item.item.svgContent;
		} else {
			setIcon(iconBox, item.item.id);
		}

		const info = el.createDiv({ cls: 'avm-suggestion-info' });
		info.createSpan({ text: item.item.name, cls: 'avm-suggestion-name' });
		if (item.item.isCustom) {
			info.createSpan({ text: t.badgeCustom, cls: 'avm-suggestion-badge' });
		}
	}

	onChooseItem(item: CustomIconDef): void {
		this.onChoose(item);
	}
}
