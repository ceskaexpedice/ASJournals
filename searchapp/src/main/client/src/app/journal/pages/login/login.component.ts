import { Component, OnInit, ViewChild } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/services/app.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  @ViewChild('loginuser') loginuser: any;
  loginError: boolean = false;

  constructor(
    public state: AppState,
    public service: AppService) { }

  ngOnInit() {
    this.focusu();
  }

  focusu(){
    setTimeout(() => {
        this.loginuser.nativeElement.focus();
      }, 100);

  }

  focusp(e: any, el: any){
      el.focus();
  }

}
