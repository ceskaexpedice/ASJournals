import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, MatToolbarModule, MatIconModule],
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  // sidenav
  @Output() public sidenavToggle = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService,
    public state: MagazineState,
    private service: MagazinesService) { }

  ngOnInit() {
  }

  logout() {
    this.service.logout();
  }

  goHome() {
    this.state.filters = [];
    this.state.clear();
    this.router.navigate([''], { queryParamsHandling: "preserve" });
  }

  // sidenav fuction
  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

}