import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-admin-configuration',
  standalone: true,
  imports: [CommonModule, FileUploadModule, TranslateModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule,
    MatDividerModule, MatRadioModule, MatProgressBarModule],
  templateUrl: './admin-configuration.component.html',
  styleUrls: ['./admin-configuration.component.scss']
})
export class AdminConfigurationComponent {

  indexUUID: string | null = null;

  public uploader: FileUploader = new FileUploader({ url: 'api/lf?action=UPLOAD' });
  public coverUploader: FileUploader = new FileUploader({ url: 'api/lf?action=UPLOAD&cover=true' });

  working: boolean = false;
  indexed: boolean = false;
  deleted: boolean = false;
  resultMsg: string = '';

  cache: any = {};
  licences: any = {};
  isK7: boolean = false;

  selectedCover: string;
  coverMsg: string | null = null;

  newPwd = '';
  newPwdOk = false;

  sortBy = 'genre';
  keepLang: boolean = false;

  constructor(
    private config: Configuration,
    public state: AppState,
    private service: AppService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {

    if (this.state.currentMagazine.licences && this.state.currentMagazine.journal) {
      this.licences = JSON.parse(this.state.currentMagazine.licences);
    }

    if (this.state.currentMagazine.isK7) {
      this.isK7 = true
    }
    this.cache[this.state.currentMagazine!.journal!] = { label: 'root', licence: '' };
    this.getChildren(this.state.currentMagazine!.journal!, this.state.currentMagazine);

    if (this.state.currentMagazine.sortByOrder) {
      this.sortBy = 'order';
    }

    this.keepLang = !!this.state.currentMagazine!.keepLang;

  }


  getChildren(pid: string, item: any) {

    if (!this.cache[pid]) {
      this.cache[pid] = { label: this.setLabel(item), licence: this.licences[pid] };
    }

    if (!this.cache[pid].children) {
      this.service.getChildren(pid).subscribe(res => {
        this.cache[pid].children = [];
        res.forEach((e: any) => {
          e.label = this.setLabel(e);
          this.cache[pid].children.push(e);
          this.cache[e.pid] = { label: this.setLabel(e), licence: this.licences[e.pid], show: false };
        });
      });
    }
    this.cache[pid].show = !this.cache[pid].show;
  }

  setLabel(item: any) {
    let label = '';
    const mods = JSON.parse(item['mods']);
    if (item['model'] === 'periodicalvolume') {
      label += item.year;
      if (mods['mods:originInfo']) {
        //this.year = mods['mods:originInfo']['mods:dateIssued'];
        if (mods['mods:titleInfo']) {
          label += ', ročník: ' + mods['mods:titleInfo']['mods:partNumber'];
        }
      } else {
        //podpora pro starsi mods. ne podle zadani
        if (mods['part'] && mods['part']['date']) {
          //this.year = mods['part']['date'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:date']) {
          //this.year = mods['mods:part']['mods:date'];
        }

        if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
          label += ' ' + mods['part']['detail']['number'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
          label += ' ' + mods['mods:part']['mods:detail']['mods:number'];
        }
      }
    } else if (item['model'] === 'periodicalitem') {
      if (mods['mods:originInfo']) {
        //this.year = mods['mods:originInfo']['mods:dateIssued'];
        if (mods['mods:titleInfo']['mods:partNumber']) {
          label += ' Číslo: ' + mods['mods:titleInfo']['mods:partNumber'];
        }
        if (mods['mods:titleInfo']['mods:partName']) {
          label += ' Part: ' + mods['mods:titleInfo']['mods:partName'];
        }
      } else {
        //podpora pro starsi mods. ne podle zadani
        if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
          label += ' Číslo: ' + mods['part']['detail']['number'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
          label += ' Číslo: ' + mods['mods:part']['mods:detail']['mods:number'];
        }
      }
    }
    return label;
  }

  index() {
    this.working = true;
    this.resultMsg = '';
    this.service.index(this.indexUUID!, this.isK7).subscribe(res => {
      this.resultMsg = res.hasOwnProperty('error') ? res.error : res.msg;
      this.working = false;
    });
  }

  openConfirm() {

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
    this.coverUploader.setOptions({ url: 'api/lf?action=UPLOAD&cover=true&ctx=' + this.state.currentMagazine.ctx });
    this.coverUploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => this.coverUploaded();
    this.coverUploader.uploadAll();
  }

  coverUploaded() {
    this.coverMsg = 'ok';
  }

  setLicences() {
    // this.licencesModal?.show();
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

    this.service.saveMagazine(this.state.currentMagazine!).subscribe(res => {
      // this.service.getMagazines().subscribe(res2 => {
      //   this.state.ctxs = res2['response']['docs'];
      // });
    });

    // this.licencesModal?.hide();
  }



  showResetPwd() {

  }

  resetPwd() {
    this.newPwdOk = false;
    if (this.newPwd !== '') {
      this.service.resetPwd(this.state.username, this.newPwd).subscribe(res => {
        if (res.error) {
          alert(res.error)
        } else {
          this.newPwdOk = true;
          // this.resetpwdModal?.hide();
        }
      });
    }
  }

  saveMagazine() {
    this.state.currentMagazine!.sortByOrder = this.sortBy === 'order';
    this.state.currentMagazine!.keepLang = this.keepLang;
    this.service.saveMagazine(this.state.currentMagazine!).subscribe(res => {
    });
  }

}
