import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { UserHelper } from 'src/app/core/helpers/user-helper';
import { TokenInfo } from 'src/app/core/models/token.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input()
  showBack: boolean;

  @Input()
  showHome: boolean;

  @Output()
  backClickEvent = new EventEmitter();

  tokenInfo: TokenInfo;

  constructor(private router: Router) {
    this.tokenInfo = UserHelper.getTokenInfo();
   }

  ngOnInit() {}

  onBackClicked() {
    this.backClickEvent.emit();
  }

  onHomeClicked() {
    this.router.navigate(['/home']);
  }

}
