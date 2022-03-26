import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CodeHolland } from '../core/enums/code-holland.enum';
import { ResultChoix } from '../core/models/choix.model';
import { Question } from '../core/models/question.model';
import { Reponse, Scores } from '../core/models/reponse.model';
import { Score } from '../core/models/score.model';
import { AppService } from '../core/services/app.service';
import { TranslatorService } from '../core/services/translate.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
})
export class QuizPage {

  questionsArray: Question[];
  currentQuestion: Question;
  reponses: Reponse[] = [];
  reponsesPerStep: Reponse[] = [];
  resultPerStep: {id_step: string, resultat: any}[] = [];
  previousResponse: CodeHolland | ResultChoix[];
  numberOfQuestions: number = 1;
  isBack: boolean = false;
  scores: Scores;
  isArab: boolean;

  constructor(
    private service: AppService, 
    public translate: TranslateService, 
    public translatorService: TranslatorService,
    public alertController: AlertController,
    private router: Router) {
      this.isArab = localStorage.getItem('language') == "ar";
      this.initQuestions();
      this.initScore();
   }

   ngOnInit() {
    setTimeout(() => {
      this.translate.use(this.translatorService.getSelectedLanguage());      
    }, 500);
   }

   async initQuestions() {
    await this.showMotivationAlert();
    this.service.get_questionsArray().subscribe((result: Question[]) => {
      this.questionsArray = result;
      this.currentQuestion = this.questionsArray[0];
      // this.currentQuestion = this.questionsArray.find(e => e.id_quest == "40")
      // this.currentQuestion = this.questionsArray.find(e => e.id_step == "4" && e.id_quest == "49")
      this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == this.currentQuestion.id_step).length;
    });
  }

  initScore(){
    this.scores = { totalR: 0, totalI: 0, totalA: 0, totalS: 0, totalE: 0, totalC: 0 }
  }

  async getResponse(reponse: Reponse){
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
      if(nextQuestion.id_step != this.currentQuestion.id_step) {
        await this.showMotivationAlert(nextQuestion.id_step);
        this.reponsesPerStep = this.reponses.filter(e => e.id_step == this.currentQuestion.id_step);
        var resultat = this.composeCodeHolland(this.reponsesPerStep);
        this.resultPerStep.push({
          id_step: this.currentQuestion.id_step,
          resultat: resultat
        });

        if(nextQuestion.id_quest == "49") {
          await this.showMotivationAlert(nextQuestion.id_quest);
        }

        this.reponsesPerStep = [];
      }
      this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == nextQuestion.id_step).length;
      this.currentQuestion = nextQuestion;
    }
    else {
      await this.showMotivationAlert("done");
      this.reponsesPerStep = this.reponses.filter(e => e.id_step == "4");
        var resultat = this.composeCodeHolland(this.reponsesPerStep);
        this.resultPerStep.push({
          id_step: "4",
          resultat: resultat
        });
      var resultatFinal = this.composeCodeHolland(this.reponses);
      this.router.navigate(['/result'], { state: { resultat: resultatFinal, resultPerStep: this.resultPerStep, fromQuiz: true }});
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

  async showMotivationAlert(nextStep: string = null) {
    let message = this.isArab ? 
    "اختر الإجابات التي تناسبك وإذا لم تكن كذلك ، فحدد الإجابة الأقرب لك" : 
    "Choisissez les réponses qui vous correspondent et si ce n'est pas le cas, cochez le réponde proche de votre profil";
    
    let image = "test.png";

    if(nextStep != null) {
      switch(nextStep) {
      case "2":
        message = this.isArab ? "خذ وقتك ، لا يوجد توقيت محدد" :
        "Prenez votre temps, il n y pas de timing précis";
        break;
      case "3":
        message = this.isArab ? "أنت تتقدم! هذا جيد ، لقد اقتربت من اكتشاف نفسك" :
        "Vous avancez ! C'est bien, vous êtes proches de la découverte de vous même";
        break;
      case "4":
        message = this.isArab ? "فقط عدد قليل من الأسئلة وسيتم إنشاء ملف التعريف الخاص بك" :
        "Plus que quelques questions et votre profil sera généré";
        break;
      case "49":
          message = this.isArab ? "فقط بضعة أسئلة أخرى ، وسيكون تقريرك جاهزًا" :
          "Plus que quelques questions, et votre rapport sera prêt";
          break;
      case "done":
          message = this.isArab ? "تهانينا ، لقد انتهى الاختبار ، قم بتنزيل التقرير المصغر الخاص بك وسيتم إرسال تقرير ثاني متعمق إليك عبر البريد الإلكتروني" :
          "Bravo c'est fini ! télécharger votre mini rapport et un deuxième rapport approfondi vous sera envoyé par mail";
          image = "felicitations.png";
          break;
      default:
        message = this.isArab ? 
          "اختر الإجابات التي تناسبك وإذا لم تكن كذلك ، فحدد الإجابة الأقرب لك" : 
          "Choisissez les réponses qui vous correspondent et si ce n'est pas le cas, cochez le réponde proche de votre profil";
        break;
    }
    }
    
    const alert = await this.alertController.create({
      cssClass: "scaledAlert",
      message: `<img src="./assets/img/${image}" alt="g-maps" class="alert-image"><br/>
      <p>${message}</p>`,
      buttons: ['OK']
    });

    await alert.present();
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

  composeCodeHolland(reponses: Reponse[]) {
    this.initScore();
    reponses.forEach(reponse => {
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
