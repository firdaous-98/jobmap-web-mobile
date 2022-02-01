import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input()
  showBack: boolean;

  @Output()
  backClickEvent = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  onBackClicked() {
    this.backClickEvent.emit();
  }

}
