import { keyframes } from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-licences-dialog',
  templateUrl: './licences-dialog.component.html',
  styleUrls: ['./licences-dialog.component.scss']
})
export class LicencesDialogComponent implements OnInit {

  items: any[] = [];
  cache: any = {};
  licences: any = {};

  constructor(
    public dialogRef: MatDialogRef<LicencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: AppService) { }

  ngOnInit(): void {
    if (this.data.licences) {
      this.licences = JSON.parse(this.data.licences);
    }
    
    this.cache[this.data.journal] = {label: this.data.year, licence: ''};
    this.getChildren(this.data.journal, this.data);
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

  getChildren(pid: string, item: any) {

    if (!this.cache[pid]) {
      this.cache[pid] = {label: this.setLabel(item), licence: this.licences[pid]};
    }

    if (!this.cache[pid].children) {
      this.service.getChildren(pid).subscribe(res => {
        this.cache[pid].children = [];
        res.forEach((e: any) => {
          e.label = this.setLabel(e);
          this.cache[pid].children.push(e);
          this.cache[e.pid] = {label: this.setLabel(e), licence: this.licences[e.pid], show: false};
        });
      });
    }
    this.cache[pid].show = !this.cache[pid].show;
  }

  save() {
    const pids = Object.keys(this.cache);
    // const licences: any = {};
    pids.forEach(pid => {
      if (this.cache[pid]?.licence !== '') {
        this.licences[pid] = this.cache[pid].licence;
      } else if (this.cache[pid]?.licence === '') {
        delete(this.licences[pid]);
      }
    });
      
      this.dialogRef.close(this.licences);
  }

}
