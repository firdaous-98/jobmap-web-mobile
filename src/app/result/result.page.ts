import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {

  RHeight: string = '';
  IHeight: string = '';
  AHeight: string = '';

  array: { key: string, value: number }[] = [
    { 'key': 'R', 'value': 10 },
    { 'key': 'I', 'value': 15 },
    { 'key': 'A', 'value': 7 }
  ];
  constructor() { }

  ngOnInit() {
    this.calculChartHeight();
  }

  calculChartHeight() {
    const total = this.array.reduce((a, b) => a + b.value, 0);
    this.RHeight = (this.array.filter(item => item.key === 'R')[0].value * 170 / total).toString() + 'px';
    this.IHeight = (this.array.filter(item => item.key === 'I')[0].value * 170 / total).toString() + 'px';
    this.AHeight = (this.array.filter(item => item.key === 'A')[0].value * 170 / total).toString() + 'px';
  }

}
