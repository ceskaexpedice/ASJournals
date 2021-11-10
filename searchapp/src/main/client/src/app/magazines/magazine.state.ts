import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
  
@Injectable()
  export class MagazineState {

  private _stateSubject = new Subject();
  public stateChangedSubject: Observable<any> = this._stateSubject.asObservable();

  private _classSubject = new Subject();
  public classChangedSubject: Observable<any> = this._classSubject.asObservable();

  private _fullScreenSubject = new Subject();
  public fullScreenSubject: Observable<any> = this._fullScreenSubject.asObservable();
  
  public _paramsSubject = new Subject();
  public paramsSubject: Observable<any> = this._paramsSubject.asObservable();
  
  public _configSubject = new Subject();
  public configSubject: Observable<any> = this._configSubject.asObservable();
  
  //Holds client configuration
  config: any;

  loginuser: string | null = null;
  loginpwd: string | null = null;
  loginError: boolean = false;
  logged: boolean = false;
  redirectUrl: string | null = null;
  
  currentLang: string = 'cs';
  
  //Seznam casopisu
  magazines = [];
  facets: any[] = [];
  filters: {field: string, value: string}[] = [];
  currentSortDir: string = 'asc';
  
  
  
  editorsList: any=[];
  editors: any = {};
  editorsType: any = [];
  editorsbyId: any = {};
  
  
  setConfig(cfg: any){
    this.config = cfg;
    this._configSubject.next(cfg);
  }
  
  //params
  paramsChanged(){    
    this._paramsSubject.next(this);
  }
  
  //Clear state vars
  clear() {
    this.magazines = [];
    this.facets = [];
  }
  
  setFacets(facets: any){
    this.facets = [];
    let fields = Object.keys(facets);
    for (let i = 0; i < fields.length; i++){
      //this.facets.push({field: fields[i], values: facets[fields[i]].filter(f => !this.facetUsed(fields[i], f))});
      this.facets.push({field: fields[i], values: facets[fields[i]]});
    }
    this._stateSubject.next(this);
  }
  
  isFacetUsed(field: string, value: string): boolean{
    for (let i in this.filters){
      if (this.filters[i].field === field && this.filters[i].value === value){
        return true;
      }
    }
    return false;
  }
  
  setEditors(resp: any){
    this.editorsList = resp['response']['docs'];
    this.editors = {};
    this.editorsbyId = {};
    this.editorsType = [];
    //let docs = resp['response']['docs'];
    let typy: any = resp['facet_counts']['facet_fields']['typ'];
    
    for (let i = 0; i < typy.length; i++){
      this.editorsType.push(typy[i]['name']);
      this.editors[typy[i]['name']] = [];
    }
    for (let i = 0; i < this.editorsList.length; i++){
      let doc = this.editorsList[i];
      this.editors[doc["typ"]].push(doc);
      this.editorsbyId[doc["id"]] = doc;
    }
    this._stateSubject.next(this);
  }
  
  addFilter(field: string, value: string){
    this.filters.push({field: field, value: value});
  }
  
  removeFilter(idx: number){
    this.filters.splice(idx,1);
  }
  
}
