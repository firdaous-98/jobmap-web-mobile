import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserHelper } from '../core/helpers/user-helper';
import { Score } from '../core/models/score.model';
import { AppService } from '../core/services/app.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  scoring?: string;
  resultat: Score[] = [];

  constructor(
    private router: Router,
    private service: AppService
  ) {
  }

  async ngOnInit() {
    await this.getScore();
    if(this.resultat != null && this.resultat != undefined) {
      this.router.navigate(['/result'], { state: { resultat: this.resultat, fromQuiz: false }});
    }
  }

  async getScore() {
    debugger
    const id_utilisateur = parseInt(UserHelper.getTokenInfo().id_utilisateur);
    var response = await this.service.getScore(id_utilisateur).toPromise();
    this.scoring = response?.scoring;
    var score = this.scoring.split("");
    this.resultat.push({ key: score[0], value: parseInt(response?.score_firstletter) });
    this.resultat.push({ key: score[1], value: parseInt(response?.score_secondletter) });
    this.resultat.push({ key: score[2], value: parseInt(response?.score_thirdletter) });
  }

  startQuiz(){
    this.router.navigate(['/info']);
  }

  logOut(){
    localStorage.clear();
    this.router.navigate(['/auth']);
  }
}
