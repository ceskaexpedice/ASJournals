export class Criterium {
  field: string | null = null;
  value: string | null = null;
  operator: string = 'AND';

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
