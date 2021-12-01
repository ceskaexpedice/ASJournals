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

  constructor(
    public dialogRef: MatDialogRef<LicencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: AppService) { }

  ngOnInit(): void {
    this.service.getPeriodicalItems(this.data.journal).subscribe((res: any) => {
      this.items = res.response.docs;
      this.items.forEach(item => {
        const mods = item.mods;
        if (mods['mods:originInfo']) {
          if (mods['mods:titleInfo']) {
            item.issueNumber = mods['mods:titleInfo']['mods:partNumber'];
            item.partName = mods['mods:titleInfo']['mods:partName'];
          }
        } else if (mods['mods:titleInfo']) {
          item.issueNumber = mods['mods:titleInfo']['mods:partNumber'];
          item.partName = mods['mods:titleInfo']['mods:partName'];

        } else {

          if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
            item.issueNumber = mods['part']['detail']['number'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
            item.issueNumber = mods['mods:part']['mods:detail']['mods:number'];
          }
        }
        console.log(item.partName)
      });
    });
  }

}
