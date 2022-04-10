import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CodeHolland } from '../core/enums/code-holland.enum';
import { TypeUtilisateur } from '../core/enums/type-utilisateur.enum';
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
  resultPerStep: { id_step: string, resultat: any }[] = [];
  previousResponse: CodeHolland | ResultChoix[];
  numberOfQuestions: number = 1;
  isBack: boolean = false;
  scores: Scores;
  isArab: boolean;
  reponsesArray: string;

  constructor(
    private service: AppService,
    public translate: TranslateService,
    public translatorService: TranslatorService,
    public alertController: AlertController,
    private router: Router) {
    this.isArab = localStorage.getItem('language') == "ar";
    this.reponsesArray = localStorage.getItem('reponses');
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
      
      if(this.reponsesArray != "null") {
        this.reponses = <Reponse[]> JSON.parse(this.reponsesArray);
        var currentQuestion = this.reponses.pop();
        this.currentQuestion = this.questionsArray.find(e => e.id_step == currentQuestion.id_step && e.id_quest == currentQuestion.id_quest);
        
      } else {
        this.currentQuestion = this.questionsArray[0];
      }
      this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == this.currentQuestion.id_step).length;
    });
  }

  initScore() {
    this.scores = { totalR: 0, totalI: 0, totalA: 0, totalS: 0, totalE: 0, totalC: 0 }
  }

  async getResponse(reponse: Reponse) {
    var existingQuestionIndex = this.reponses.findIndex(e => e.id_quest == this.currentQuestion.id_quest);
    if (existingQuestionIndex != -1) {
      this.reponses[existingQuestionIndex].code_holland = reponse.code_holland;
    }
    else {
      this.reponses.push(reponse);
    }

    localStorage.setItem('reponses', JSON.stringify(this.reponses));

    var nextQuestion = this.questionsArray.find(question =>
      question.id_quest == (this.currentQuestion.id_quest != '40' ? this.incrementString(this.currentQuestion.id_quest) : '46'));

    if (nextQuestion != null) {
      if (nextQuestion.id_step != this.currentQuestion.id_step) {
        await this.showMotivationAlert(nextQuestion.id_step);
        this.reponsesPerStep = this.reponses.filter(e => e.id_step == this.currentQuestion.id_step);
        var resultat = this.composeCodeHolland(this.reponsesPerStep);
        this.resultPerStep.push({
          id_step: this.currentQuestion.id_step,
          resultat: resultat
        });
        localStorage.setItem(`result_step_${this.currentQuestion.id_step}`, JSON.stringify(resultat));

        if (nextQuestion.id_quest == "49") {
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
      localStorage.setItem('result_step_4', JSON.stringify(resultat));
      var resultatFinal = this.composeCodeHolland(this.reponses);
      localStorage.setItem('reponses', null);
      this.router.navigate(['/result'], { state: { resultat: resultatFinal, resultPerStep: this.resultPerStep, fromQuiz: true } });
    }
  }

  getPreviousQuestion() {
    var previousQuestion = this.questionsArray.find(question =>
      question.id_quest == (this.currentQuestion.id_quest != '46' ? this.decrementString(this.currentQuestion.id_quest) : '40'));

    if (previousQuestion != null) {
      this.numberOfQuestions = this.questionsArray.filter(e => e.id_step == previousQuestion.id_step).length;
      this.previousResponse = this.reponses.find(e => e.id_quest == previousQuestion.id_quest)?.code_holland as CodeHolland;
      this.currentQuestion = previousQuestion;
    }
    else {
      this.router.navigate(['/info']);
    }
  }

  async showMotivationAlert(nextStep: string = null) {
    let typeUtilisateur = parseInt(localStorage.getItem('id_type_utilisateur'));
    let message = this.isArab ?
      (typeUtilisateur == TypeUtilisateur.Etudiant ?
        "اختر الإجابات التي تناسبك وإذا لم تكن كذلك ، فحدد الإجابة الأقرب لك" :
        "اختر الإجابات التي تتطابق مع الطالب / ابنك ، وإذا لم تكن كذلك ، فحدد الإجابة الأقرب له") :
      (typeUtilisateur == TypeUtilisateur.Etudiant ?
        "Choisissez les réponses qui vous correspondent et si ce n'est pas le cas, cochez le réponde proche de votre profil" :
        "Choisissez les réponses qui correspondent à votre étudiant/fils et si ce n'est pas le cas, cochez le réponde proche de leur profil");

    let image = "test.png";

    if (nextStep != null) {
      switch (nextStep) {
        case "2":
          message = this.isArab ? "خذ وقتك ، لا يوجد توقيت محدد" :
            "Prenez votre temps, il n y pas de timing précis";
          break;
        case "3":
          message = this.isArab ?
            (typeUtilisateur == TypeUtilisateur.Etudiant ?
              "أنت تتقدم! هذا جيد ، لقد اقتربت من اكتشاف نفسك" :
              "أنت تتقدم! هذا جيد ، لقد اقتربت من اكتشاف الملف الشخصي لابنك / الطالب") :
            (typeUtilisateur == TypeUtilisateur.Etudiant ?
              "Vous avancez ! C'est bien, vous êtes proches de la découverte de vous même" :
              "Vous avancez ! C'est bien, vous êtes proches de la découverte du profil de votre fils/étudiant");
          break;
        case "4":
          message = this.isArab ?
            (typeUtilisateur == TypeUtilisateur.Etudiant ?
              "فقط عدد قليل من الأسئلة وسيتم إنشاء ملف التعريف الخاص بك" :
              "فقط عدد قليل من الأسئلة وسيتم إنشاء ملف تعريف ابنك / الطالب") :
            (typeUtilisateur == TypeUtilisateur.Etudiant ?
              "Plus que quelques questions et votre profil sera généré" :
              "Plus que quelques questions et le profil de votre fils/étudiant sera généré");
          break;
        case "49":
          message = this.isArab ?
            (typeUtilisateur == TypeUtilisateur.Etudiant ?
              "فقط بضعة أسئلة أخرى ، وسيكون تقريرك جاهزًا" :
              "فقط بضعة أسئلة أخرى ، وسيكون تقرير ابنك / الطالب جاهزًا") :
            (typeUtilisateur == TypeUtilisateur.Etudiant ?
              "Plus que quelques questions, et votre rapport sera prêt" :
              "Plus que quelques questions, et le rapport de votre fils/étudiant sera prêt");
          break;
        case "done":
          message = this.isArab ?
            (typeUtilisateur == TypeUtilisateur.Etudiant ?
              "تهانينا ، لقد انتهى الاختبار ، يمكنك الآن تنزيل تقريرك التفصيلي" :
              "يمكنك الآن تنزيل التقرير التفصيلي الخاص بابنك / الطالب") :
            (typeUtilisateur == TypeUtilisateur.Etudiant ?
              "Bravo c'est fini ! vous pouvez désormais télécharger votre rapport approfondi" :
              "Bravo c'est fini ! vous pouvez désormais télécharger votre rapport approfondi de votre fils/étudiant");
          image = "felicitations.png";
          break;
        default:
          message = this.isArab ?
            (typeUtilisateur == TypeUtilisateur.Etudiant ?
              "اختر الإجابات التي تناسبك وإذا لم تكن كذلك ، فحدد الإجابة الأقرب لك" :
              "اختر الإجابات التي تتطابق مع الطالب / ابنك ، وإذا لم تكن كذلك ، فحدد الإجابة الأقرب له") :
            (typeUtilisateur == TypeUtilisateur.Etudiant ?
              "Choisissez les réponses qui vous correspondent et si ce n'est pas le cas, cochez le réponde proche de votre profil" :
              "Choisissez les réponses qui correspondent à votre étudiant/fils et si ce n'est pas le cas, cochez le réponde proche de leur profil");

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
      if (typeof reponse.code_holland == 'number') {
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

    array.sort(function (obj1, obj2) {
      return obj2.value - obj1.value;
    });

    var finalResult: Score[] = [
      { key: array[0].key, value: array[0].value },
      { key: array[1].key, value: array[1].value },
      { key: array[2].key, value: array[2].value }
    ];

    return finalResult;
  }

  incrementScore(code: CodeHolland) {
    switch (code) {
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

  @HostListener('unloaded')
  ngOnDestroy() {
    console.log('Items destroyed');
  }
}
