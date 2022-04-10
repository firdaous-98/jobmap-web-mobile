import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import {
  ApexAxisChartSeries,
  ApexChart, ApexTitleSubtitle, ApexXAxis, ApexYAxis, ApexPlotOptions, ChartComponent
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
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  colors: string[];
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

  autreResultat: Score[] = [];
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

  listeMetiers: Metier[] = [];
  listeTypeBac: TypeBac[] = [];
  id_codeholland!: number;

  OtherCodeHollandCompose: string;
  OtherListeMetiers: Metier[] = [];
  OtherListeTypeBac: TypeBac[] = [];

  showNoOtherScore = false;
  invitationSent = false;
  noMetiers = false;

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
        
        if (this.fromQuiz) {
          this.saveScore();
        }
        
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
      this.noMetiers = false;
    } else {
      this.noMetiers = true;
    }
  }

  async getTypesBac() {
    if(this.listeMetiers?.length > 0) {
      const id_metiers = this.listeMetiers.map(e => e.id_metier);
      var result = await this.service.getMetierTypeBac(id_metiers).toPromise();
      this.listeTypeBac = result;
    }
  }

  mapResultPerStep() {
    if (this.fromQuiz) {
      this.resultatStepOne = (this.resultPerStep.findIndex(e => e.id_step == "1") != -1 ? 
        this.resultPerStep.find(e => e.id_step == "1").resultat : 
        <{ id_step: string, resultat: any }[]> JSON.parse(localStorage.getItem('result_step_1'))).map(f => f.key).join('');

      this.resultatStepTwo = (this.resultPerStep.findIndex(e => e.id_step == "2") != -1 ? 
      this.resultPerStep.find(e => e.id_step == "2").resultat : 
      <{ id_step: string, resultat: any }[]> JSON.parse(localStorage.getItem('result_step_2'))).map(f => f.key).join('');
      
      this.resultatStepThree = (this.resultPerStep.findIndex(e => e.id_step == "3") != -1 ? 
      this.resultPerStep.find(e => e.id_step == "3").resultat : 
      <{ id_step: string, resultat: any }[]> JSON.parse(localStorage.getItem('result_step_3'))).map(f => f.key).join('');
      
      this.resultatStepFour = (this.resultPerStep.findIndex(e => e.id_step == "4") != -1 ? 
      this.resultPerStep.find(e => e.id_step == "4").resultat : 
      <{ id_step: string, resultat: any }[]> JSON.parse(localStorage.getItem('result_step_4'))).map(f => f.key).join('');
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
    let body = (this.id_type_utilisateur == TypeUtilisateur.Parent ? `Suites à notre vécu ensemble, je me permets de passer ce test en répondant à toutes les questions selon ma perception de votre personnalité.` :
    `Vous êtes une personne qui me connaît très bien. Et votre avis m
  Intéresse. Je vous prie de bien vouloir passer ce test et répondre selon ce que vous pensez de moi .
  Cela me ferait un plaisir d en discuter avec vous pour affiner mes choix de mon futur métiers.`)
  + `${this.tokenInfo.prenom} ${this.tokenInfo.nom} vous invite à passer le test présent sur ce lien: ${this.link}`;

    debugger
    this.service.sendEmail(
      this.emailPartner,
      "Invitation Afa9",
      body).subscribe(async _ => {
      console.log("email sent");
      this.invitationSent = true;
    });
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
      colors: ["#f1c40f", "#e74c3c", "#27ae60"],
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true
        }
      }
    };
  }

  getMetierRows() {
    var metierRows: any[] = [];

    metierRows = [['Métier(s)', 'D', 'P', 'C']];

    this.listeMetiers.forEach(metier => {
      metierRows.push([
        {
          text: metier.libelle_metier,
          link: `http://afa9.org/metier.php?idmetier=${metier.id_metier}`,
          decoration: 'underline'
        },
        metier.id_donnees.toString(),
        metier.id_personnes.toString(),
        metier.id_choses.toString()
      ]);
    });

    return metierRows;
  }

  getMetierLink(id: string) {
    return `http://afa9.org/metier.php?idmetier=${id}`;
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

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }

  async downloadRapportApprofondi() {
    this.mapResultPerStep();
    const total = this.resultat.reduce((a, b) => a + b.value, 0);

    var otherMetierRows: any[] = [];
    var otherMetierTable: any;

    if (this.OtherListeMetiers?.length > 0) {
      otherMetierRows = [['Métier(s)', 'D', 'P', 'C']];
      this.OtherListeMetiers.forEach(metier => {
        otherMetierRows.push([
          {
            text: metier.libelle_metier,
            link: `http://afa9.org/metier.php?idmetier=${metier.id_metier}`,
            decoration: 'underline'
          },
          metier.id_donnees.toString(),
          metier.id_personnes.toString(),
          metier.id_choses.toString()
        ]);
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
            widths: ['*', 50, 50, 50],

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
              text: 'Votre code RIASEC : ' + this.codeHollandCompose,
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
                    text: 'Votre code RIASEC : ' + this.codeHollandCompose,
                    bold: true,
                    fontSize: 9,
                    alignment: 'center',
                    margin: [20, 0, 0, 20]
                  },
                  {
                    text: (this.id_type_utilisateur == TypeUtilisateur.Parent ? 'Votre fils/ étudiant a obtenu le code RIASEC : ' : 'Votre parent/prof a obtenu le code RIASEC : ') + this.OtherCodeHollandCompose,
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
      header: {
        margin: [0, 5, 0, 10],
        columns: [
          {
            image: await this.getBase64ImageFromURL(
              "./assets/img/afa9-logo-text.png"),
            alignment: 'right',
            width: 60,
            margin: [-500, 5, 0, 20] // margin: [left, top, right, bottom]
          }
        ]
      },
      content: [
        {
          image: await this.getBase64ImageFromURL(
            "./assets/img/afa9-logo.png"),
          alignment: 'center'
        },
        {
          text: 'Orientation - Maroc',
          fontSize: 24,
          bold: true,
          alignment: 'center'
          // margin: [0, 10, 0, 10] // margin: [left, top, right, bottom]
        },
        {
          text: 'Nom: ' + this.tokenInfo.nom,
          fontSize: 12,
          align: 'right'
        },
        {
          text: 'Prénom: ' + this.tokenInfo.prenom,
          fontSize: 12,
          align: 'right'
        },
        {
          text: 'Mail: ' + this.tokenInfo.adresse_email,
          fontSize: 12,
          align: 'right'
        },
        {
          image: await this.getBase64ImageFromURL(
            "./assets/img/afa9_qr.png"),
          alignment: 'right',
          width: 60,
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: 'Le profil RIASEC',
          fontSize: 16,
          alignment: 'center',
          bold: true,
          pageBreak: 'before'
        },
        {
          image: await this.getBase64ImageFromURL(
            "./assets/img/riasec.png"),
          alignment: 'center',
          margin: [0, 10, 0, 10] // margin: [left, top, right, bottom]
        },
        {
          text: 'Selon John Holland, le choix d’un métier ou d\'une profession est une forme d\'expression de la personnalité d\'un individu. La typologie dont il est l’auteur – la typologie de Holland – est représentée par les six types ci-contre.',
          fontSize: 12,
          alignment: 'justify',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: 'Votre appartenance à l\'un ou l\'autre des six types (code RIASEC) est déterminée par vos habiletés, certains traits de personnalité et vos intérêts. Chaque profession est donc associée à une combinaison de plusieurs types.',
          fontSize: 12,
          alignment: 'justify',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: 'Voici comment se situent vos résultats au regard de la typologie de Holland.',
          bold: true,
          fontSize: 12,
          align: 'right',
          margin: [5, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          ul: [
            'Réaliste',
            'Investigateur',
            'Artistique',
            'Social',
            'Entreprenant',
            'Conventionnel'
          ],
          margin: [10, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: 'Votre code RIASEC :',
          fontSize: 12,
          align: 'right',
          margin: [5, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        this.getTextWithColor(this.resultat[0].key),
        this.getTextWithColor(this.resultat[1].key),
        this.getTextWithColor(this.resultat[2].key),
        {
          text: this.getParagraphTitleRapport(this.resultat[0], total),
          fontSize: 12,
          bold: true,
          align: 'right',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        this.getTextWithColor(this.resultat[0].key),
        {
          text: this.getParagraphRapport(this.resultat[0].key),
          fontSize: 12,
          alignment: 'justify',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: this.getParagraphTitleRapport(this.resultat[1], total),
          fontSize: 12,
          bold: true,
          align: 'right',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        this.getTextWithColor(this.resultat[1].key),
        {
          text: this.getParagraphRapport(this.resultat[1].key),
          fontSize: 12,
          alignment: 'justify',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: this.getParagraphTitleRapport(this.resultat[2], total),
          fontSize: 12,
          bold: true,
          align: 'right',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        this.getTextWithColor(this.resultat[2].key),
        {
          text: this.getParagraphRapport(this.resultat[2].key),
          fontSize: 12,
          alignment: 'justify',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        score,
        {
          text: 'Vos scores intermédiaires : ',
          fontSize: 15,
          margin: [20, 10, 0, 0]
        },
        {
          text: 'Etape 1 : ' + this.resultatStepOne + ' . Etape 2 : ' + this.resultatStepTwo + ' . Etape 3 : ' + this.resultatStepThree + ' . Etape 4 : ' + this.resultatStepFour,
          fontSize: 18,
          alignment: 'center',
          margin: [0, 10, 0, 10]
        },
        {
          text: ' ',
          fontSize: 15,
          margin: [20, 0, 0, 0]
        },
        explanationTable,
        {
          text: 'Métiers et professions correspondant à votre profil RIASEC (Vous pouvez accéder à la description du métier en cliquant sur sa désignation) :',
          fontSize: 15,
          margin: [20, 20, 0, 0]
        },
        {
          layout: 'lightHorizontalLines', // optional
          table: {
            headerRows: 1,
            widths: ['*', 50, 50, 50],

            body: this.getMetierRows()
          },
          margin: 20
        },
        otherMetierTable
      ]
    };

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition).download();
    // pdfDocGenerator.getBase64((data) => {
    //   this.service.sendEmail(
    //     this.tokenInfo.adresse_email,
    //     "Rapport approfondi RIASEC - Afa9",
    //     `Bonjour ${this.tokenInfo.prenom}, vous venez de passer le questionnaire d'orientation RIASEC sur notre plateforme Afa9,
    //     vous trouvez ci-joint votre rapport approfondi. Bonne journée :D`,
    //     data
    //   ).subscribe(async result => {
    //     console.log(result);
    //     (await this.toastController.create({ message: this.translate.instant('REPORT_SENT'), duration: 2500, cssClass: 'app-toast', position: 'bottom', animated: true, mode: 'ios' })).present();
    //   });
    // });      
  }

  getTextWithColor(key: string) {
    switch (key) {
      case "R":
        return {
          text: "Réaliste",
          color: 'white',
          bold: true,
          background: 'orange',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
      case "I":
        return {
          text: "Investigateur",
          color: 'white',
          bold: true,
          background: 'pink',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
      case "A":
        return {
          text: "Artistique",
          color: 'white',
          bold: true,
          background: 'purple',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
      case "S":
        return {
          text: "Social",
          color: 'white',
          bold: true,
          background: 'blue',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
      case "E":
        return {
          text: "Entreprenant",
          color: 'white',
          bold: true,
          background: 'green',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
      case "C":
        return {
          text: "Conventionnel",
          color: 'white',
          bold: true,
          background: 'yellow',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
    }
  }

  getParagraphTitleRapport(score: Score, total: number) {
    switch (score.key) {
      case "R":
        return "Le type Réaliste " + this.roundingNumber((score.value / total) * 100) + "%";
      case "I":
        return "Le type Investigateur " + this.roundingNumber((score.value / total) * 100) + "%";
      case "A":
        return "Le type Artistique " + this.roundingNumber((score.value / total) * 100) + "%";
      case "S":
        return "Le type Social " + this.roundingNumber((score.value / total) * 100) + "%";
      case "E":
        return "Le type Entreprenant " + this.roundingNumber((score.value / total) * 100) + "%";
      case "C":
        return "Le type Conventionnel " + this.roundingNumber((score.value / total) * 100) + "%";
    }
  }

  getParagraphRapport(key: string) {
    switch (key) {
      case "R":
        return "Les personnes de ce type exercent surtout des tâches concrètes. Habiles de leurs mains, elles savent coordonner leurs gestes. Elles se servent d’outils, font fonctionner des appareils, des machines, des véhicules. Les réalistes ont le sens de la mécanique, le souci de la précision. Plusieurs exercent leur profession à l’extérieur plutôt qu’à l’intérieur. Leur travail demande souvent une bonne endurance physique et même des capacités athlétiques. Ces personnes sont patientes, minutieuses, constantes, sensées, naturelles, franches, pratiques, concrètes, simples.";
      case "I":
        return "La plupart des personnes de ce type ont des connaissances théoriques auxquelles elles ont recours pour agir. Elles disposent de renseignements spécialisés dont elles se servent pour résoudre des problèmes. Ce sont des personnes qui observent. Leur principale compétence tient à la compréhension qu’elles ont des phénomènes. Elles aiment bien se laisser absorber dans leurs réflexions. Elles aiment jouer avec les idées. Elles valorisent le savoir. Ces personnes sont critiques, curieuses, soucieuses de se renseigner, calmes, réservées, persévérantes, tolérantes, prudentes dans leurs jugements, logiques, objectives, rigoureuses, intellectuelles.";
      case "A":
        return "Les personnes de ce type aiment les activités qui leur permettent de s’exprimer librement à partir de leurs perceptions, de leur sensibilité et de leur intuition. Elles s’intéressent au travail de création, qu’il s’agisse d’art visuel, de littérature, de musique, de publicité ou de spectacle. D’esprit indépendant et non conformiste, elles sont à l’aise dans des situations qui sortent de l’ordinaire. Elles sont dotées d’une grande sensibilité et de beaucoup d’imagination. Bien qu’elles soient rebutées par les tâches méthodiques et routinières, elles sont néanmoins capables de travailler avec discipline. Ces personnes sont spontanées, expressives, imaginatives, émotives, indépendantes, originales, intuitives, passionnées, fières, flexibles, disciplinées.";
      case "S":
        return "Les personnes de ce type aiment être en contact avec les autres dans le but de les aider, de les informer, de les éduquer, de les divertir, de les soigner ou encore de favoriser leur croissance. Elles s’intéressent aux comportements humains et sont soucieuses de la qualité de leurs relations avec les autres. Elles utilisent leur savoir ainsi que leurs impressions et leurs émotions pour agir et pour interagir avec les autres. Elles aiment communiquer et s’expriment facilement. Ces personnes sont attentives aux autres, coopératives, collaboratrices, compréhensives, dévouées, sensibles, sympathiques, perspicaces, bienveillantes, communicatives, encourageantes.";
      case "E":
        return "Les personnes de ce type aiment influencer leur entourage. Leur capacité de décision, le sens de l’organisation et une habileté particulière à communiquer leur enthousiasme les appuient dans leurs objectifs. Elles savent vendre des idées autant que des biens matériels. Elles ont le sens de l’organisation, de la planification et de l’initiative et savent mener à bien leurs projets. Elles savent faire preuve d’audace et d’efficacité. Ces personnes sont persuasives, énergiques, optimistes, audacieuses, sûres d’elles-mêmes, ambitieuses, déterminées, diplomates, débrouillardes, sociables.";
      case "C":
        return "Les personnes de ce type ont une préférence pour les activités précises, méthodiques, axées sur un résultat prévisible. Elles se préoccupent de l’ordre et de la bonne organisation matérielle de leur environnement. Elles préfèrent se conformer à des conventions bien établies et à des consignes claires plutôt que d’agir dans l’improvisation. Elles aiment calculer, classer, tenir à jour des registres ou des dossiers. Elles sont efficaces dans tout travail qui exige de l’exactitude et à l’aise dans les tâches routinières. Ces personnes sont loyales, organisées, efficaces, respectueuses de l’autorité, perfectionnistes, raisonnables, consciencieuses, ponctuelles, discrètes, strictes.";
    }
  }

  roundingNumber(amount: number): number {
    return parseFloat(Number(amount.toString()).toFixed(2));
  }
}
