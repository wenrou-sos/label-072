import type { Field } from '../types';

export const mockFields: Field[] = [
  {
    id: 'f1',
    name: '东一号地块',
    area: 150,
    cropType: '小麦',
    workType: 'harvesting',
    coordinates: [
      [39.91, 116.395],
      [39.915, 116.402],
      [39.908, 116.408],
      [39.903, 116.40],
    ],
  },
  {
    id: 'f2',
    name: '西二号地块',
    area: 120,
    cropType: '玉米',
    workType: 'management',
    coordinates: [
      [39.90, 116.375],
      [39.908, 116.382],
      [39.902, 116.39],
      [39.894, 116.383],
    ],
  },
  {
    id: 'f3',
    name: '南三号地块',
    area: 200,
    cropType: '水稻',
    workType: 'plowing',
    coordinates: [
      [39.892, 116.405],
      [39.90, 116.415],
      [39.893, 116.422],
      [39.885, 116.412],
    ],
  },
  {
    id: 'f4',
    name: '北四号地块',
    area: 180,
    cropType: '大豆',
    workType: 'seeding',
    coordinates: [
      [39.918, 116.388],
      [39.925, 116.395],
      [39.92, 116.405],
      [39.913, 116.398],
    ],
  },
  {
    id: 'f5',
    name: '中央五号地块',
    area: 90,
    cropType: '花生',
    workType: 'management',
    coordinates: [
      [39.906, 116.392],
      [39.91, 116.398],
      [39.904, 116.402],
      [39.9, 116.396],
    ],
  },
  {
    id: 'f6',
    name: '东六号地块',
    area: 160,
    cropType: '小麦',
    workType: undefined,
    coordinates: [
      [39.912, 116.408],
      [39.92, 116.415],
      [39.913, 116.425],
      [39.905, 116.418],
    ],
  },
];
