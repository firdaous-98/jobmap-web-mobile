import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslatorService } from '../core/services/translate.service';

@Component({
  selector: 'app-language',
  templateUrl: './language.page.html',
  styleUrls: ['../auth/auth.page.scss', './language.page.scss'],
})
export class LanguagePage implements OnInit {

  language!: string;
  
  constructor(
    public translate: TranslateService, 
    public translatorService: TranslatorService,
    private router: Router
    ) { }

  ngOnInit() {
  }

  selectLanguage(value: any) {
    this.language = value?.detail?.value;
    this.translatorService.setLanguage(this.translate, this.language);
  }

  goToAuth() {
    this.router.navigate(['/auth']);
  }

}
