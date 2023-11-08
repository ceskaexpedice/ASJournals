import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: true,
  imports: [],
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  public currentYear = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
  }

}
