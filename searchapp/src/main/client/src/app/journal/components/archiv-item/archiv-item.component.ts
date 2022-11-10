import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-archiv-item',
  templateUrl: './archiv-item.component.html',
  styleUrls: ['./archiv-item.component.scss']
})
export class ArchivItemComponent implements OnInit {
  @Input('item') item: any;

  @Output() drillDown: EventEmitter<string> = new EventEmitter<string>();

  year: string | null = null;
  volumeNumber: string | null = null;
  issueNumber: string | null = null;
  partName: string | null = null;

  isbn: string | null = null;

  constructor(
    private service: AppService,
    private state: AppState,
    private route: ActivatedRoute,
    private router: Router) { }
  
  ngOnInit() {
    //this.service.getMods(this.item['pid']).subscribe(res => {
    
      //let mods = res["mods:modsCollection"]["mods:mods"];
      let mods = JSON.parse(this.item['mods']);
      if (this.item['model'] === 'periodicalvolume') {

        this.year = this.item.year;
        if (mods['mods:titleInfo']) {
            this.volumeNumber = mods['mods:titleInfo']['mods:partNumber'];
        } else {
          //podpora pro starsi mods. ne podle zadani
          //
          //console.log(mods);
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
      } else if (this.item['model'] === 'periodicalitem') {
        if (mods['mods:originInfo']) {
          //this.year = mods['mods:originInfo']['mods:dateIssued'];
          if (mods['mods:titleInfo']) {
            this.issueNumber = mods['mods:titleInfo']['mods:partNumber'];
            this.partName = mods['mods:titleInfo']['mods:partName'];
          }
        } else {


          //podpora pro starsi mods. ne podle zadani
          //
          //console.log(mods);
//          if (mods['part'] && mods['part']['date']) {
//            this.year = mods['part']['date'];
//          } else if (mods['mods:part'] && mods['mods:part']['mods:date']) {
//            this.year = mods['mods:part']['mods:date'];
//          }

          if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
            this.issueNumber = mods['part']['detail']['number'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
            this.issueNumber = mods['mods:part']['mods:detail']['mods:number'];
          }


        }
      }

      if (mods['mods:identifier']) {
        let identifier = mods['mods:identifier'];
        //console.log(identifier);
        if (identifier.hasOwnProperty('length')) {
          for (let i in identifier) {
            if (identifier[i]['@type']
              && identifier[i]['@type'] === 'isbn') {
              this.isbn = identifier[i]['#text'];
            }
          }
        } else {
          if (identifier['@type']
            && identifier['@type'] === 'isbn') {
            this.isbn = identifier['#text'];
          }
        }
      }
    //});
  }

  onDrillDown() {
    this.drillDown.emit(this.item['pid']);
  }


  img() {
    return this.state.config['context'] + 'api/img?uuid=' + this.item['pid'] + '&kramerius_version=' + this.item['kramerius_version'] + '&stream=IMG_THUMB&action=SCALE&scaledHeight=140';
  }
  
  gotoArticle(){
    this.findFirstdatanode(this.item['pid']);
  }
  

  findFirstdatanode(pid: string) {
    this.service.getChildren(pid, 'asc').subscribe(res => {
      if (res[0]['datanode']) {
        //this.router.navigate(['/article', res[0]['pid']]);
        this.router.navigate(['../article', res[0]['pid']], {relativeTo: this.route, queryParamsHandling: "preserve" });
        
      } else {
        this.findFirstdatanode(res[0]['pid']);
      }
    });
  }

}
