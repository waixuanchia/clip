import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  sortBy = '1';
  clips: IClip[] = [];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService
  ) {
    this.sort$ = new BehaviorSubject(this.sortBy);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((param) => {
      this.sortBy = param['sort'];
      this.sort$.next(this.sortBy);
    });
    this.clipService.getUserClips(this.sort$).subscribe((docs) => {
      this.clips = [];
      docs.forEach((doc) => {
        this.clips.push({
          docID: doc.id,
          ...doc.data(),
        });
      });
    });
  }

  sort($event: Event) {
    let { value } = $event.target as HTMLSelectElement;
    this.router.navigateByUrl(`/manage?sort=${value}`);
  }

  openModal($event: Event, clip: IClip) {
    $event.preventDefault();
    this.activeClip = clip;
    this.modal.toggleModal('editClip');
  }

  deleteClip($event: Event, clip: IClip) {
    let docID = clip.docID;
    $event.preventDefault();
    this.clipService.deleteClip(clip).subscribe({
      next: () => {
        this.clips = this.clips.filter((clip) => clip.docID != docID);
      },
      error: () => {},
    });
  }

  async copyToClipboard($event: MouseEvent, docID: string | undefined) {
    $event.preventDefault();
    if (!docID) {
      return;
    }
    const url = `${location.origin}/clip/${docID}`;
    await navigator.clipboard.writeText(url);
  }
}
