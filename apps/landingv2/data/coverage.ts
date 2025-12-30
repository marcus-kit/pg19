export interface CoverageArea {
  district: string;
  streets: string[];
  connectionType: 'ftth' | 'fttb' | 'ethernet';
}

export const coverageAreas: CoverageArea[] = [
  {
    district: 'Центр',
    streets: ['Петровская', 'Чехова', 'Фрунзе', 'Александровская', 'Греческая'],
    connectionType: 'ftth',
  },
  {
    district: 'Западный',
    streets: ['Дзержинского', 'Ленина', 'Свободы', 'Октябрьская'],
    connectionType: 'ftth',
  },
  {
    district: 'Северный',
    streets: ['Северная', 'Морозова', 'Комарова', 'Гагарина'],
    connectionType: 'fttb',
  },
  {
    district: 'Приморский',
    streets: ['Приморская', 'Портовая', 'Набережная'],
    connectionType: 'ftth',
  },
];

export const connectionTypes = {
  ftth: 'Оптика в квартиру',
  fttb: 'Оптика в дом',
  ethernet: 'Ethernet',
};

// Список улиц для проверки адреса (mock)
export const coveredStreets = coverageAreas.flatMap((area) => area.streets);
