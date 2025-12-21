export interface Feature {
  icon: 'speed' | 'tv' | 'support' | 'price' | 'wifi' | 'family';
  title: string;
  description: string;
}

export interface CompanyInfo {
  name: string;
  phone: string;
  phoneFormatted: string;
  phoneFree: boolean;
  telegram: string;
  telegramUrl: string;
  address: string;
  workingHours: string;
  workingDays: string;
  email: string;
  website: string;
  stats: {
    speed: number;
    channels: number;
    devices: number;
  };
  features: Feature[];
}

export const companyInfo: CompanyInfo = {
  name: 'ПЖ19',
  phone: '88002225519',
  phoneFormatted: '8 800 222 55 19',
  phoneFree: true,
  telegram: '@PG19CONNECTBOT',
  telegramUrl: 'https://t.me/PG19CONNECTBOT',
  address: 'г. Таганрог, ул. Большая Бульварная, 11',
  workingHours: '8:00 - 20:00',
  workingDays: 'Пн-Пт',
  email: 'a@pg19.ru',
  website: 'https://taganrog.pg19.ru',
  stats: {
    speed: 1000,
    channels: 191,
    devices: 10,
  },
  features: [
    {
      icon: 'speed',
      title: 'Гигабитная скорость',
      description: 'До 1000 Мбит/с по оптоволокну',
    },
    {
      icon: 'tv',
      title: '191 ТВ канал',
      description: 'Включено в тариф бесплатно',
    },
    {
      icon: 'family',
      title: 'До 10 устройств',
      description: 'Одновременно без потери скорости',
    },
    {
      icon: 'price',
      title: 'Всего 699 ₽/мес',
      description: 'Интернет + ТВ в одном пакете',
    },
  ],
};

// Coverage areas
export const coverageAreas = [
  'Таганрог',
  'Ростов-на-Дону',
  'Батайск',
  'Неклиновский район',
];
