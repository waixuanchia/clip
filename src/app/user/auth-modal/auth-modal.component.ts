import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css'],
})
export class AuthModalComponent implements OnInit, OnDestroy {
  constructor(public modal: ModalService, public auth: AuthService) {}

  ngOnInit(): void {
    this.modal.register('auth');
  }

  ngOnDestroy() {
    this.modal.unregister('auth');
  }
}
