import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import IUser from '../models/user.model';
import { delay, map, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection!: AngularFirestoreCollection<IUser>;
  public isAuthenticated$!: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usersCollection = this.db.collection<IUser>('users');
    this.isAuthenticated$ = this.auth.user.pipe(map((user) => !!user));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
    this.router.events.subscribe(console.log);
  }

  public async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error('Password not provided');
    }
    const userCredential = await this.auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );
    console.log(userCredential);

    if (!userCredential.user) {
      throw new Error('User cannot be found');
    }
    await this.usersCollection.doc(userCredential.user.uid).set({
      name: userData.name,
      age: userData.age,
      email: userData.email,
      phone_number: userData.phone_number,
    });
  }

  public async signIn(email: string, password: string) {
    try {
      await this.auth.signInWithEmailAndPassword(email, password);
    } catch (err) {}
  }

  public async logout($event?: Event) {
    if ($event) {
      $event.preventDefault();
    }
    await this.auth.signOut();
    await this.router.navigateByUrl('/');
  }
}
