import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeHolland } from '../core/enums/code-holland.enum';
import { Question } from '../core/models/question.model';
import { AppService } from '../core/services/app.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
})
export class QuizPage implements OnInit {

  questionsArray: Question[];
  currentQuestion: Question;
  reponses: CodeHolland[] = [];
  numberOfQuestions: number = 1;
  isBack: boolean = false;

  constructor(private service: AppService, private router: Router) {
   }

  ngOnInit() {
    this.service.get_questionsArray().subscribe((result: Question[]) => {
      this.questionsArray = result;
      this.currentQuestion = this.questionsArray[0];
      // this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == this.currentQuestion.id_step).length;
      this.currentQuestion = this.questionsArray.find(e => e.id_step == "4" && e.id_quest == "49")
      // console.log(this.currentQuestion);
    });
  }

  getResponse(value: any){
    debugger
    if(this.currentQuestion.id_step == '4'){
      this.reponses = this.reponses.concat(value);
    } else {
      this.reponses.push(value);
    }
    var nextQuestion = this.questionsArray.find(question => 
      question.id_quest == (this.currentQuestion.id_quest != '40' ? this.incrementString(this.currentQuestion.id_quest) : '46'));

    if(nextQuestion != null){
      this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == nextQuestion.id_step).length;
      this.currentQuestion = nextQuestion;
      console.log(this.reponses);
    }
    else {
      var resultat = this.composeCodeHolland();
      this.router.navigate(['/result'], { state: { example: 'bar' }});
    }
  }

  getPreviousQuestion(){
    var previousQuestion = this.questionsArray.find(question => 
      question.id_quest == (this.currentQuestion.id_quest != '46' ? this.decrementString(this.currentQuestion.id_quest) : '40'));
      
    if(previousQuestion != null){
      this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == previousQuestion.id_step).length;
      this.currentQuestion = previousQuestion;
      console.log(this.reponses);
    }
    else {
      this.router.navigate(['/home']);
    }
  }

  incrementString(id: string): string {
    var newValue = parseInt(id);
    newValue++;
    return newValue.toString();
  }

  decrementString(id: string): string {
    var newValue = parseInt(id);
    newValue--;
    return newValue.toString();
  }

  backClick(event: any){
    this.isBack = event;
  }

  composeCodeHolland() {
    let scores = {
      totalR: 0,
      totalI: 0,
      totalA: 0,
      totalS: 0,
      totalE: 0,
      totalC: 0
    }
    this.reponses.forEach(reponse => {
      debugger
      switch(reponse){
        case CodeHolland.R:
            scores.totalR++;
          break;
        case CodeHolland.I:
            scores.totalI++;
          break;
        case CodeHolland.A:
            scores.totalA++;
          break;
        case CodeHolland.S:
            scores.totalS++;
          break;
        case CodeHolland.E:
            scores.totalE++;
          break;
        case CodeHolland.C:
            scores.totalC++;
          break;
      }
    });

    var array = [
      {
        key: 'R',
        value: scores.totalR,
      },
      {
        key: 'I',
        value: scores.totalI,
      },
      {
        key: 'A',
        value: scores.totalA,
      },
      {
        key: 'S',
        value: scores.totalS,
      },
      {
        key: 'E',
        value: scores.totalE,
      },
      {
        key: 'C',
        value: scores.totalC,
      }
    ]; 

    array.sort(function(obj1, obj2) {
      return obj1.value - obj2.value;
   });
   
    console.log(array);
  }
}
