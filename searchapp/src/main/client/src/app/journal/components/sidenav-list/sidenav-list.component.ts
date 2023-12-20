import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-sidenav-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatSidenavModule, MatListModule, NavbarComponent],
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  public isMobile = true;

  /* @Output() sidenavClose = new EventEmitter();

  public onSidenavClose = () => {
    this.sidenavClose.emit();
  } */

  // sidenav
  @Output() public sidenavToggle = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  // sidenav fuction
  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}