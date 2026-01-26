// Справочные диапазоны для биомаркеров PhenoAge
// Источник: стандартные референсные значения для лабораторных анализов

export interface ReferenceRange {
  name: string
  unit: string
  min: number
  max: number
}

export const referenceRanges: Record<string, ReferenceRange> = {
  age: {
    name: 'Возраст',
    unit: 'лет',
    min: 20,
    max: 100,
  },
  albumin: {
    name: 'Альбумин',
    unit: 'г/дл',
    min: 3.5,
    max: 5.5,
  },
  creatinine: {
    name: 'Креатинин',
    unit: 'мг/дл',
    min: 0.6,
    max: 1.2,
  },
  glucose: {
    name: 'Глюкоза натощак',
    unit: 'мг/дл',
    min: 70,
    max: 100,
  },
  crp: {
    name: 'C-реактивный белок',
    unit: 'мг/л',
    min: 0,
    max: 3,
  },
  lymph: {
    name: 'Лимфоциты',
    unit: '%',
    min: 20,
    max: 40,
  },
  mcv: {
    name: 'Средний объем эритроцитов',
    unit: 'фл',
    min: 80,
    max: 100,
  },
  rdw: {
    name: 'Ширина распределения эритроцитов',
    unit: '%',
    min: 11.5,
    max: 14.5,
  },
  alkphos: {
    name: 'Щелочная фосфатаза',
    unit: 'Ед/л',
    min: 30,
    max: 120,
  },
  wbc: {
    name: 'Лейкоциты',
    unit: '×10⁹/л',
    min: 4,
    max: 11,
  },
}

