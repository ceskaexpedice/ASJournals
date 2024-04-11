import { ApplicationRef, ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule, FileUploader } from 'ng2-file-upload';
import { AppService } from 'src/app/services/app.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-files-dialog',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatProgressBarModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule,
    MatDialogModule, FileUploadModule],
  templateUrl: './files-dialog.component.html',
  styleUrls: ['./files-dialog.component.scss']
})
export class FilesDialogComponent {

  public uploader: FileUploader = new FileUploader({ url: 'lf?action=UPLOAD' });
  public selectedFile: string;
  fileList: string[];

  constructor(
    public applicationRef: ApplicationRef,
    private service: AppService,
    public dialogRef: MatDialogRef<FilesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      ctx: string,
      fileList: string[]
    }) { }

    ngOnInit() {
      this.fileList = this.data.fileList;
    }

  // uploadFile() {

  //   // this.uploader.setOptions({ url: 'lf?action=UPLOAD&ctx=' + this.data.ctx });
  //   // this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => this.uploaded();
  //   // this.uploader.uploadAll();
  // }


  public selectFile(f: string) {
    this.dialogRef.close(f);
  }


  onFileSelected(e: any) {
    const file: File = e.target.files[0];
    if (file) {
      this.selectedFile = file.name;
      // setTimeout(() => {
      //   this.applicationRef.tick();
      // }, 50);
    }
  }

  uploadFile() {
    this.uploader.setOptions({ url: 'api/lf?action=UPLOAD&ctx=' + this.data.ctx });
    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => this.uploaded();
    this.uploader.uploadAll();
  }

  uploaded() {
    this.fileList = [];
    this.service.getUploadedFiles().subscribe(res => {
      this.fileList = res['files'];
      setTimeout(() => {
        this.applicationRef.tick();
      }, 50);
    });
  }

} 
