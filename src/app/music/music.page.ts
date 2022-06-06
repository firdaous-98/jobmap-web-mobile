import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Music } from '../core/models/music.model';
import { TranslatorService } from '../core/services/translate.service';
import { Howl } from 'howler';

@Component({
  selector: 'app-music',
  templateUrl: './music.page.html',
  styleUrls: ['./music.page.scss'],
})
export class MusicPage implements OnInit {

  playlist: Music[] = [
    {
      id: 1,
      title: 'OneRepublic - I Lived (Official Instrumental)',
      path: './assets/music/OneRepublic - I Lived (Official Instrumental).mp3'
    },
    {
      id: 2,
      title: 'Coldplay - A Sky Full of Stars (Instrumental)',
      path: './assets/music/Coldplay - A Sky Full of Stars (Instrumental).mp3'
    },
    {
      id: 3,
      title: 'Ed Sheeran - Photograph (Instrumental)',
      path: './assets/music/Photograph (Instrumental) - Ed Sheeran.mp3'
    }
  ]

  currentMusic: number;
  isArab: boolean;

  player: Howl = null;
  
  constructor(
    public translate: TranslateService, 
    public translatorService: TranslatorService,
    private router: Router
  ) { }

  ngOnInit(){
    setTimeout(() => {
      this.translate.use(this.translatorService.getSelectedLanguage());      
    }, 500);
    this.isArab = localStorage.getItem('language') == "ar";
  }

  backClick() {
    this.router.navigate(['/info']);
  }

  play() {
    if (this.player) {
      this.player.stop();
    }
    let path = this.playlist.find(e => e.id == this.currentMusic)?.path;
    this.player = new Howl({
      src: [path]
    });
    this.player.play();
  }

  Choose() {
    this.player.stop();
    let path = this.playlist.find(e => e.id == this.currentMusic)?.path;
    localStorage.setItem('music', path);
    this.router.navigate(['/quiz']);
  }

  @HostListener('unloaded')
  ngOnDestroy() {
    this.player.stop();
  }

}
