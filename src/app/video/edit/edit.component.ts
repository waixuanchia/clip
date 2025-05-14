import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  @Output() activeClipChange = new EventEmitter<IClip>();
  showAlert = false;
  alertColor = 'blue';
  alertMessage = 'Updating the clip';
  inSubmission = false;

  clipID = new FormControl('', {
    nonNullable: true,
  });
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  editForm = new FormGroup({
    clipID: this.clipID,
    title: this.title,
  });
  constructor(private modal: ModalService, private clipService: ClipService) {}

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return;
    }

    this.showAlert = false;
    this.inSubmission = false;
    this.clipID.setValue(this.activeClip.docID!);
    this.title.setValue(this.activeClip.title);
  }

  async submit() {
    if (!this.activeClip) {
      return;
    }
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMessage = 'Updating the clip';
    this.inSubmission = true;
    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);
    } catch (err) {
      this.showAlert = true;
      this.alertColor = 'red';
      this.alertMessage = 'Something went wrong';
      this.inSubmission = false;
      return;
    }
    this.showAlert = true;
    this.alertColor = 'green';
    this.alertMessage = 'success';
    this.inSubmission = false;
    this.activeClip!.title = this.title.value;
    this.activeClipChange.emit(this.activeClip!);
  }
}
