import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, RouterModule } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { AppService } from 'src/app/services/app.service';
import { ArchivItemComponent } from '../../components/archiv-item/archiv-item.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ArticleResultComponent } from '../../components/article-result/article-result.component';
import { ArchivItemLeftComponent } from '../../components/archiv-item-left/archiv-item-left.component';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ArchivItemComponent, ArticleResultComponent, ArchivItemLeftComponent,
    MatSelectModule, MatInputModule, MatFormFieldModule, TranslateModule, MatIconModule, MatButtonModule],
  selector: 'app-archiv',
  templateUrl: './archiv.component.html',
  styleUrls: ['./archiv.component.scss']
})
export class ArchivComponent implements OnInit {

  currentPid: string = '';
  currentItem: any;
  items: any[] = [];
  parentItems: any[] = [];

  visibleItems: number = 3;
  visibleParentItems: any[] = [];
  currentParent: string = '';
  cache: any = {};

  isDataNode: boolean = false;

  volumeNumber: string | null = null;
  issueNumber: string | null = null;
  partName: string | null = null;

  sorts = [
    { label: "od nejnovějšího", dir: "desc" },
    { label: "od nejstaršího", dir: "asc" }
  ];
  currentSort = this.sorts[0];

  constructor(
    private config: Configuration,
    private service: AppService,
    public state: AppState,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {

    this.route.params
      .subscribe((params: Params) => {
        if (params['pid']) {
          this.currentPid = params['pid'];
          if (this.config) {
            this.setItems(params['pid']);
          }
        } else {
          this.currentPid = '';
          this.initData();
        }
      });
  }

  setMainClass() {

    let sufix = this.isRoot() ? '-level-1' : '-level-2';
    this.state.mainClass = 'app-page-archiv' + sufix;
    this.state.classChanged();
  }

  isRoot() {
    return this.currentPid === this.state.currentMagazine['journal'];
  }

  goToRoot() {
    this.parentItems = [];
    this.setItems(this.state.currentMagazine['journal']);
    let p: any = {};
    p['pid'] = this.state.currentMagazine['journal'];
    this.router.navigate(['.', p], { queryParamsHandling: "preserve", relativeTo: this.route });
  }

  setSort(s: any) {
    this.currentSort = s;
    let x = s.dir === 'asc' ? 1 : -1;

    this.items.sort((a, b) => {
      // return (a['idx'] - b['idx']) * x;
      if (a['model'] === 'periodicalvolume') {
        return (a['year'] - b['year']) * x;
      } else {
        return (a['idx'] - b['idx']) * x;
      }

    });
  }

  drillDown(pid: string) {

    let p: any = {};
    p['pid'] = pid;
    //this.router.navigate(['/archiv', p]);
    this.router.navigate(['.', p], { queryParamsHandling: "preserve", relativeTo: this.route });
    //    this.setItems(pid);
  }

  setFocus() {
    let el = document.getElementById('btn_' + this.currentPid);
    if (el) {
      el.focus();
    }
  }

  setItems(pid: string) {

    this.currentPid = pid;

    this.setMainClass();

    this.service.getItem(this.currentPid).subscribe(res => {
      if (this.currentPid === this.state.currentMagazine['journal']) {
        this.currentItem = { pid: this.currentPid, parents: null, model: 'periodical' };
      } else {
        this.currentItem = res;

        if (res['parents'].length > 0) {
          this.currentParent = res['parents'][0];
        } else {
          this.currentParent = '';
        }
        this.setDetails();
      }

      if (!this.cache.hasOwnProperty(this.currentPid)) {
        this.service.getChildren(this.currentPid).subscribe(res => {
          this.isDataNode = res[0]['datanode'];

          this.items = res;
          if (this.isDataNode) {
            this.items.sort((a, b) => {
              return a['idx'] - b['idx'];
            });
          } else if (this.currentItem.model === 'periodicalvolume'){
            this.items.sort((a, b) => {
              const mods1 = JSON.parse(a['mods']);
              const mods2 = JSON.parse(b['mods']);
              
              let dateIssued1: string = a.dateIssued.padStart(7, '0');
              let dateIssued2: string = b.dateIssued.padStart(7, '0');

              // Using mods
              // if (mods1['mods:titleInfo']) {
              //   if (mods1['mods:titleInfo'].hasOwnProperty('length')) {
              //     dateIssued1 = mods1['mods:titleInfo'][0]['mods:partNumber'];
              //   } else {
              //     dateIssued1 = mods1['mods:titleInfo']['mods:partNumber'];1
              //   }
              //   if (mods2['mods:titleInfo'].hasOwnProperty('length')) {
              //     dateIssued2 = mods2['mods:titleInfo'][0]['mods:partNumber'];
              //   } else {
              //     dateIssued2 = mods2['mods:titleInfo']['mods:partNumber'];1
              //   }
              // }

              // Using dateIssued mm.yyyy
              dateIssued1 = dateIssued1.split('.').reverse().join('');
              dateIssued2 = dateIssued2.split('.').reverse().join('');
              if (this.currentSort.dir === 'asc') {
                return parseInt(dateIssued1) - parseInt(dateIssued2);
              } else {
                return parseInt(dateIssued2) - parseInt(dateIssued1);
              }
            });
          }
          this.cache[this.currentPid] = { items: this.items, parent: this.currentParent };

          if (this.currentParent === null) {
            this.parentItems = [];
          } else if (this.cache.hasOwnProperty(this.currentParent)) {
            this.parentItems = this.cache[this.currentParent]['items'];
          } else {
            this.parentItems = [];
            this.service.getChildren(this.currentParent).subscribe(res => {
              this.parentItems = res;
              this.cache[this.currentParent] = { items: res };
              this.setVisibleParentsItems();
            });
          }

          this.setVisibleParentsItems();

        });
      } else {
        this.items = this.cache[this.currentPid]['items'];
        this.isDataNode = this.items[0]['datanode'];
        let p = this.cache[this.currentPid]['parent'];
        if (this.cache.hasOwnProperty(p)) {
          this.parentItems = this.cache[p]['items'];
          this.currentParent = p;
        } else {
          this.parentItems = [];
          this.currentParent = '';
        }
      }

      this.setVisibleParentsItems();


    });
    this.setFocus();
  }

  setVisibleParentsItems() {
    this.visibleParentItems = [];
    if (this.parentItems && this.parentItems.length > 0) {
      let start = 0;
      for (let idx = 0; idx < this.parentItems.length; idx++) {
        if (this.parentItems[idx].pid === this.currentPid) {
          start = idx;
        }
      }

      // visibleItems should be odd

      start = Math.max(0, start - Math.floor(this.visibleItems / 2));

      let end = Math.min(start + this.visibleItems, this.parentItems.length);
      start = Math.max(0, end - this.visibleItems);
      for (let i = start; i < end; i++) {
        this.visibleParentItems.push(this.parentItems[i]);
      }

      let x = this.currentSort.dir === 'asc' ? 1 : -1;

      this.visibleParentItems.sort((a, b) => {
        // return (a['idx'] - b['idx']) * x;
        if (a['model'] === 'periodicalvolume') {
          return (a['year'] - b['year']) * x;
        } else {
          return (a['idx'] - b['idx']) * x;
        }

      });


    }
  }

  initData() {
    if (this.state.actualNumber) {
      if (!this.currentPid) {
        this.setItems(this.state.currentMagazine['journal']);
      } else {
        this.setItems(this.currentPid);
      }
    } else {
      //this.router.navigate(['home']);
      setTimeout(() => {
        this.initData();
      }, 100);
    }
  }

  isHiddenByGenre(genres: string[]) {
    return this.service.isHiddenByGenre(genres);
  }

  setDetails() {
    let mods = JSON.parse(this.currentItem['mods']);
    if (this.currentItem['model'] === 'periodicalvolume') {

      if (mods['mods:originInfo']) {
        //this.year = mods['mods:originInfo']['mods:dateIssued'];
        if (mods['mods:titleInfo']) {
          this.volumeNumber = mods['mods:titleInfo']['mods:partNumber'];
        }
      } else {
        //podpora pro starsi mods. ne podle zadani
        if (mods['part'] && mods['part']['date']) {
          //this.year = mods['part']['date'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:date']) {
          //this.year = mods['mods:part']['mods:date'];
        }

        if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
          this.issueNumber = mods['part']['detail']['number'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
          this.issueNumber = mods['mods:part']['mods:detail']['mods:number'];
        }
      }
    } else if (this.currentItem['model'] === 'periodicalitem') {
      if (mods['mods:originInfo']) {
        //this.year = mods['mods:originInfo']['mods:dateIssued'];
        if (mods['mods:titleInfo']) {
          this.issueNumber = mods['mods:titleInfo']['mods:partNumber'];
          this.partName = mods['mods:titleInfo']['mods:partName'];
        }
      } else {
console.log(mods)

        //podpora pro starsi mods. ne podle zadani
        if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
          this.issueNumber = mods['part']['detail']['number'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
          this.issueNumber = mods['mods:part']['mods:detail']['mods:number'];
        }


      }
    }
  }


  img(pid: string, kramerius_version: string) {
    return this.config['context'] + 'api/img?uuid=' + pid + '&kramerius_version=' + kramerius_version + '&thumb=true';
  }

}
