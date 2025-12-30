export interface TariffOption {
  name: string;
  price: number;
  included?: boolean;
}

export interface Tariff {
  id: number;
  name: string;
  price: number;
  speed: string;
  speedValue: number;
  description: string;
  features: string[];
  popular?: boolean;
  options?: TariffOption[];
  badge?: string;
}

export const tariffs: Tariff[] = [
  {
    id: 1,
    name: 'Остров Сокровищ-1000',
    price: 699,
    speed: '1000 Мбит/с',
    speedValue: 1000,
    description: 'Гигабитный интернет для всей команды',
    badge: '🏴‍☠️ Сокровище',
    popular: true,
    features: [
      'Скорость до 1 Гбит/с',
      'Цифровое ТВ 191 канал',
      'До 10 устройств одновременно',
      'Скачивание 1 ГБ за 20 секунд',
      'Подключение бесплатно',
    ],
    options: [
      { name: 'Wi-Fi роутер SNR-CPE-ME2', price: 99 },
      { name: 'ТВ приставка Imaqliq G-Box', price: 99 },
    ],
  },
];

// TV channels info
export const tvChannels = {
  total: 191,
  hd: 23,
  uhd4k: 2,
  categories: [
    { name: 'Развлекательные', count: 42 },
    { name: 'Кино', count: 31 },
    { name: 'Познавательные', count: 38 },
    { name: 'Спорт', count: 15 },
    { name: 'Детские', count: 13 },
    { name: 'Музыка', count: 16 },
    { name: 'Новости', count: 14 },
  ],
};
