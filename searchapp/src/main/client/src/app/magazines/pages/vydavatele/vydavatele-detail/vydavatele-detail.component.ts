import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { MagazineState } from 'src/app/magazines/magazine.state';
import { MagazinesService } from 'src/app/magazines/magazines.service';


@Component({
  selector: 'app-vydavatele-detail',
  templateUrl: './vydavatele-detail.component.html',
  styleUrls: ['./vydavatele-detail.component.scss']
})
export class VydavateleDetailComponent implements OnInit {
  

  subscriptions: Subscription[] = [];
  showingDetail: boolean = false;
  editor: any;

  constructor(
    private route: ActivatedRoute,
    public state: MagazineState,
    private service: MagazinesService
  ) {}

  ngOnInit() {
    
    let id = this.route.snapshot.paramMap.get('id');
    if(this.state.editorsbyId.hasOwnProperty(id)){
      this.setData(id!);
    } else {
      if (this.state.config){
        this.service.getEditors().subscribe(res => {

            this.setData(id!);

          });
      } else {
        this.subscriptions.push(this.state.configSubject.subscribe((state) => {
          this.service.getEditors().subscribe(res => {

            this.setData(id!);

          });
        }));
      }
    }
    
  }
  
  setData(id: string){
      this.editor = this.state.editorsbyId[id];
      this.service.getEditorMagazines(id).subscribe(res => {});
    
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }


  // toggle content function by id
  toggleDetail(id: string) {
    this.showingDetail = !this.showingDetail;
    // $('#' + id + '-btn').toggleClass('active');
    // $('#' + id).slideToggle("fast");
  }
}
