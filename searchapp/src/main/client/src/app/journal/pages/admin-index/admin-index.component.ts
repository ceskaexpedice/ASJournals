import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, Router} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule, FileUploader } from 'ng2-file-upload';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { AppService } from 'src/app/services/app.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-index',
  standalone: true,
  imports: [CommonModule, FileUploadModule, TranslateModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule,
    MatDividerModule, MatRadioModule, MatProgressBarModule, MatDialogModule],
  templateUrl: './admin-index.component.html',
  styleUrls: ['./admin-index.component.scss']
})
export class AdminIndexComponent {

  indexUUID: string | null = null;

  public uploader: FileUploader = new FileUploader({ url: 'lf?action=UPLOAD' });
  public coverUploader: FileUploader = new FileUploader({ url: 'lf?action=UPLOAD&cover=true' });
  statusInterval: any;
  workStatus: any = { status: 'none' };
  working: boolean = false;
  indexed: boolean = false;
  deleted: boolean = false;
  resultMsg: string = '';

  selectedCover: string;
  coverMsg: string | null = null;
  t: number = new Date().getTime();

  constructor(
    public dialog: MatDialog,
    private config: Configuration,
    public state: AppState,
    private service: AppService,
    private router: Router,
    private route: ActivatedRoute) { }

    

  index() {
    this.working = true;
    this.resultMsg = '';
    this.statusInterval = setInterval(() => {
      this.checkStatus();
    }, 1000)
    this.service.index(this.indexUUID!, this.state.currentMagazine.isK7).subscribe(res => {
      this.resultMsg = res.hasOwnProperty('error') ? res.error : res.msg;
      this.working = false;
    });
  }

  checkStatus() {
    this.service.getIndexStatus().subscribe((res: any) => {
      this.workStatus = res;
      if (res.status === 'finished') {
        clearInterval(this.statusInterval);
      } else {

      }
    });

  }

  onDelete() {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '900px',
      data: { title: this.service.translateKey('admin.delete_uuid'), 
              msg: this.service.translateKey('admin.confirm_delete') + ' ' + this.indexUUID}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.working = true;
        this.resultMsg = '';
        this.service.delete(this.indexUUID!).subscribe((res: any) => {
          // this.workStatus = res;
          this.workStatus = { currentUuid: this.indexUUID, status :'delete_finished', msg: res['error'] ? res.error : res.msg };
          this.resultMsg = res.hasOwnProperty('error') ? res.error : res.msg;
          this.working = false;
        });
      }
    });
  }

  // uploadFile() {
  //   this.uploader.setOptions({ url: 'lf?action=UPLOAD&ctx=' + this.state.currentMagazine?.ctx });
  //   this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => this.uploaded();
  //   this.uploader.uploadAll();
  // }

  onFileSelected(e: any) {
    const file: File = e.target.files[0];
    if (file) {
      this.selectedCover = file.name;
    }
  }

  uploadCover() {
    this.coverMsg = 'loading';
    setTimeout(() => {
      this.coverUploader.setOptions({ url: 'lf?action=UPLOAD&cover=true&ctx=' + this.state.currentMagazine.ctx });
      this.coverUploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => this.coverUploaded();
      this.coverUploader.uploadAll();
    }, 100);
  }

  coverUploaded() {
    this.coverMsg = 'ok';
    this.t = new Date().getTime();
  }

}
