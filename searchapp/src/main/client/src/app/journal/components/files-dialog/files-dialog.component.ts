import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule, FileUploader } from 'ng2-file-upload';
import { AppService } from 'src/app/services/app.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-files-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, 
    MatDialogModule, MatButtonModule, MatFormFieldModule, FileUploadModule, MatInputModule],
  templateUrl: './files-dialog.component.html',
  styleUrls: ['./files-dialog.component.scss']
})
export class FilesDialogComponent {

  // public uploader: FileUploader = new FileUploader({ url: 'lf?action=UPLOAD' });
  public selectedFile: string;

  constructor(
    private service: AppService,
    public dialogRef: MatDialogRef<FilesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      ctx: string,
      fileList: string[]
    }) { }

  uploadFile() {

    // this.uploader.setOptions({ url: 'lf?action=UPLOAD&ctx=' + this.data.ctx });
    // this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => this.uploaded();
    // this.uploader.uploadAll();
  }


  public selectFile(f: string) {

    this.dialogRef.close(f)

  }

  uploaded() {
    this.service.getUploadedFiles().subscribe(res => {
      this.data.fileList = res['files'];
    });
  }
}
