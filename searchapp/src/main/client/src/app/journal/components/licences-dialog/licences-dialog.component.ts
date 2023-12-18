import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AppService } from 'src/app/services/app.service';
import Utils from 'src/app/services/utils';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-licences-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './licences-dialog.component.html',
  styleUrls: ['./licences-dialog.component.scss']
})
export class LicencesDialogComponent {


  constructor(
    private service: AppService,
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
}
