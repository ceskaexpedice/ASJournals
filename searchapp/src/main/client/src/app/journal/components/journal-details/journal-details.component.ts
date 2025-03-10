import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Journal } from 'src/app/models/journal.model';
import { AppService } from 'src/app/services/app.service';




@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule],
  selector: 'app-journal-details',
  templateUrl: './journal-details.component.html',
  styleUrls: ['./journal-details.component.scss']
})
export class JournalDetailsComponent implements OnInit {

  @Input('journal') journal: Journal | null = null;
  year: string | null = null;
  volumeNumber: string | null = null;
  issueNumber: string | null = null;
  partName: string | null = null;

  constructor(private appService: AppService) { }

  ngOnInit() {
    this.details();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['journal'] && !changes['journal'].firstChange && changes['journal'].currentValue.pid !== changes['journal'].previousValue?.pid) {
      this.details();
    }
  }

  details() {
    if (this.journal?.mods) {
      let mods = this.journal.mods;
      if (this.journal.model === 'periodicalvolume') {

        if (mods['mods:originInfo']) {
          this.year = mods['mods:originInfo']['mods:dateIssued'];
          if (mods['mods:titleInfo']) {
            this.volumeNumber = mods['mods:titleInfo']['mods:partNumber'];
          }
        } else {
          //podpora pro starsi mods. ne podle zadani
          if (mods['part'] && mods['part']['date']) {
            this.year = mods['part']['date'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:date']) {
            this.year = mods['mods:part']['mods:date'];
          }

          if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
            this.issueNumber = mods['part']['detail']['number'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
            this.issueNumber = mods['mods:part']['mods:detail']['mods:number'];
          }
        }
      } else if (this.journal.model === 'periodicalitem') {
        this.appService.getMods(this.journal?.parent!).subscribe(parentMods => {
          if (parentMods['mods:originInfo']) {
            this.year = parentMods['mods:originInfo']['mods:dateIssued'];
            if (parentMods['mods:titleInfo']) {
              this.volumeNumber = parentMods['mods:titleInfo']['mods:partNumber'];
            }
          }
        });
        if (mods['mods:originInfo']) {
          if (mods['mods:titleInfo']) {
            this.issueNumber = mods['mods:titleInfo']['mods:partNumber'];
            this.partName = mods['mods:titleInfo']['mods:partName'];
          }
        } else if  (mods['mods:titleInfo']) {
            this.issueNumber = mods['mods:titleInfo']['mods:partNumber'];
            this.partName = mods['mods:titleInfo']['mods:partName'];
        
        } else {
          //podpora pro starsi mods. ne podle zadani
          if (mods['part'] && mods['part']['date']) {
            this.year = mods['part']['date'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:date']) {
            this.year = mods['mods:part']['mods:date'];
          }

          if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
            this.issueNumber = mods['part']['detail']['number'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
            this.issueNumber = mods['mods:part']['mods:detail']['mods:number'];
          }
        }

      }
    } else if (this.journal?.pid) {
      this.appService.getMods(this.journal?.pid!).subscribe(mods => {
        if (this.journal) {
          this.journal.mods = mods;
          this.details();
        }
      });
    }
    //     Úroveň: Ročník
    //§  Rok: originInfo/dateIssued
    //§  Číslo ročníku: titleInfo/partNumber
    //o   Úroveň: Číslo
    //§  Číslo čísla: titleInfo/partNumber
    //Speciální název čísla: titleInfo/partName


  }

}
