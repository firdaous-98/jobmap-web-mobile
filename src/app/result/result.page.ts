import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import {
  ApexAxisChartSeries,
  ApexChart, ApexTitleSubtitle, ApexXAxis, ChartComponent
} from 'ng-apexcharts';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { AnneeEtudeEnum } from '../core/enums/annee-etude.enum';
import { TypeUtilisateur } from '../core/enums/type-utilisateur.enum';
import { UserHelper } from '../core/helpers/user-helper';
import { Metier } from '../core/models/metier.model';
import { Score } from '../core/models/score.model';
import { TokenInfo } from '../core/models/token.model';
import { TypeBac } from '../core/models/type-bac.model';
import { AppService } from '../core/services/app.service';
import { TranslatorService } from '../core/services/translate.service';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage {

  @ViewChild('chart') chart: ChartComponent;

  public chartOptions: Partial<ChartOptions>;

  regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  emailPartner!: string;
  scorePartner?: any;

  resultat: Score[];
  resultPerStep: { id_step: string, resultat: any }[] = [];
  resultatStepOne = "";
  resultatStepTwo = "";
  resultatStepThree = "";
  resultatStepFour = "";

  autreResultat: Score[];
  fromQuiz!: boolean;

  id_type_utilisateur!: TypeUtilisateur;
  annee_etude!: AnneeEtudeEnum;
  typeUtilisateur = TypeUtilisateur;
  anneeEtude = AnneeEtudeEnum;
  tokenInfo!: TokenInfo;

  codeHollandCompose: string;
  twoEquals: boolean = false;
  showOtherResult: boolean = false;

  FirstHeight: string = '';
  SecondHeight: string = '';
  ThirdHeight: string = '';

  OtherFirstHeight: string = '';
  OtherSecondHeight: string = '';
  OtherThirdHeight: string = '';

  listeMetiers: Metier[];
  listeTypeBac: TypeBac[];
  id_codeholland!: number;

  OtherCodeHollandCompose: string;
  OtherListeMetiers: Metier[];
  OtherListeTypeBac: TypeBac[];

  showNoOtherScore = false;
  invitationSent = false;

  isArab: boolean;

  link = "afa9.org/map";

  constructor(
    private router: Router,
    public translate: TranslateService,
    public translatorService: TranslatorService,
    private service: AppService,
    public toastController: ToastController
    ) {
    this.resultat = this.router.getCurrentNavigation().extras.state?.resultat;
    this.fromQuiz = this.router.getCurrentNavigation().extras.state?.fromQuiz;
    this.resultPerStep = this.router.getCurrentNavigation().extras.state?.resultPerStep;
    this.tokenInfo = UserHelper.getTokenInfo();
    this.isArab = localStorage.getItem('language') == "ar";
  }


  async ngOnInit() {
    setTimeout(() => {
      this.translate.use(this.translatorService.getSelectedLanguage());
    }, 500);
    if (this.resultat != null) {
      this.checkEquality();
      if (!this.twoEquals) {
        this.calculChartHeight();
        this.composeCodeHolland();
        await this.getMetiers();
        await this.getTypesBac();
        if (this.fromQuiz) this.saveScore();
        this.generateChart(this.resultat);
        this.id_type_utilisateur = parseInt(localStorage.getItem('id_type_utilisateur'));
        this.annee_etude = parseInt(localStorage.getItem('annee_etude'));
      }
    }
  }

  @HostListener('unloaded')
  ngOnDestroy() {
    console.log('Items destroyed');
  }

  backClick() {
    this.router.navigate(['/home']);
  }

  checkEquality() {
    if (this.resultat[0].value == this.resultat[1].value ||
      this.resultat[0].value == this.resultat[2].value ||
      this.resultat[1].value == this.resultat[2].value) {
      this.twoEquals = true;
    }
  }

  calculChartHeight() {
    const total = this.resultat.reduce((a, b) => a + b.value, 0);
    this.FirstHeight = (this.resultat[0].value * 170 / total).toString() + 'px';
    this.SecondHeight = (this.resultat[1].value * 170 / total).toString() + 'px';
    this.ThirdHeight = (this.resultat[2].value * 170 / total).toString() + 'px';
  }

  composeCodeHolland() {
    this.codeHollandCompose = this.resultat.map(e => e.key).join('');
  }

  async getMetiers() {
    var id_nf = parseInt(localStorage.getItem('id_nf'));
    var result = await this.service.getMetiers(this.codeHollandCompose, id_nf).toPromise();
    if (result?.message == null) {
      this.listeMetiers = result as unknown as Metier[];
      this.id_codeholland = this.listeMetiers[0].id_codeholland;
    }
  }

  async getTypesBac() {
    const id_metiers = this.listeMetiers.map(e => e.id_metier);
    var result = await this.service.getMetierTypeBac(id_metiers).toPromise();
    this.listeTypeBac = result;
  }

  mapResultPerStep() {

    if (this.fromQuiz) {
      this.resultatStepOne = this.resultPerStep?.find(e => e.id_step == "1").resultat.map(f => f.key).join('');
      this.resultatStepTwo = this.resultPerStep?.find(e => e.id_step == "2").resultat.map(f => f.key).join('');
      this.resultatStepThree = this.resultPerStep?.find(e => e.id_step == "3").resultat.map(f => f.key).join('');
      this.resultatStepFour = this.resultPerStep?.find(e => e.id_step == "4").resultat.map(f => f.key).join('');
    }
    else {
      this.resultatStepOne = this.resultPerStep?.find(e => e.id_step == "1").resultat;
      this.resultatStepTwo = this.resultPerStep?.find(e => e.id_step == "2").resultat;
      this.resultatStepThree = this.resultPerStep?.find(e => e.id_step == "3").resultat;
      this.resultatStepFour = this.resultPerStep?.find(e => e.id_step == "4").resultat;
    }
  }

  saveScore() {
    const id_utilisateur = parseInt(this.tokenInfo?.id_utilisateur);
    const id_nf = parseInt(localStorage.getItem('id_nf'));

    this.mapResultPerStep();

    this.service.saveScore(
      this.codeHollandCompose,
      this.id_codeholland,
      id_utilisateur,
      id_nf,
      this.resultat[0]?.value,
      this.resultat[1]?.value,
      this.resultat[2]?.value,
      this.resultatStepOne,
      this.resultatStepTwo,
      this.resultatStepThree,
      this.resultatStepFour
    )
      .subscribe(result => {
        console.log(result);
      });
  }

  async getPartnerScore() {
    this.autreResultat = [];
    var result = await this.service.getPartnerScore(this.emailPartner).toPromise();
    if (result?.scoring != undefined) {
      this.showNoOtherScore = false;
      this.scorePartner = result;
      this.OtherCodeHollandCompose = this.scorePartner?.scoring;

      var score = this.scorePartner?.scoring.split("");

      this.autreResultat.push({ key: score[0], value: parseInt(this.scorePartner?.score_firstletter) });
      this.autreResultat.push({ key: score[1], value: parseInt(this.scorePartner?.score_secondletter) });
      this.autreResultat.push({ key: score[2], value: parseInt(this.scorePartner?.score_thirdletter) });

      const total = this.autreResultat.reduce((a, b) => a + b.value, 0);
      this.OtherFirstHeight = (this.autreResultat[0].value * 170 / total).toString() + 'px';
      this.OtherSecondHeight = (this.autreResultat[1].value * 170 / total).toString() + 'px';
      this.OtherThirdHeight = (this.autreResultat[2].value * 170 / total).toString() + 'px';

      var result = await this.service.getMetiers(this.OtherCodeHollandCompose, this.scorePartner?.id_nf).toPromise();
      this.OtherListeMetiers = result as unknown as Metier[];

      const id_metiers = this.OtherListeMetiers.map(e => e.id_metier);
      var result2 = await this.service.getMetierTypeBac(id_metiers).toPromise();
      this.OtherListeTypeBac = result2;

      this.showOtherResult = true;

    }

    else {
      this.showNoOtherScore = true;
    }
  }

  getExplanation(code: string) {
    switch (code) {
      case 'R':
        return this.translate.instant('R');
      case 'I':
        return this.translate.instant('I');
      case 'A':
        return this.translate.instant('A');
      case 'S':
        return this.translate.instant('S');
      case 'E':
        return this.translate.instant('E');
      case 'C':
        return this.translate.instant('C');
    }
  }

  getExplanationPdf(code: string) {
    switch (code) {
      case 'R':
        return 'Réaliste'
      case 'I':
        return 'Investigateur'
      case 'A':
        return 'Artistique'
      case 'S':
        return 'Social'
      case 'E':
        return 'Entreprenant'
      case 'C':
        return 'Conventionnel'
    }
  }

  async sendInvitation() {
    this.service.sendEmail(
      this.emailPartner,
      "Invitation Afa9",
      `${this.tokenInfo.prenom} ${this.tokenInfo.nom} vous invite à passer le test présent sur ce lien: ${this.link}`
    );
      this.invitationSent = true;
      (await this.toastController.create({ message: this.translate.instant('INVITATION_SENT'), duration: 2500, cssClass: 'app-toast', position: 'bottom', animated: true, mode: 'ios' })).present();
  }

  sendRequestMail() {

    this.mapResultPerStep();

    var email = "bendoudouch.98@gmail.com";
    var subject = "Demande de reception du rapport approfondi";
    var body = `<p>${this.tokenInfo.prenom} ${this.tokenInfo.nom} vient de passer le questionnaire RIASEC et souhaite recevoir un rapport approfondi </p><br>`
      + "Résultat obtenu : <br>"
      + `Score final : ${this.codeHollandCompose} <br>`
      + `Scores intermédiaires : <br>`
      + `Etape 1 : ${this.resultatStepOne} <br>`
      + `Etape 2 : ${this.resultatStepTwo} <br>`
      + `Etape 3 : ${this.resultatStepThree} <br>`
      + `Etape 4 : ${this.resultatStepFour} <br>`
      + `Adresse email de l'utilisateur: ${this.tokenInfo.adresse_email} <br>`;

    this.service.sendEmail(
      email,
      subject,
      body
    ).subscribe(_ => {
      console.log("email sent");
      this.invitationSent = true;
    });

  }

  redoQuiz() {
    this.router.navigate(['/info']);
  }

  generateChart(resultat: Score[]) {
    debugger
    this.chartOptions = {
      series: [
        {
          name: 'My-series',
          data: [resultat[0].value, resultat[1].value, resultat[2].value],
        },
      ],
      chart: {
        height: 350,
        type: 'bar'
      },
      title: {
        text: '',
      },
      xaxis: {
        categories: [
          resultat[0].key,
          resultat[1].key,
          resultat[2].key
        ],
      },
    };
  }

  async generatePdf() {

    var metierRows: any[] = [];

    metierRows = [['Métier(s)', 'D', 'P', 'C']];

    this.listeMetiers.forEach(metier => {
      metierRows.push([metier.libelle_metier, metier.id_donnees.toString(), metier.id_personnes.toString(), metier.id_choses.toString()]);
    });

    var otherMetierRows: any[] = [];
    var otherMetierTable: any;

    if (this.OtherListeMetiers?.length > 0) {
      otherMetierRows = [['Métier(s)', 'D', 'P', 'C']];
      this.OtherListeMetiers.forEach(metier => {
        otherMetierRows.push([metier.libelle_metier, metier.id_donnees.toString(), metier.id_personnes.toString(), metier.id_choses.toString()]);
      });

      otherMetierTable = [
        {
          text: this.id_type_utilisateur == TypeUtilisateur.Parent ?
            'Métiers et professions correspondant au profil RIASEC trouvé par votre fils/étudiant :' :
            'Métiers et professions correspondant au profil RIASEC trouvé par votre parent/prof :',
          fontSize: 15,
          margin: [20, 20, 30, 0]
        },
        {
          layout: 'lightHorizontalLines', // optional
          table: {
            headerRows: 1,
            widths: [200, 70, 70, '*'],

            body: otherMetierRows
          },
          margin: 30
        }
      ]
    } else {
      otherMetierTable = null;
    }

    var score: any;
    if (!this.showOtherResult) {
      score = {
        columns: [
          [
            {
              text: 'Vous avez obtenu le score : ' + this.codeHollandCompose,
              bold: true,
              fontSize: 18,
              alignment: 'center',
              margin: [20, 0, 0, 20]
            },
            {
              image: await this.getBase64Image(),
              width: 500
            }
          ]
        ]
      }
    } else {
      score = {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              body: [
                [
                  {
                    text: 'Vous avez obtenu le score : ' + this.codeHollandCompose,
                    bold: true,
                    fontSize: 9,
                    alignment: 'center',
                    margin: [20, 0, 0, 20]
                  },
                  {
                    text: (this.id_type_utilisateur == TypeUtilisateur.Parent ? 'Votre fils/ étudiant a obtenu le score : ' : 'Votre parent/prof a obtenu le score : ') + this.OtherCodeHollandCompose,
                    bold: true,
                    fontSize: 9,
                    alignment: 'center',
                    margin: [20, 0, 0, 20]
                  }
                ],
                [
                  {
                    image: await this.getBase64Image(),
                    alignment: 'center',
                    width: 250
                  },
                  {
                    image: await this.getBase64Image(),
                    alignment: 'center',
                    width: 250
                  }
                ],
                [
                  [
                    {
                      text: this.resultat[0].key + ": " + this.getExplanationPdf(this.resultat[0].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    },
                    {
                      text: this.resultat[1].key + ": " + this.getExplanationPdf(this.resultat[1].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    },
                    {
                      text: this.resultat[2].key + ": " + this.getExplanationPdf(this.resultat[2].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    }
                  ],
                  [
                    {
                      text: this.autreResultat[0].key + ": " + this.getExplanationPdf(this.autreResultat[0].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    },
                    {
                      text: this.autreResultat[1].key + ": " + this.getExplanationPdf(this.autreResultat[1].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    },
                    {
                      text: this.autreResultat[2].key + ": " + this.getExplanationPdf(this.autreResultat[2].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    }
                  ]
                ]
              ]
            },
            margin: [5, 10, 5, 10]
          }
        ]
      }
    }

    var explanation = {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            body: [
              [
                {
                  text: this.resultat[0].key + ": " + this.getExplanationPdf(this.resultat[0].key)
                }
              ],
              [
                {
                  text: this.resultat[1].key + ": " + this.getExplanationPdf(this.resultat[1].key)
                }
              ],
              [
                {
                  text: this.resultat[2].key + ": " + this.getExplanationPdf(this.resultat[2].key)
                }
              ],
            ]
          },
          layout: {
            hLineColor: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 'black' : 'white';
            },
            vLineColor: function (i, node) {
              'blue';
            },
            paddingLeft: function (i, node) { return 80; },
            paddingRight: function (i, node) { return 80; },
            paddingTop: function (i, node) { return 10; },
            paddingBottom: function (i, node) { return 10; }
          }
        },
        { width: '*', text: '' }
      ]
    }

    var explanationTable = this.showOtherResult ? null : explanation;

    const documentDefinition = {
      content: [
        {
          text: 'Résultat du questionnaire',
          bold: true,
          fontSize: 20,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
            [{
              text: this.tokenInfo.nom + ' ' + this.tokenInfo.prenom,
              style: 'name'
            },
            {
              text: 'Email : ' + this.tokenInfo.adresse_email,
            }
            ]
          ]
        },
        score,
        {
          text: 'Cela pourra vous aidez à trouver le métier qui correspond à votre profil : ',
          fontSize: 15,
          margin: [20, 0, 0, 0]
        },
        {
          text: ' ',
          fontSize: 15,
          margin: [20, 0, 0, 0]
        },
        explanationTable,
        {
          text: 'Métiers et professions correspondant à votre profil RIASEC :',
          fontSize: 15,
          margin: [20, 20, 0, 0]
        },
        {
          layout: 'lightHorizontalLines', // optional
          table: {
            headerRows: 1,
            widths: [200, 70, 70, '*'],

            body: metierRows
          },
          margin: 20
        },
        otherMetierTable
      ],
      defaultStyle: {
        alignment: 'justify'
      },
      styles: {
        name: {
          fontSize: 16,
          bold: true
        }
      }
    };
    pdfMake.createPdf(documentDefinition).download();

    // this.service.resultDownloaded(
    //   this.tokenInfo.adresse_email,
    //   parseInt(this.tokenInfo.id_utilisateur),
    //   this.id_codeholland,
    //   this.codeHollandCompose,
    //   parseInt(localStorage.getItem('id_nf'))
    // ).subscribe(result => {
    //   console.log(result);
    // });

    this.sendRequestMail();
  }

  async getChart(resultat: Score[]) {
    this.generateChart(resultat);
    await this.getBase64Image();
  }

  getBase64Image() {
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgElement: SVGGraphicsElement =
        document.querySelector('.apexcharts-svg');
      const imageBlobURL = 'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(svgElement.outerHTML);
      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = imageBlobURL;
    });
  }
}
