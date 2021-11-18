import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { MagazinesService } from '../../magazines.service';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  
  @Output() sidenavClose = new EventEmitter();

  public onSidenavClose = () => {
    this.sidenavClose.emit();
  }

  // sidenav
  @Output() public sidenavToggle = new EventEmitter();

  constructor(
    public state: AppState,
    public service: MagazinesService) { }

  ngOnInit(): void {
  }

  // sidenav fuction
  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  logout(){
    this.service.logout();
  }

}
