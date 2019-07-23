import { Component, OnInit, ViewChild } from '@angular/core';

import {MagazineState} from '../magazine.state';
import {MagazinesService} from '../magazines.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  @ViewChild('loginuser') loginuser: any;
  loginError: boolean = false;

  constructor(
    public state: MagazineState,
    public service: MagazinesService) { }

  ngOnInit() {
    this.focusu();
  }

  focusu(){
    setTimeout(() => {
        this.loginuser.nativeElement.focus();
      }, 100);

  }

  focusp(e, el){
      el.focus();
  }

}
