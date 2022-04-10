import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserHelper } from '../core/helpers/user-helper';
import { Score } from '../core/models/score.model';
import { TokenInfo } from '../core/models/token.model';
import { AppService } from '../core/services/app.service';
import { TranslatorService } from '../core/services/translate.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  scoring?: string;
  resultat: Score[] = [];
  resultPerStep: {id_step: string, resultat: any}[] = [];
  tokenInfo!: TokenInfo;
  hasScore = false;
  startOrContinue = true;

  constructor(
    private router: Router,
    public translate: TranslateService, 
    public translatorService: TranslatorService,
    private service: AppService
  ) {
    this.initComponent();
  }

  async initComponent() {
    setTimeout(() => {
      this.translate.use(this.translatorService.getSelectedLanguage());      
    }, 500);
    this.tokenInfo = UserHelper.getTokenInfo();
    localStorage.setItem('id_type_utilisateur', this.tokenInfo.id_typeutilisateur);
    localStorage.setItem('annee_etude', this.tokenInfo.id_annee_etude);
    this.startOrContinue = localStorage.getItem('reponses') == "null";
    await this.getScore();
    if(this.resultat?.length > 0) {
      this.hasScore = true;
    }
  }

  async getScore() {
    const id_utilisateur = parseInt(this.tokenInfo.id_utilisateur);
    var response = await this.service.getScore(id_utilisateur).toPromise();
    if(response != null) {
      this.scoring = response?.scoring;
      localStorage.setItem('id_nf', response?.id_nf);
      var score = this.scoring?.split("");
      
      this.resultat?.push({ key: score[0], value: parseInt(response?.score_firstletter) });
      this.resultat?.push({ key: score[1], value: parseInt(response?.score_secondletter) });
      this.resultat?.push({ key: score[2], value: parseInt(response?.score_thirdletter) });

      this.resultPerStep?.push({ id_step: "1", resultat: response?.score_firststep});
      this.resultPerStep?.push({ id_step: "2", resultat: response?.score_secondstep});
      this.resultPerStep?.push({ id_step: "3", resultat: response?.score_thirdstep});
      this.resultPerStep?.push({ id_step: "4", resultat: response?.score_fourthstep});
    }
    
  }

  goToResultat() {
    this.router.navigate(['/result'], { state: { resultat: this.resultat, resultPerStep: this.resultPerStep, fromQuiz: false }});
  }

  startQuiz(){
    if(localStorage.getItem('reponses') != "null") {      
      this.router.navigate(['/quiz']);
    }
    else {
      this.router.navigate(['/info']);      
    }
  }

  logOut(){
    localStorage.clear();
    this.router.navigate(['/language']);
  }

  @HostListener('unloaded')
  ngOnDestroy() {
    console.log('Items destroyed');
  }
}
