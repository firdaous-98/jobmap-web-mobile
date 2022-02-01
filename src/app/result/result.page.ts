import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Score } from '../core/models/score.model';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage {

  resultat: Score[];

  constructor(private router: Router) {
    this.resultat = this.router.getCurrentNavigation().extras.state?.resultat;
   }

}
