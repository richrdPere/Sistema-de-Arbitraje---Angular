import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  transform(size: number): string {
    return size < 1024 * 1024
      ? (size / 1024).toFixed(1) + ' KB'
      : (size / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
