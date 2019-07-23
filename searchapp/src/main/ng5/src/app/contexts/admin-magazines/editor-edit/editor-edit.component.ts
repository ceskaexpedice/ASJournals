import { Component, OnInit, Input } from '@angular/core';
import {Magazine} from '../../../models/magazine';
import {MagazinesService} from '../../magazines.service';

@Component({
  selector: 'app-editor-edit',
  templateUrl: './editor-edit.component.html',
  styleUrls: ['./editor-edit.component.scss']
})
export class EditorEditComponent implements OnInit {

  @Input() editor;
  newKeyword: string = '';
  
  constructor(private service: MagazinesService) { }

  ngOnInit() {
  }

}
