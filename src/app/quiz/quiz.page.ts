import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CodeHolland } from '../core/enums/code-holland.enum';
import { Question } from '../core/models/question.model';
import { Reponse, Scores } from '../core/models/reponse.model';
import { Score } from '../core/models/score.model';
import { AppService } from '../core/services/app.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
})
export class QuizPage {

  questionsArray: Question[];
  currentQuestion: Question;
  reponses: Reponse[] = [];
  previousResponse: CodeHolland | CodeHolland[];
  numberOfQuestions: number = 1;
  isBack: boolean = false;
  scores: Scores;

  constructor(private service: AppService, private router: Router) {
    this.initQuestions();
    this.initScore();
   }

   initQuestions() {
    this.service.get_questionsArray().subscribe((result: Question[]) => {
      this.questionsArray = result;
      // this.currentQuestion = this.questionsArray[0];
      this.currentQuestion = this.questionsArray.find(e => e.id_step == "4" && e.id_quest == "49")
      this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == this.currentQuestion.id_step).length;
    });
  }

  initScore(){
    this.scores = { totalR: 0, totalI: 0, totalA: 0, totalS: 0, totalE: 0, totalC: 0 }
  }

  getResponse(reponse: Reponse){
    var existingQuestionIndex = this.reponses.findIndex(e => e.id_quest == this.currentQuestion.id_quest);
    if (existingQuestionIndex != -1){
      this.reponses[existingQuestionIndex].code_holland = reponse.code_holland;
    }
    else {
      this.reponses.push(reponse);
    }    

    var nextQuestion = this.questionsArray.find(question => 
      question.id_quest == (this.currentQuestion.id_quest != '40' ? this.incrementString(this.currentQuestion.id_quest) : '46'));

    if(nextQuestion != null){
      this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == nextQuestion.id_step).length;
      this.currentQuestion = nextQuestion;
    }
    else {
      var resultat = this.composeCodeHolland();
      this.router.navigate(['/result'], { state: { resultat: resultat, fromQuiz: true }});
    }
  }

  getPreviousQuestion(){
    var previousQuestion = this.questionsArray.find(question => 
      question.id_quest == (this.currentQuestion.id_quest != '46' ? this.decrementString(this.currentQuestion.id_quest) : '40'));
      
    if(previousQuestion != null){
      this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == previousQuestion.id_step).length;
      this.previousResponse = this.reponses.find(e => e.id_quest == previousQuestion.id_quest)?.code_holland as CodeHolland;
      this.currentQuestion = previousQuestion;
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

  composeCodeHolland() {
    this.reponses.forEach(reponse => {
      if(typeof reponse.code_holland == 'number'){
        this.incrementScore(reponse.code_holland);
      }
      else {
        reponse.code_holland.forEach(choix => {
          this.incrementScore(choix.code_holland);
        })
      }
    });

    var array: Score[] = [
      {
        key: 'R',
        value: this.scores.totalR,
      },
      {
        key: 'I',
        value: this.scores.totalI,
      },
      {
        key: 'A',
        value: this.scores.totalA,
      },
      {
        key: 'S',
        value: this.scores.totalS,
      },
      {
        key: 'E',
        value: this.scores.totalE,
      },
      {
        key: 'C',
        value: this.scores.totalC,
      }
    ]; 

    array.sort(function(obj1, obj2) {
      return obj2.value - obj1.value;
   });

    var finalResult: Score[] = [
      { key: array[0].key, value: array[0].value },
      { key: array[1].key, value: array[1].value },
      { key: array[2].key, value: array[2].value }
    ];

    return finalResult;
  }

  incrementScore(code: CodeHolland){
    switch(code){
      case CodeHolland.R:
          this.scores.totalR++;
        break;
      case CodeHolland.I:
        this.scores.totalI++;
        break;
      case CodeHolland.A:
        this.scores.totalA++;
        break;
      case CodeHolland.S:
        this.scores.totalS++;
        break;
      case CodeHolland.E:
        this.scores.totalE++;
        break;
      case CodeHolland.C:
        this.scores.totalC++;
        break;
    }
  }
}
