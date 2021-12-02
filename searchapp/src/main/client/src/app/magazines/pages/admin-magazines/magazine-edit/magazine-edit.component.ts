import { Component, OnInit, Input, SimpleChanges, SimpleChange } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppState } from 'src/app/app.state';
import { MagazinesService } from 'src/app/magazines/magazines.service';
import { Magazine } from 'src/app/models/magazine';
import { LicencesDialogComponent } from '../licences-dialog/licences-dialog.component';

@Component({
  selector: 'app-magazine-edit',
  templateUrl: './magazine-edit.component.html',
  styleUrls: ['./magazine-edit.component.scss']
})
export class MagazineEditComponent implements OnInit {

  @Input() mag: Magazine = new Magazine();
  @Input() editors: {
    id: string,
    typ: string,
    name: string,
    adresa: string,
    web: string
  }[]  = [];

  vydavatel?: {
    id: string,
    typ: string,
    name: string,
    adresa: string,
    web: string
  };
  newKeyword: string = '';
  
  constructor(
    public dialog: MatDialog,
    public state: AppState,
    private service: MagazinesService) { }

  ngOnInit() {
    this.vydavatel = this.editors.find(e => e.id === this.mag.vydavatel_id)
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.mag) {
      this.vydavatel = this.editors.find(e => e.id === this.mag.vydavatel_id)
    }
  }
  
  removeKeyword(idx: number){
    this.mag.keywords.splice(idx, 1);
  }
  
  addKeyword(){
    if(this.newKeyword !== ''){
      if(!this.mag.keywords){
        this.mag.keywords = [];
      }
        this.mag.keywords.push(this.newKeyword);
      this.newKeyword = '';
    }
  }

  setVydavatel(e: any) {
    this.mag.vydavatel_id = e.id;
    this.mag.vydavatel = e.name;
  }

  setLicences() {
    const dialogRef = this.dialog.open(LicencesDialogComponent, {
      width: '1150px',
      data: this.mag,
      panelClass: 'app-dialog-states'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mag.licences = JSON.stringify(result);
      }

    });
  }

}