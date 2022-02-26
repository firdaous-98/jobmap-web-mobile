import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TranslatorService {
    /**
     * Service Constructor
     */
    constructor() { }

    private static readonly defaultLanguage = 'fr';

    public static createTranslateLoader() {
    return (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json');
    }
    
    /**
     * Setup language
     */
    setLanguage(translate: TranslateService, lang = TranslatorService.defaultLanguage): Observable<any> {
        translate?.setDefaultLang(lang);
        localStorage.setItem('language', lang);
        return translate?.use(lang);
    }

    /**
     * Returns selected language
     */
    getSelectedLanguage(): any {
        return localStorage.getItem('language') || TranslatorService.defaultLanguage;
    }

}