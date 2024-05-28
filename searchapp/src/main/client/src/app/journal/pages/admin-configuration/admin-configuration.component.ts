import { Component } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FileUploadModule, FileUploader } from 'ng2-file-upload';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { AppService } from 'src/app/services/app.service';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import Utils from 'src/app/services/utils';
import { LicencesDialogComponent } from '../../components/licences-dialog/licences-dialog.component';
import { ResetPwdDialogComponent } from '../../components/reset-pwd-dialog/reset-pwd-dialog.component';
import { error } from 'console';


@Component({
  selector: 'app-admin-configuration',
  standalone: true,
  imports: [CommonModule, FileUploadModule, TranslateModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule,
    MatDividerModule, MatRadioModule, MatProgressBarModule, MatDialogModule],
  templateUrl: './admin-configuration.component.html',
  styleUrls: ['./admin-configuration.component.scss']
})
export class AdminConfigurationComponent {

  cache: { [pid: string]: { label: string, licence: string, children: any[], show?: boolean } } = {};
  licences: any = {};

  sortBy = 'genre';
  keepLang: boolean = false;

  constructor(
    public dialog: MatDialog,
    private config: Configuration,
    public state: AppState,
    private service: AppService,
    private router: Router,
    private route: ActivatedRoute
    ) { }

  ngOnInit() {
    if (this.state.currentMagazine.licences && this.state.currentMagazine.journal) {
      this.licences = JSON.parse(this.state.currentMagazine.licences);
    }
    this.cache[this.state.currentMagazine!.journal!] = { label: 'root', licence: '', children: [] };
    this.getChildren(this.state.currentMagazine!.journal!, this.state.currentMagazine);

    if (this.state.currentMagazine.sortByOrder) {
      this.sortBy = 'order';
    }

    this.keepLang = !!this.state.currentMagazine!.keepLang;

  }


  getChildren(pid: string, item: any) {

    if (!this.cache[pid]) {
      this.cache[pid] = { label: Utils.setLabel(item), licence: this.licences[pid], children: [] };
    }

    if (this.cache[pid].children.length === 0) {
      this.service.getChildren(pid).subscribe(res => {
        this.cache[pid].children = [];
        res.forEach((e: any) => {
          e.label = Utils.setLabel(e);
          this.cache[pid].children.push(e);
          this.cache[e.pid] = { label: Utils.setLabel(e), licence: this.licences[e.pid], show: false, children: [] };
        });
      });
    }
    this.cache[pid].show = !this.cache[pid].show;
  }


  setLicences() {
    const dialogRef = this.dialog.open(LicencesDialogComponent, {
      width: '900px',
      data: { cache: this.cache, journal: this.state.currentMagazine.journal, licences: this.licences }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveLicences();
      }
    })
  }

  saveLicences() {
    const pids = Object.keys(this.cache);
    // const licences: any = {};
    pids.forEach(pid => {
      if (this.cache[pid]?.licence !== '') {
        this.licences[pid] = this.cache[pid].licence;
      } else if (this.cache[pid]?.licence === '') {
        delete (this.licences[pid]);
      }
    });
    this.state.currentMagazine!.licences = JSON.stringify(this.licences);

    //this.service.saveMagazine(this.state.currentMagazine!).subscribe(res => {
      // this.service.getMagazines().subscribe(res2 => {
      //   this.state.ctxs = res2['response']['docs'];
      // });   
    //});
  }



  showResetPwd() {
    const dialogRef = this.dialog.open(ResetPwdDialogComponent, {
      width: '600px',
      data: { username: this.state.username}
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.resetPwd();
    //   }
    // });
  }

  

  saveMagazine() {
    this.state.currentMagazine!.sortByOrder = this.sortBy === 'order';
    this.state.currentMagazine!.keepLang = this.keepLang;
    this.service.saveMagazine(this.state.currentMagazine!).subscribe(res => {
      if (res.error) {
        this.service.showSnackBar('snackbar.error.changeSaved', 'desc.error', true);
      } else {
        this.service.showSnackBar('snackbar.success.changeSaved');
      }
    });
  }

}
