import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AppService } from 'src/app/services/app.service';
import Utils from 'src/app/services/utils';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AppState } from 'src/app/app.state';

@Component({
  selector: 'app-licences-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatIconModule, MatInputModule],
  templateUrl: './licences-dialog.component.html',
  styleUrls: ['./licences-dialog.component.scss']
})
export class LicencesDialogComponent {


  constructor(
    private service: AppService,
    private state: AppState,
    public dialogRef: MatDialogRef<LicencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      cache: { [pid: string]: { label: string, licence: string, children: any[], show?: boolean } }, 
      journal: string,
      licences: any 
    }) { }

  getChildren(pid: string, item: any) {
    if (!this.data.cache[pid]) {
      this.data.cache[pid] = { label: Utils.setLabel(item), licence: this.data.licences[pid], children: [] };
    }

    if (this.data.cache[pid].children.length === 0) {
      this.service.getChildren(pid).subscribe(res => {
        this.data.cache[pid].children = [];
        res.forEach((e: any) => {
          e.label = Utils.setLabel(e);
          this.data.cache[pid].children.push(e);
          this.data.cache[e.pid] = { label: Utils.setLabel(e), licence: this.data.licences[e.pid], show: false, children: [] };
        });
      });
    }
    this.data.cache[pid].show = !this.data.cache[pid].show;
  }

  saveLicenses() {

    const pids = Object.keys(this.data.cache);
    // const licences: any = {};
    pids.forEach(pid => {
      if (this.data.cache[pid]?.licence !== '') {
        this.data.licences[pid] = this.data.cache[pid].licence;
      } else if (this.data.cache[pid]?.licence === '') {
        delete (this.data.licences[pid]);
      }
    });
    this.state.currentMagazine!.licences = JSON.stringify(this.data.licences);

    this.service.saveMagazine(this.state.currentMagazine!).subscribe(res => {
      if (res.error) {
        this.service.showSnackBar('snackbar.error.changeSaved', 'desc.error', true);
      } else {
        this.service.showSnackBar('snackbar.success.changeSaved');
        this.dialogRef.close(true);
      }
    });


    
  }
}
