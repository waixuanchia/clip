import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClipService } from '../services/clip.service';
import { map, of, switchMap, tap, throwError } from 'rxjs';
import IClip from '../models/clip.model';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
})
export class ClipComponent implements OnInit {
  clip?: IClip;
  @ViewChild('videoPlayer', { static: true }) target?: ElementRef;
  player?: Player;

  constructor(
    private route: ActivatedRoute,
    private clipService: ClipService
  ) {}
  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement);
    this.route.data.subscribe((data) => {
      this.clip = data['clip'] as IClip;
      this.player?.src({
        src: this.clip?.url,
        type: 'video/mp4',
      });
    });
  }
}
