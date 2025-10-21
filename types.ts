export enum DrawType {
  Pink3 = 'Pink 3',
  Pink4 = 'Pink 4',
}

export enum DrawSession {
  Midday = 'Mediodía',
  Night = 'Noche',
}

export interface DrawResult {
  id: number;
  type: DrawType;
  session: DrawSession;
  numbers: number[];
  timestamp: Date;
}
