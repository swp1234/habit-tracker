/**
 * i18n Module - Multi-language Support
 * Supported: ko, en, ja, zh, es, pt, id, tr, de, fr, hi, ru
 */

class I18n {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
        this.currentLang = this.detectLanguage();
        this.initialized = false;
    }

    /**
     * Detect language from localStorage or browser
     */
    detectLanguage() {
        // Check localStorage first
        const saved = localStorage.getItem('language');
        if (saved && this.supportedLanguages.includes(saved)) {
            return saved;
        }

        // Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }

        // Default to English
        return 'en';
    }

    /**
     * Load translations for a specific language
     */
    async loadTranslations(lang) {
        if (this.translations[lang]) {
            return this.translations[lang];
        }

        try {
            const response = await fetch(`js/locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}`);
            this.translations[lang] = await response.json();
            return this.translations[lang];
        } catch (error) {
            console.error(`Error loading language ${lang}:`, error);
            return {};
        }
    }

    /**
     * Get translation for a key (dot notation: 'app.title')
     */
    t(key) {
        if (!this.translations[this.currentLang]) {
            return key;
        }

        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (typeof value === 'object' && value !== null && k in value) {
                value = value[k];
            } else {
                return key;
            }
        }

        return typeof value === 'string' ? value : key;
    }

    /**
     * Change language and update UI
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            return;
        }

        await this.loadTranslations(lang);
        this.currentLang = lang;
        localStorage.setItem('language', lang);

        // Update all DOM elements with data-i18n attribute
        this.updateUI();

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    /**
     * Update all UI text based on current language
     */
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Get human-readable language name
     */
    getLanguageName(lang) {
        const names = {
            ko: 'Korean',
            en: 'English',
            ja: 'Japanese',
            zh: 'Chinese',
            es: 'Spanish',
            pt: 'Portuguese',
            id: 'Indonesian',
            tr: 'Turkish',
            de: 'German',
            fr: 'French',
            hi: 'Hindi',
            ru: 'Russian'
        };
        return names[lang] || lang;
    }

    /**
     * Initialize i18n
     */
    async init() {
        await this.loadTranslations(this.currentLang);
        this.updateUI();
        this.setupLanguageSwitcher();
        this.initialized = true;
    }

    /**
     * Setup language switcher UI
     */
    setupLanguageSwitcher() {
        const langToggle = document.getElementById('lang-toggle');
        const langMenu = document.getElementById('lang-menu');

        if (!langToggle || !langMenu) return;

        // Toggle menu
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('hidden');
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
                langMenu.classList.add('hidden');
            }
        });

        // Language option click
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const lang = btn.getAttribute('data-lang');
                await this.setLanguage(lang);
                langMenu.classList.add('hidden');

                // Update active state
                document.querySelectorAll('.lang-option').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
            });
        });

        // Mark current language as active
        document.querySelectorAll('.lang-option').forEach(btn => {
            if (btn.getAttribute('data-lang') === this.currentLang) {
                btn.classList.add('active');
            }
        });
    }
}

// Global i18n instance
const i18n = new I18n();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
    i18n.init();
}
