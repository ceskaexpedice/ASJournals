import { Component, OnInit, Input } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { MagazinesService } from 'src/app/magazines/magazines.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {

  @Input() user: any;
  
  constructor(
    public state: AppState,
    private service: MagazinesService) { }

  ngOnInit() {
  }

}
