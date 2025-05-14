import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  lastValueFrom,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  clipsCollection: AngularFirestoreCollection<IClip>;
  pageClips: IClip[] = [];
  pendingRequest = false;
  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = this.db.collection('clips');
  }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<IClip | null> {
    return this.clipsCollection
      .doc(route.params['id'])
      .get()
      .pipe(
        map((snapshot) => {
          const data = snapshot.data();
          if (!data) {
            this.router.navigate(['/']);
            return null;
          }
          return data;
        })
      );
  }

  async createClip(data: IClip) {
    let documentReference = await this.clipsCollection.add(data);
    return documentReference;
  }

  fetchClip(id: string): Observable<IClip | undefined> {
    return this.clipsCollection
      .doc(id)

      .get()
      .pipe(
        map((e) => {
          console.log(e);
          return e.data();
        })
      );
    //this.clipsCollection.get()
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([sort$, this.auth.user]).pipe(
      switchMap((values) => {
        let [sort, user] = values;

        if (user == null) {
          return of([]);
        }

        return this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc')
          .get();
      }),
      map((snapshot) => {
        return (snapshot as QuerySnapshot<IClip>).docs;
      })
    );
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title,
    });
  }

  deleteClip(clip: IClip) {
    const file = this.storage.ref(`clips/${clip.fileName}`);
    const screenshot = this.storage.ref(
      `screenshots/${clip.screenshotFilename}`
    );

    return forkJoin([file.delete(), screenshot.delete()]).pipe(
      switchMap(() => this.clipsCollection.doc(clip.docID).delete())
    );
  }

  async getClips() {
    if (this.pendingRequest) {
      return;
    }
    this.pendingRequest = true;
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);

    const { length } = this.pageClips;
    if (length) {
      const lastDocID = this.pageClips[length - 1].docID;
      const lastDoc = await lastValueFrom(
        this.clipsCollection.doc(lastDocID).get()
      );
      query = query.startAfter(lastDoc);
    }
    const snapshot = await query.get();

    snapshot.forEach((doc) => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data(),
      });
    });
    this.pendingRequest = false;
  }
}
