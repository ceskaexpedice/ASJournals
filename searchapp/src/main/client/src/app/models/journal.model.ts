import {AppState} from "../app.state";


export class Journal{
    pid: string | null =null;
    parent: string | null = null;
    title: string | null = null;
    root_pid: string | null = null;
    root_title: string | null = null;
    model: string | null = null;
    details: any = null;
    siblings: any[] = [];
    mods: any = null;
    genres : string[] = [];
    genresObject: any = {};
    year: number = 0;
  constructor(){
    
  }
  
  setArticles(res1: any, mergeGenres: any) {
    if(!res1 || !res1.hasOwnProperty('response')){ 
      return; 
    }
    this.genresObject = {};
    let res = res1['response']['docs'];
    for (let j in res) {
      let art = res[j];
      if (art && art['pid']) {
        // art['mods'] = art['mods'];
          //let mods = bmods["mods:modsCollection"]["mods:mods"];
        
        // if (!art.hasOwnProperty("genre")) {
        //   art['genre'] = ['article']
        // }
        if (art.hasOwnProperty("genre")) {
            for (let i in art['genre']) {
              let genre = art['genre'][i];
              if (mergeGenres.hasOwnProperty(genre) ){
                  genre = mergeGenres[genre];
              }

              //if (this.isGenreVisible(genre)) {
                if (this.genresObject.hasOwnProperty(genre)) {
                  this.genresObject[genre]['articles'].push(art);
                } else {
                  this.genres.push(genre);
                  this.genresObject[genre] = {};
                  this.genresObject[genre]['articles'] = [];
                  this.genresObject[genre]['articles'].push(art);
                }
                this.genresObject[genre]['visible'] = this.isGenreVisible(genre);
              //}

          
            }
          }
      }
    }
  }
  

  isGenreVisible(genre: string): boolean {
    return genre !== 'cover' &&
      genre !== 'advertisement' && 
      genre !== 'peer-reviewed' && 
      genre !== 'colophon';
  }
  
  
}