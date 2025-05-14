import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { UploadTaskSnapshot } from '@angular/fire/compat/storage/interfaces';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, forkJoin, last, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import Firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  isDragOver = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMessage = 'Please wait,your clip is being uploaded';
  inSubmission = false;
  progress = 0;
  showPercentage = false;
  user: Firebase.User | null = null;
  task!: AngularFireUploadTask;
  screenshots: string[] = [];
  selectedScreenshot = '';
  screenshotTask?: AngularFireUploadTask;
  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }
  clipID = new FormControl('', {
    nonNullable: true,
  });
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm = new FormGroup({
    id: this.clipID,
    title: this.title,
  });

  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }
    if ($event instanceof DragEvent) {
      this.file = ($event as DragEvent).dataTransfer?.files[0] ?? null;
    } else {
      this.file = ($event.target as HTMLInputElement).files?.item(0) ?? null;
    }

    if (!this.file || this.file.type != 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  selectScreenshot(screenshot: string, $event: Event) {
    $event.stopPropagation();
    this.selectedScreenshot = screenshot;
  }

  async upload() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMessage = 'Please wait,your clip is being uploaded';
    this.inSubmission = true;
    this.progress = 0;
    this.showPercentage = true;
    const filename = uuid();
    const filePath = `/clips/${filename}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenshot
    );
    const screenshotPath = `/screenshots/${filename}.png`;

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);

    this.task = this.storage.upload(filePath, this.file);
    const clipRef = this.storage.ref(filePath);
    const screenshotRef = this.storage.ref(screenshotPath);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe(([videoProgress, screenshotProgress]) => {
      if (!videoProgress || !screenshotProgress) {
        return;
      }
      this.progress = (videoProgress + screenshotProgress) / 200;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: ([clipUrl, screenshotUrl]) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${filename}.mp4`,
            url: clipUrl,
            screenshotUrl: screenshotUrl,
            screenshotFilename: `${filename}.png`,
            timestamp: Firebase.firestore.FieldValue.serverTimestamp(),
          };

          this.showAlert = false;
          this.alertColor = 'green';
          this.alertMessage = 'Your clip is uploaded';

          this.showPercentage = false;
          this.clipService.createClip(clip).then((doc) => {
            this.router.navigate(['clip', doc.id], {});
          });
        },
        error: (e) => {
          this.uploadForm.disable();
          this.alertColor = 'red';
          this.alertMessage = 'Upload failed,please try again later';
          this.inSubmission = true;
        },
      });
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }
}
