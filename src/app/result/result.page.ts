import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserHelper } from '../core/helpers/user-helper';
import { Metier } from '../core/models/metier.model';
import { Score } from '../core/models/score.model';
import { TypeBac } from '../core/models/type-bac.model';
import { AppService } from '../core/services/app.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage {

  resultat: Score[];
  fromQuiz!: boolean;

  codeHollandCompose: string;
  twoEquals: boolean = false;

  FirstHeight: string = '';
  SecondHeight: string = '';
  ThirdHeight: string = '';

  listeMetiers: Metier[];
  listeTypeBac: TypeBac[];
  id_codeholland!: number;

  constructor(private router: Router, private service: AppService) {
    this.resultat = this.router.getCurrentNavigation().extras.state?.resultat;
    this.fromQuiz = this.router.getCurrentNavigation().extras.state?.fromQuiz;
   }


  async ngOnInit() {
    if(this.resultat != null) {
      this.checkEquality();
      if(!this.twoEquals) {
        this.calculChartHeight();
        this.composeCodeHolland();
        await this.getMetiers();
        await this.getTypesBac();
        if(this.fromQuiz) this.saveScore();
      }
    }
  }

  checkEquality(){
    if(this.resultat[0].value == this.resultat[1].value ||
      this.resultat[0].value == this.resultat[2].value ||
      this.resultat[1].value == this.resultat[2].value) 
      {
        this.twoEquals = true;
      }
  }

  calculChartHeight() {
    const total = this.resultat.reduce((a, b) => a + b.value, 0);
    this.FirstHeight = (this.resultat[0].value * 170 / total).toString() + 'px';
    this.SecondHeight = (this.resultat[1].value * 170 / total).toString() + 'px';
    this.ThirdHeight = (this.resultat[2].value * 170 / total).toString() + 'px';
  }

  composeCodeHolland() {
    this.codeHollandCompose = this.resultat.map(e => e.key).join('');
  }

  async getMetiers() {
    var id_nf = parseInt(localStorage.getItem('id_nf'));
    var result = await this.service.getMetiers(this.codeHollandCompose, id_nf).toPromise();
    
    this.listeMetiers = result as unknown as Metier[];
    this.id_codeholland = this.listeMetiers[0].id_codeholland;
  }

  async getTypesBac() {
    const id_metiers = this.listeMetiers.map(e => e.id_metier);
    var result = await this.service.getMetierTypeBac(id_metiers).toPromise();
    this.listeTypeBac = result;
  }

  saveScore() {
    const id_utilisateur = parseInt(UserHelper.getTokenInfo().id_utilisateur);
    const id_nf = parseInt(localStorage.getItem('id_nf'));
    this.service.saveScore(
      this.codeHollandCompose, 
      this.id_codeholland, 
      id_utilisateur,
      id_nf,
      this.resultat[0].value,
      this.resultat[1].value,
      this.resultat[2].value)
      .subscribe(result => {
      console.log(result);
    });
  }

  getExplanation(code: string) {
    switch(code){
      case 'R':
        return 'Réaliste'
      case 'I':
        return 'Investigateur'
      case 'A':
        return 'Artistique'
      case 'S':
        return 'Social'
      case 'E':
        return 'Entreprenant'
      case 'C':
        return 'Conventionnel'
    }
  }

  redoQuiz(){
    this.router.navigate(['/quiz']);
  }


}
