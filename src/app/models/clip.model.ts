import Firebase from 'firebase/compat/app';
export default interface IClip {
  docID?: string;
  uid: string;
  displayName: string;
  title: string;
  fileName: string;
  url: string;
  screenshotUrl: string;
  screenshotFilename: string;
  timestamp: Firebase.firestore.FieldValue;
}
