import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {MagazineState} from '../magazine.state';
import {MagazinesService} from '../magazines.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(
  private route: ActivatedRoute,
  private router: Router, 
    public state: MagazineState, 
    private service: MagazinesService) { }

  ngOnInit() {
  }
  
  logout(){
    this.service.logout();
  }
  
  goHome(){
    this.state.filters = [];
    this.state.clear();
    this.router.navigate([''], {queryParamsHandling: "preserve"});
//    if (this.route.snapshot.firstChild.url[0].path.indexOf('seznam-casopisu') > -1){
//      this.service.getMagazines().subscribe();
//    } else {
//      setTimeout(() => {
//        this.router.navigate(['/seznam-casopisu']);
//      }, 100);
//      
//    }
    
  }

}
