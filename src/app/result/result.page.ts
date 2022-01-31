import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {

  constructor(private router: Router) {
    console.log(this.router.getCurrentNavigation().extras.state.example);
   }

  ngOnInit() {
  }

}
