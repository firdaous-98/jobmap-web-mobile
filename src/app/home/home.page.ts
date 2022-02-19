import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserHelper } from '../core/helpers/user-helper';
import { Score } from '../core/models/score.model';
import { TokenInfo } from '../core/models/token.model';
import { AppService } from '../core/services/app.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  scoring?: string;
  resultat: Score[] = [];
  tokenInfo!: TokenInfo;
  hasScore = false;

  constructor(
    private router: Router,
    private service: AppService
  ) {
  }

  async ngOnInit() {
    this.tokenInfo = UserHelper.getTokenInfo();
    localStorage.setItem('id_type_utilisateur', this.tokenInfo.id_typeutilisateur);
    localStorage.setItem('annee_etude', this.tokenInfo.id_annee_etude);
    await this.getScore();
    if(this.resultat != null && this.resultat != undefined) {
      this.hasScore = true;
    }
  }

  async getScore() {
    const id_utilisateur = parseInt(this.tokenInfo.id_utilisateur);
    var response = await this.service.getScore(id_utilisateur).toPromise();
    this.scoring = response?.scoring;
    localStorage.setItem('id_nf', response?.id_nf);
    var score = this.scoring?.split("");
    this.resultat.push({ key: score[0], value: parseInt(response?.score_firstletter) });
    this.resultat.push({ key: score[1], value: parseInt(response?.score_secondletter) });
    this.resultat.push({ key: score[2], value: parseInt(response?.score_thirdletter) });
  }

  goToResultat() {
    this.router.navigate(['/result'], { state: { resultat: this.resultat, fromQuiz: false }});
  }

  startQuiz(){
    this.router.navigate(['/info']);
  }

  logOut(){
    localStorage.clear();
    this.router.navigate(['/auth']);
  }

  @HostListener('unloaded')
  ngOnDestroy() {
    console.log('Items destroyed');
  }
}
