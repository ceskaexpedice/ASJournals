import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  selector: 'app-search-tabs',
  templateUrl: './search-tabs.component.html',
  styleUrls: ['./search-tabs.component.scss']
})
export class SearchTabsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
