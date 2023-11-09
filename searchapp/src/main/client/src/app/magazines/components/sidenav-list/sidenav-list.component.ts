import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatSidenavModule, MatListModule],
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
    public state: MagazineState,
    public service: MagazinesService,
    public translate: TranslateService) { }

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
