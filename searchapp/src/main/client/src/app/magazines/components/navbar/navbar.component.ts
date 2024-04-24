import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatToolbarModule, MatIconModule, MatButtonModule],
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

  

  changeLang(lang: string) {
    // this.translate.use(lang);

    this.service.changeLang(lang);

    let p: any = {};
    p['lang'] = lang;
    this.router.navigate([], { relativeTo: this.route, queryParams: p, queryParamsHandling: "merge" });
  }

}