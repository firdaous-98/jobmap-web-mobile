import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) { }

  ngOnInit() {}

  onBackClicked() {
    this.backClickEvent.emit();
  }

  onHomeClicked() {
    this.router.navigate(['/home']);
  }

}
