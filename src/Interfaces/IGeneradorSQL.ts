export interface IGeneradorSQL {
  database: string;
  sqlCreateDatabase: string;
  sqlUseDatabase: string;
  tablas: ITabla[];
}

export interface ITabla {
  nombre: string;
  sql: string;
  atributos: IAtributo[];
}

export interface IAtributo {
  nombre: string;
  tipo: string;
  tipoOriginal: string;
}