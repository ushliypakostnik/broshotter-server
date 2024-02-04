// Utils
import Helper from '../../utils/helper';

const getRandomGround = () => {
  const groundType = Helper.randomInteger(1, 3);
  const groundNumber = Helper.randomInteger(1, 4);

  let string;
  switch (groundType) {
    case 1:
      string = 'soil';
      break;
    case 2:
      string = 'grass';
      break;
    case 3:
    default:
      string = 'sand';
      break;
  }

  return string + groundNumber;
};

export const defaultLocation = {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: getRandomGround(),
  };

// Внимание!!! Y/X !!!
export const MAP = {
  '-3/-3': {
    name: {
      ru: 'Командный пункт Выживших',
      en: 'Survivor Command Post',
    },
    ground: 'sand1',
  },
  '-3/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand1',
  },
  '-3/-1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand1',
  },
  '-3/0': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil1',
  },
  '-3/1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil1',
  },
  '-3/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil1',
  },
  '-3/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil2',
  },
  '-2/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand1',
  },
  '-2/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand1',
  },
  '-2/-1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand1',
  },
  '-2/0': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil1',
  },
  '-2/1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil1',
  },
  '-2/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil2',
  },
  '-2/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil2',
  },
  '-1/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand2',
  },
  '-1/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand2',
  },
  '-1/-1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'grass1',
  },
  '-1/0': {
    name: {
      ru: 'Пригород',
      en: 'Suburb',
    },
    ground: 'grass1',
  },
  '-1/1': {
    name: {
      ru: 'Пригород',
      en: 'Suburb',
    },
    ground: 'grass2',
  },
  '-1/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil2',
  },
  '-1/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil2',
  },
  '0/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand2',
  },
  '0/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand2',
  },
  '0/-1': {
    name: {
      ru: 'Пригород',
      en: 'Suburb',
    },
    ground: 'grass4',
  },
  '0/0': {
    name: {
      ru: 'Город',
      en: 'City',
    },
    ground: 'asphalt',
  },
  '0/1': {
    name: {
      ru: 'Пригород',
      en: 'Suburb',
    },
    ground: 'grass2',
  },
  '0/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil3',
  },
  '0/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil3',
  },
  '1/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '1/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '1/-1': {
    name: {
      ru: 'Пригород',
      en: 'Suburb',
    },
    ground: 'grass4',
  },
  '1/0': {
    name: {
      ru: 'Пригород',
      en: 'Suburb',
    },
    ground: 'grass3',
  },
  '1/1': {
    name: {
      ru: 'Пригород',
      en: 'Suburb',
    },
    ground: 'grass3',
  },
  '1/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '1/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '2/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '2/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '2/-1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand4',
  },
  '2/0': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand4',
  },
  '2/1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil4',
  },
  '2/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil4',
  },
  '2/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil3',
  },
  '3/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '3/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand4',
  },
  '3/-1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand4',
  },
  '3/0': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand4',
  },
  '3/1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil4',
  },
  '3/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil4',
  },
  '3/3': {
    name: {
      ru: 'Командный пункт Рептилов',
      en: 'Reptilian command post',
    },
    ground: 'soil4',
  },
};
