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

  constructor(private service: AppService, private router: Router) {
   }

  ngOnInit() {
    this.service.get_questionsArray().subscribe((result: Question[]) => {
      this.questionsArray = result;
      this.currentQuestion = this.questionsArray[0];
      // this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == this.currentQuestion.id_step).length;
      this.currentQuestion = this.questionsArray.find(e => e.id_step == "4" && e.id_quest == "46")
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
      this.router.navigate(['/result']);
    }
    
  }

  incrementString(id: string): string {
    var newValue = parseInt(id);
    newValue++;
    return newValue.toString();
  }

}
