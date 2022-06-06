import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import {
  ApexAxisChartSeries,
  ApexChart, ApexTitleSubtitle, ApexXAxis, ApexYAxis, ApexPlotOptions, ChartComponent
} from 'ng-apexcharts';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from './../../assets/vfs_fonts.js';
import { AnneeEtudeEnum } from '../core/enums/annee-etude.enum';
import { TypeUtilisateur } from '../core/enums/type-utilisateur.enum';
import { UserHelper } from '../core/helpers/user-helper';
import { Metier } from '../core/models/metier.model';
import { Score } from '../core/models/score.model';
import { TokenInfo } from '../core/models/token.model';
import { TypeBac } from '../core/models/type-bac.model';
import { AppService } from '../core/services/app.service';
import { TranslatorService } from '../core/services/translate.service';
import { fonts } from "./../config/pdffonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = fonts;

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

  loader: HTMLIonLoadingElement;

  constructor(
    private router: Router,
    public translate: TranslateService,
    public translatorService: TranslatorService,
    private service: AppService,
    public toastController: ToastController,
    public loadingController: LoadingController
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
    if (this.listeMetiers?.length > 0) {
      const id_metiers = this.listeMetiers.map(e => e.id_metier);
      var result = await this.service.getMetierTypeBac(id_metiers).toPromise();
      this.listeTypeBac = result;
    }
  }

  mapResultPerStep() {
    if (this.fromQuiz) {
      this.resultatStepOne = (this.resultPerStep.findIndex(e => e.id_step == "1") != -1 ?
        this.resultPerStep.find(e => e.id_step == "1").resultat :
        <{ id_step: string, resultat: any }[]>JSON.parse(localStorage.getItem('result_step_1'))).map(f => f.key).join('');

      this.resultatStepTwo = (this.resultPerStep.findIndex(e => e.id_step == "2") != -1 ?
        this.resultPerStep.find(e => e.id_step == "2").resultat :
        <{ id_step: string, resultat: any }[]>JSON.parse(localStorage.getItem('result_step_2'))).map(f => f.key).join('');

      this.resultatStepThree = (this.resultPerStep.findIndex(e => e.id_step == "3") != -1 ?
        this.resultPerStep.find(e => e.id_step == "3").resultat :
        <{ id_step: string, resultat: any }[]>JSON.parse(localStorage.getItem('result_step_3'))).map(f => f.key).join('');

      this.resultatStepFour = (this.resultPerStep.findIndex(e => e.id_step == "4") != -1 ?
        this.resultPerStep.find(e => e.id_step == "4").resultat :
        <{ id_step: string, resultat: any }[]>JSON.parse(localStorage.getItem('result_step_4'))).map(f => f.key).join('');
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


  async sendInvitation() {
    let body = (this.id_type_utilisateur == TypeUtilisateur.Parent ? `Suites à notre vécu ensemble, je me permets de passer ce test en répondant à toutes les questions selon ma perception de votre personnalité.` :
      `Vous êtes une personne qui me connaît très bien. Et votre avis m
  Intéresse. Je vous prie de bien vouloir passer ce test et répondre selon ce que vous pensez de moi .
  Cela me ferait un plaisir d en discuter avec vous pour affiner mes choix de mon futur métiers.`)
      + `${this.tokenInfo.prenom} ${this.tokenInfo.nom} vous invite à passer le test présent sur ce lien: ${this.link}`;

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

    metierRows = [['Métier(s)']];

    this.listeMetiers.forEach(metier => {
      metierRows.push([
        {
          text: metier.libelle_metier,
          link: `http://afa9.org/index/metier.php?idmetier=${metier.id_metier}`,
          decoration: 'underline'
        }
        // {
        //   text: metier.id_donnees.toString() + ". " + this.getDPCLibelle(metier.id_donnees, 'd'),
        //   link: this.getDPCLink(metier.id_donnees, 'd'),
        //   decoration: 'underline'
        // },
        // {
        //   text: metier.id_personnes.toString() + ". " + this.getDPCLibelle(metier.id_personnes, 'p'),
        //   link: this.getDPCLink(metier.id_personnes, 'p'),
        //   decoration: 'underline'
        // },
        // {
        //   text: metier.id_choses.toString() + ". " + this.getDPCLibelle(metier.id_choses, 'c'),
        //   link: this.getDPCLink(metier.id_choses, 'c'),
        //   decoration: 'underline'
        // }
      ]);
    });

    return metierRows;
  }

  metiersWithDPCDesc() {
    let metierTableList = [];
    this.listeMetiers.forEach(metier => {
      let table = {
        layout: 'lightHorizontalLines', // optional
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          widths: ['*', 'auto', 100, '*'],

          body: [
            ['Métier', 'D', 'P', 'C'],
            [{
              text: metier.libelle_metier,
              link: `http://afa9.org/index/metier.php?idmetier=${metier.id_metier}`,
              decoration: 'underline'
            }, {
              text: metier.id_donnees.toString(),
              link: this.getDPCLink(metier.id_donnees, 'd'),
              decoration: 'underline'
            },
            {
              text: metier.id_personnes.toString(),
              link: this.getDPCLink(metier.id_personnes, 'p'),
              decoration: 'underline'
            },
            {
              text: metier.id_choses.toString(),
              link: this.getDPCLink(metier.id_choses, 'c'),
              decoration: 'underline'
            }],
            [
              metier.id_donnees.toString() + ". " + this.getDPCLibelle(metier.id_donnees, 'd'),
              {
                text: this.getDPCDesc(metier.id_donnees, 'd'),
                colSpan: 3
              },
              '', ''
            ],
            [
              metier.id_personnes.toString() + ". " + this.getDPCLibelle(metier.id_personnes, 'p'),
              {
                text: this.getDPCDesc(metier.id_personnes, 'p'),
                colSpan: 3
              },
              '', ''
            ],
            [
              metier.id_choses.toString() + ". " + this.getDPCLibelle(metier.id_choses, 'c'),
              {
                text: this.getDPCDesc(metier.id_choses, 'c'),
                colSpan: 3
              },
              '', ''
            ]
          ]
        },
        margin: 20
      }

      metierTableList.push(table);
    });

    return metierTableList;
  }

  getMetierLink(id: string) {
    return `http://afa9.org/index/metier.php?idmetier=${id}`;
  }

  getDPCLink(score: number, dpc: string) {
    let lang = localStorage.getItem('language');
    return `http://afa9.org/index/DPC.php?att=${score}&code=${dpc}&lang=${lang}`;
  }

  getDPCLibelle(score: number, dpc: string) {
    switch (dpc) {
      case 'd':
        return this.RTLize(this.translate.instant(`DONNEES.${score}.competence`));
      case 'p':
        return this.RTLize(this.translate.instant(`PERSONNES.${score}.competence`));
      case 'c':
        return this.RTLize(this.translate.instant(`CHOSES.${score}.competence`));
    }
  }

  getDPCDesc(score: number, dpc: string) {
    switch (dpc) {
      case 'd':
        if(this.isArab) {
          return this.RTLize(this.translate.instant(`DONNEES.${score}.description1`)) + "\n"
          + this.RTLize(this.translate.instant(`DONNEES.${score}.description2`)) + "\n"
          + this.RTLize(this.translate.instant(`DONNEES.${score}.description3`));
        }
        else {
          return this.RTLize(this.translate.instant(`DONNEES.${score}.description`));
        }
      case 'p':
        if(this.isArab) {
          return this.RTLize(this.translate.instant(`PERSONNES.${score}.description1`)) + "\n"
          + this.RTLize(this.translate.instant(`PERSONNES.${score}.description2`)) + "\n"
          + this.RTLize(this.translate.instant(`PERSONNES.${score}.description3`));
        }
        else {
          return this.RTLize(this.translate.instant(`PERSONNES.${score}.description`));
        }
      case 'c':
        if(this.isArab) {
          return this.RTLize(this.translate.instant(`CHOSES.${score}.description1`)) + "\n"
          + this.RTLize(this.translate.instant(`CHOSES.${score}.description2`)) + "\n"
          + this.RTLize(this.translate.instant(`CHOSES.${score}.description3`));
        }
        else {
          return this.RTLize(this.translate.instant(`CHOSES.${score}.description`));
        }
    }
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

  RTLize(text: string) {
    return this.isArab ? text.split(' ').reverse().join(' ') : text;
  }

  async downloadRapportApprofondi() {
    this.loader = await this.loadingController.create({
      message: this.translate.instant('PLEASE_WAIT'),
      spinner: 'circular'
    });
    await this.loader.present();

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
            link: `http://afa9.org/index/metier.php?idmetier=${metier.id_metier}`,
            decoration: 'underline'
          },
          {
            text: metier.id_donnees.toString(),
            link: this.getDPCLink(metier.id_donnees, 'd'),
            decoration: 'underline'
          },
          {
            text: metier.id_personnes.toString(),
            link: this.getDPCLink(metier.id_personnes, 'p'),
            decoration: 'underline'
          },
          {
            text: metier.id_choses.toString(),
            link: this.getDPCLink(metier.id_choses, 'c'),
            decoration: 'underline'
          }
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
              text: this.translate.instant('YOUR_RIASEC_CODE'),
              bold: true,
              fontSize: 18,
              alignment: 'center',
              margin: [20, 0, 0, 20]
            },
            {
              text: this.codeHollandCompose,
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
                      text: this.resultat[0].key + ": " + this.  getExplanation(this.resultat[0].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    },
                    {
                      text: this.resultat[1].key + ": " + this.  getExplanation(this.resultat[1].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    },
                    {
                      text: this.resultat[2].key + ": " + this.  getExplanation(this.resultat[2].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    }
                  ],
                  [
                    {
                      text: this.autreResultat[0].key + ": " + this.  getExplanation(this.autreResultat[0].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    },
                    {
                      text: this.autreResultat[1].key + ": " + this.  getExplanation(this.autreResultat[1].key),
                      bold: true,
                      fontSize: 9,
                      alignment: 'center',
                      margin: [20, 5, 0, 20]
                    },
                    {
                      text: this.autreResultat[2].key + ": " + this.  getExplanation(this.autreResultat[2].key),
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
                  text: this.resultat[0].key + ": " + this.  getExplanation(this.resultat[0].key)
                }
              ],
              [
                {
                  text: this.resultat[1].key + ": " + this.  getExplanation(this.resultat[1].key)
                }
              ],
              [
                {
                  text: this.resultat[2].key + ": " + this.  getExplanation(this.resultat[2].key)
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

    let lang = localStorage.getItem('language');

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
          width: 500,
          alignment: 'center'
        },
        {
          text: this.RTLize(this.translate.instant('orientation')),
          fontSize: 24,
          bold: true,
          alignment: 'center'
        },
        {
          text: this.RTLize(this.translate.instant('LAST_NAME') + ' : ' + this.tokenInfo.nom),
          fontSize: 12,
          alignment: this.isArab ? 'right' : 'left'
        },
        {
          text: this.RTLize(this.translate.instant('FIRST_NAME') + ' : ' + this.tokenInfo.prenom),
          fontSize: 12,
          alignment: this.isArab ? 'right' : 'left'
        },
        {
          text: this.RTLize(this.translate.instant('EMAIL_ADDRESS') + ' : ' + this.tokenInfo.adresse_email),
          fontSize: 12,
          alignment: this.isArab ? 'right' : 'left'
        },
        {
          text: this.RTLize(this.translate.instant('PHONE_NUMBER') + ' : ' + this.tokenInfo.numero_telephone),
          fontSize: 12,
          alignment: this.isArab ? 'right' : 'left'
        },
        {
          image: await this.getBase64ImageFromURL(
            "./assets/img/afa9_qr.png"),
            alignment: this.isArab ? 'left' : 'right',
          width: 90,
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: this.RTLize(this.translate.instant('INTRO')),
          fontSize: 18,
          margin: [0, 25, 0, 45], // margin: [left, top, right, bottom],
          bold: true,
          alignment: 'center',
          pageBreak: 'before'
        },
        {
          text: this.RTLize(this.translate.instant('RIASEC_PROFILE')),
          fontSize: 16,
          alignment: 'center',
          bold: true
        },
        {
          image: await this.getBase64ImageFromURL(
            "./assets/img/riasec.png"),
          alignment: 'center',
          margin: [0, 10, 0, 10] // margin: [left, top, right, bottom]
        },
        {
          text: this.isArab ? this.RTLize(this.translate.instant('HOLLAND_DESC1')) + "\n" +
          this.RTLize(this.translate.instant('HOLLAND_DESC2')) + "\n" + this.RTLize(this.translate.instant('HOLLAND_DESC3')) + "\n" +
          this.RTLize(this.translate.instant('HOLLAND_DESC4'))  : 
          this.RTLize(this.translate.instant('HOLLAND_DESC')),
          fontSize: 11.5,
          alignment: this.isArab ? 'right' : 'justify',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: this.isArab ? this.RTLize(this.translate.instant('DESC_SUITE1')) + "\n" +
          this.RTLize(this.translate.instant('DESC_SUITE2')) : 
          this.RTLize(this.translate.instant('HOLLAND_DESC')),
          fontSize: 11.5,
          alignment: this.isArab ? 'right' : 'justify',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: this.RTLize(this.translate.instant('SITUATION_TYPOLOGY')),
          bold: true,
          fontSize: 12,
          alignment: this.isArab ? 'right' : 'left',
          margin: [5, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          ul: [
            this.translate.instant('R'),
            this.translate.instant('I'),
            this.translate.instant('A'),
            this.translate.instant('S'),
            this.translate.instant('E'),
            this.translate.instant('C')
          ],
          alignment: this.isArab ? 'right' : 'left',
          margin: [10, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: this.translate.instant('YOUR_RIASEC_CODE'),
          fontSize: 12,
          alignment: this.isArab ? 'right' : 'left',
          margin: [5, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        this.getTextWithColor(this.resultat[0].key),
        this.getTextWithColor(this.resultat[1].key),
        this.getTextWithColor(this.resultat[2].key),
        {
          text: this.getParagraphTitleRapport(this.resultat[0], total),
          fontSize: 12,
          bold: true,
          alignment: this.isArab ? 'right' : 'left',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        this.getTextWithColor(this.resultat[0].key),
        {
          text: this.getParagraphRapport(this.resultat[0].key),
          fontSize: 11.5,
          alignment: this.isArab ? 'right' : 'justify',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: this.getParagraphTitleRapport(this.resultat[1], total),
          fontSize: 12,
          bold: true,
          alignment: this.isArab ? 'right' : 'left',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        this.getTextWithColor(this.resultat[1].key),
        {
          text: this.getParagraphRapport(this.resultat[1].key),
          fontSize: 11.5,
          alignment: this.isArab ? 'right' : 'justify',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        {
          text: this.getParagraphTitleRapport(this.resultat[2], total),
          fontSize: 12,
          bold: true,
          alignment: this.isArab ? 'right' : 'left',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        this.getTextWithColor(this.resultat[2].key),
        {
          text: this.getParagraphRapport(this.resultat[2].key),
          fontSize: 11.5,
          alignment: this.isArab ? 'right' : 'justify',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        },
        score,
        {
          text: ' ',
          fontSize: 15,
          margin: [20, 0, 0, 0]
        },
        explanationTable,
        {
          text: this.RTLize(this.translate.instant('METIERS_LIST')),
          fontSize: 15,
          alignment: this.isArab ? 'right' : 'left',
          margin: [20, 20, 0, 0]
        },
        {
          layout: 'lightHorizontalLines', // optional
          table: {
            headerRows: 1,
            widths: ['*'],

            body: this.getMetierRows()
          },
          margin: 20,
          pageBreak: 'before'
        },
        {
          text: this.RTLize(this.translate.instant('COMPETENCES_DESC')),
          fontSize: 15,
          alignment: this.isArab ? 'right' : 'left',
          margin: [20, 20, 0, 0]
        },
        this.metiersWithDPCDesc(),
        otherMetierTable,
        {
          image: await this.getBase64ImageFromURL(
            `./assets/img/manuel/${lang}/manual_page-0002.jpg`),
          width: 500
        },
        {
          image: await this.getBase64ImageFromURL(
            `./assets/img/manuel/${lang}/manual_page-0003.jpg`),
          width: 500
        },
        {
          image: await this.getBase64ImageFromURL(
            `./assets/img/manuel/${lang}/manual_page-0004.jpg`),
          width: 500
        },
        {
          image: await this.getBase64ImageFromURL(
            `./assets/img/manuel/${lang}/manual_page-0005.jpg`),
          width: 500
        },
        {
          image: await this.getBase64ImageFromURL(
            `./assets/img/manuel/${lang}/manual_page-0006.jpg`),
          width: 500
        }
      ],
      defaultStyle: {
        font: 'ArialUnicodeMS'
      }
    };
    // pdfMake.createPdf(documentDefinition).open();
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition).download();
    await this.loader.dismiss();
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
          text: this.translate.instant('R'),
          color: 'white',
          bold: true,
          background: 'orange',
          alignment: this.isArab ? 'right' : 'left',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
      case "I":
        return {
          text: this.translate.instant('I'),
          color: 'white',
          bold: true,
          background: 'pink',
          alignment: this.isArab ? 'right' : 'left',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
      case "A":
        return {
          text: this.translate.instant('A'),
          color: 'white',
          bold: true,
          background: 'purple',
          alignment: this.isArab ? 'right' : 'left',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
      case "S":
        return {
          text: this.translate.instant('S'),
          color: 'white',
          bold: true,
          background: 'blue',
          alignment: this.isArab ? 'right' : 'left',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
      case "E":
        return {
          text: this.translate.instant('E'),
          color: 'white',
          bold: true,
          background: 'green',
          alignment: this.isArab ? 'right' : 'left',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
      case "C":
        return {
          text: this.translate.instant('C'),
          color: 'white',
          bold: true,
          background: 'yellow',
          alignment: this.isArab ? 'right' : 'left',
          margin: [0, 5, 0, 5] // margin: [left, top, right, bottom]
        }
    }
  }

  getParagraphTitleRapport(score: Score, total: number) {
    switch (score.key) {
      case "R":
        return this.RTLize(this.translate.instant('TYPE_R') + this.roundingNumber((score.value / total) * 100) + "% ");
      case "I":
        return this.RTLize(this.translate.instant('TYPE_I') + this.roundingNumber((score.value / total) * 100) + "% ");
      case "A":
        return this.RTLize(this.translate.instant('TYPE_A') + this.roundingNumber((score.value / total) * 100) + "% ");
      case "S":
        return this.RTLize(this.translate.instant('TYPE_S') + this.roundingNumber((score.value / total) * 100) + "% ");
      case "E":
        return this.RTLize(this.translate.instant('TYPE_E') + this.roundingNumber((score.value / total) * 100) + "% ");
      case "C":
        return this.RTLize(this.translate.instant('TYPE_C') + this.roundingNumber((score.value / total) * 100) + "% ");
    }
  }

  getParagraphRapport(key: string) {
    switch (key) {
      case "R":
        return this.isArab ? this.RTLize(this.translate.instant('DESC_R1')) + "\n" +
        this.RTLize(this.translate.instant('DESC_R2')) + "\n" +
        this.RTLize(this.translate.instant('DESC_R3')) + "\n" +
        this.RTLize(this.translate.instant('DESC_R4')) + "\n" +
        this.RTLize(this.translate.instant('DESC_R5')) : 
        this.RTLize(this.translate.instant('DESC_R'));
      case "I":
        return this.isArab ? this.RTLize(this.translate.instant('DESC_I1')) + "\n" +
        this.RTLize(this.translate.instant('DESC_I2')) + "\n" +
        this.RTLize(this.translate.instant('DESC_I3')) + "\n" +
        this.RTLize(this.translate.instant('DESC_I4')) + "\n" +
        this.RTLize(this.translate.instant('DESC_I5')) : 
        this.RTLize(this.translate.instant('DESC_I'));
      case "A":
        return this.isArab ? this.RTLize(this.translate.instant('DESC_A1')) + "\n" +
        this.RTLize(this.translate.instant('DESC_A2')) + "\n" +
        this.RTLize(this.translate.instant('DESC_A3')) + "\n" +
        this.RTLize(this.translate.instant('DESC_A4')) + "\n" +
        this.RTLize(this.translate.instant('DESC_A5')) + "\n" +
        this.RTLize(this.translate.instant('DESC_A6')) + "\n" +
        this.RTLize(this.translate.instant('DESC_A7')) : 
        this.RTLize(this.translate.instant('DESC_A'));
      case "S":
        return this.isArab ? this.RTLize(this.translate.instant('DESC_S1')) + "\n" +
        this.RTLize(this.translate.instant('DESC_S2')) + "\n" +
        this.RTLize(this.translate.instant('DESC_S3')) + "\n" +
        this.RTLize(this.translate.instant('DESC_S4')) + "\n" +
        this.RTLize(this.translate.instant('DESC_S5')) + "\n" +
        this.RTLize(this.translate.instant('DESC_S6')) : 
        this.RTLize(this.translate.instant('DESC_S'));
      case "E":
        return this.isArab ? this.RTLize(this.translate.instant('DESC_E1')) + "\n" +
        this.RTLize(this.translate.instant('DESC_E2')) + "\n" +
        this.RTLize(this.translate.instant('DESC_E3')) + "\n" +
        this.RTLize(this.translate.instant('DESC_E4')) + "\n" +
        this.RTLize(this.translate.instant('DESC_E5')) : 
        this.RTLize(this.translate.instant('DESC_E'));
      case "C":
        return this.isArab ? this.RTLize(this.translate.instant('DESC_C1')) + "\n" +
        this.RTLize(this.translate.instant('DESC_C2')) + "\n" +
        this.RTLize(this.translate.instant('DESC_C3')) + "\n" +
        this.RTLize(this.translate.instant('DESC_C4')) + "\n" +
        this.RTLize(this.translate.instant('DESC_C5')) + "\n" +
        this.RTLize(this.translate.instant('DESC_C6')) : 
        this.RTLize(this.translate.instant('DESC_C'));
    }
  }

  roundingNumber(amount: number): number {
    return parseFloat(Number(amount.toString()).toFixed(2));
  }
}
