// 1. Import Vue and i18n
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import './assets/main.css';
import App from './App.vue';
import router from './routers';

// 2. Import all translation files from db/locales
import en from './db/locales/en.json';
import fr from './db/locales/fr.json';
import kh from './db/locales/kh.json';

// 3. Create i18n instance with configuration
export const i18n = createI18n({
    legacy: false,      // Use modern Composition API
    locale: 'en',       // Default language
    fallbackLocale: 'en', // Backup language if translation missing
    messages: { en, fr, kh }, // All translations
    globalInjection: true // Enable global properties like $t
});

// 4. Create Vue app and register plugins
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);   // For state management
app.use(PrimeVue);
app.use(router);  // For routing
app.use(i18n);    // For translations
app.mount('#app');
