export class Criterium {
  field: string = '_text_';
  fieldLabel: string = 'kdekoliv';
  value: string | null = null;
  operator: string = 'AND';
  operatorLabel: string = 'a zároveň';

  constructor() { }

  fromUrl(j: any) {
    this.field = j['f'];
    this.value = j['v'];
    this.operator = j['o'];
  }

  toUrl(): any {
    return {
      f: this.field,
      v: this.value,
      o: this.operator
    };
  }
}
