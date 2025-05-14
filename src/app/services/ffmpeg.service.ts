import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  isRunning = false;
  isReady = false;
  private ffmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({
      log: true,
      //corePath:
      //'http://localhost:4200/node_modules/@ffmpeg/core/dist/ffmpeg-core.js',
    });
  }

  async init() {
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();
    console.log(this.isReady);
    this.isReady = true;
  }

  async getScreenshots(file: File) {
    this.isRunning = true;
    const data = await fetchFile(file);

    this.ffmpeg.FS('writeFile', file.name, data);

    const seconds = [1, 2, 3];
    let commands: string[] = [];

    seconds.forEach((second, index) => {
      commands.push(
        '-i',
        file.name,
        '-ss',
        `00:00:0${second}`,
        '-frames:v',
        '1',
        '-filter:v',
        'scale=510:-1',
        `output_0${second}.png`
      );
    });

    await this.ffmpeg.run(...commands);

    const screenshots: string[] = [];
    seconds.forEach((second) => {
      const screenshotFile = this.ffmpeg.FS(
        'readFile',
        `output_0${second}.png`
      );
      let fileBlob = new Blob([screenshotFile.buffer], {
        type: 'image/png',
      });

      const screenshotURL = URL.createObjectURL(fileBlob);

      screenshots.push(screenshotURL);
    });
    this.isRunning = false;
    return screenshots;
  }

  async blobFromURL(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob;
  }
}
