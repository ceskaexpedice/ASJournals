import { Component, OnInit, Input } from '@angular/core';
import { MagazinesService } from 'src/app/magazines/magazines.service';

@Component({
  selector: 'app-editor-edit',
  templateUrl: './editor-edit.component.html',
  styleUrls: ['./editor-edit.component.scss']
})
export class EditorEditComponent implements OnInit {

  @Input() editor: any;
  newKeyword: string = '';
  
  constructor(private service: MagazinesService) { }

  ngOnInit() {
  }

}
