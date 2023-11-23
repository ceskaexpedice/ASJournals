import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, ɵɵclassMapInterpolate1 } from '@angular/core';
import { Subscription } from 'rxjs';


import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Magazine } from 'src/app/models/magazine';
import { AppService } from 'src/app/services/app.service';
import { CommonModule } from '@angular/common';
import { Configuration } from 'src/app/models/configuration';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatTabsModule, TranslateModule],
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  // @ViewChild('filesModal') filesModal: any;
  // @ViewChild('childModal') public childModal: ModalDirective | null = null;
  // @ViewChild('comfirmTemplate') public comfirmTemplate: ModalDirective | null = null;
  // @ViewChild('licencesModal') public licencesModal: ModalDirective | null = null;
  // @ViewChild('resetpwdModal') public resetpwdModal: ModalDirective | null = null;



  // openConfirm() {
  //   this.comfirmTemplate?.show();
  // }

  // confirmDelete(): void {

  //   this.working = true;
  //   this.resultMsg = '';
  //   this.service.delete(this.indexUUID!).subscribe(res => {
  //     this.resultMsg = res.hasOwnProperty('error') ? res.error : res.msg;
  //     this.working = false;
  //   });
  //   this.comfirmTemplate?.hide();
  // }

  // decline(): void {
  //   this.comfirmTemplate?.hide();
  // }

  // uploadFile() {

  //   this.uploader.setOptions({ url: 'lf?action=UPLOAD&ctx=' + this.state.currentMagazine?.ctx });
  //   this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => this.uploaded();
  //   this.uploader.uploadAll();
  // }


  // uploadCover() {
  //   this.coverUploader.setOptions({ url: 'lf?action=UPLOAD&cover=true&ctx=' + this.state.currentMagazine?.ctx });
  //   this.coverUploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => this.coverUploaded();
  //   this.coverUploader.uploadAll();
  // }

  // public selectFile(f: string) {
  //   this.selectedFile = f;

  //   this.childModal?.hide();
  //   const link = this.config['context'] + 'lf?action=GET_FILE&ctx=' + this.state.currentMagazine?.ctx;
  //   console.log(link);
  //   this.editor.insertContent('&nbsp;<a target="_blank" href="' + link + '&filename=' + this.selectedFile + '">' + this.selectedFile + '</a>&nbsp;');
  // }

  // public browseFiles() {
  //   this.service.getUploadedFiles().subscribe(res => {
  //     this.fileList = res['files'];
  //   });

  //   this.childModal?.show();
  // }

  // public closeFiles() {
  //   this.childModal?.hide();
  //   //this.editor.insertContent('&nbsp;<b>' + this.selectedFile + '</b>&nbsp;');
  // }

  // setLicences() {
  //   this.licencesModal?.show();
  // }

  



 

  

}