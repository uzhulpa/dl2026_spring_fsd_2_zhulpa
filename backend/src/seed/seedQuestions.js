import bcrypt from 'bcryptjs';

import { User, Question } from '../models/index.js';

const SEED_AUTHOR_EMAIL = 'uzh0976@gmail.com';
const SEED_AUTHOR_USERNAME = 'admin';

const QUESTION_SEEDS = [
  {
    title: 'Где находится Эйфелева башня?',
    description: null,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Small_copy_of_Eiffel_Tower.jpg',
    correct_longitude: 2.2945,
    correct_latitude: 48.8584,
    question_type: 'point_with_radius',
    radius_meters: 500,
    difficulty: 3
  },
  {
    title: 'Где находится Красная площадь в Москве?',
    description: null,
    image_url: 'https://upload.wikimedia.org/wikipedia/ru/thumb/d/d3/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%B0%D1%8F_%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D1%8C%2C_%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9_%D0%BC%D1%83%D0%B7%D0%B5%D0%B9.jpg/960px-%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%B0%D1%8F_%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D1%8C%2C_%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9_%D0%BC%D1%83%D0%B7%D0%B5%D0%B9.jpg',
    correct_longitude: 37.6213,
    correct_latitude: 55.7539,
    question_type: 'point_with_radius',
    radius_meters: 400,
    difficulty: 4
  },
  {
    title: 'Где находится Колизей в Риме?',
    description: null,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg',
    correct_longitude: 12.4924,
    correct_latitude: 41.8903,
    question_type: 'point',
    radius_meters: null,
    difficulty: 5
  },
  {
    title: 'Где находится Статуя Свободы?',
    description: null,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/330px-Statue_of_Liberty_7.jpg',
    correct_longitude: -74.0445,
    correct_latitude: 40.6892,
    question_type: 'point_with_radius',
    radius_meters: 600,
    difficulty: 3
  },
  {
    title: 'Где находится Биг-Бен (Елизаветинская башня)?',
    description: null,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/London%2C_Elizabeth_Tower_--_2016_--_4807.jpg',
    correct_longitude: -0.1246,
    correct_latitude: 51.5007,
    question_type: 'point',
    radius_meters: null,
    difficulty: 4
  },
  {
    title: "Где находится Тадж-Махал?",
    description: "Тадж-Махал — мавзолей-мечеть в Агре, построенный императором Шах-Джаханом в память о его жене Мумтаз-Махал.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/330px-Taj_Mahal_%28Edited%29.jpeg",
    correct_longitude: 78.0421,
    correct_latitude: 27.1751,
    question_type: "point_with_radius",
    radius_meters: 400,
    difficulty: 4
  },
  {
    title: "Где находится Пизанская башня?",
    description: "Пизанская башня — колокольня собора Санта-Мария-Ассунта в Пизе, известная своим наклоном из-за слабого грунта.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Leaning_Tower_of_Pisa_in_the_1890s.jpg/250px-Leaning_Tower_of_Pisa_in_the_1890s.jpg",
    correct_longitude: 10.3966,
    correct_latitude: 43.7228,
    question_type: "point",
    radius_meters: null,
    difficulty: 3
  },
  {
    title: "Где находится Сиднейский оперный театр?",
    description: "Сиднейский оперный театр — одно из самых узнаваемых зданий мира, символ Австралии, открытое в 1973 году.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Sydneyoperahouse_at_night.jpg",
    correct_longitude: 151.2153,
    correct_latitude: -33.8568,
    question_type: "point_with_radius",
    radius_meters: 500,
    difficulty: 5
  },
  {
    title: "Где находится Стоунхендж?",
    description: "Стоунхендж — мегалитическое сооружение в Англии, построенное около 2500 года до н.э., возможно как древняя обсерватория или храм.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Stonehenge2007_07_30.jpg",
    correct_longitude: -1.8262,
    correct_latitude: 51.1789,
    question_type: "point",
    radius_meters: null,
    difficulty: 5
  },
  {
    title: "Где находится Храм Василия Блаженного?",
    description: "Храм Василия Блаженного — православный храм на Красной площади в Москве, построенный по приказу Ивана Грозного в 1561 году.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/1/18/Saint_Basil%27s_Cathedral_in_Moscow.jpg",
    correct_longitude: 37.6231,
    correct_latitude: 55.7525,
    question_type: "point_with_radius",
    radius_meters: 300,
    difficulty: 4
  },
  {
    title: "Где находится Ангкор-Ват?",
    description: "Ангкор-Ват — крупнейший в мире храмовый комплекс в Камбодже, построенный в XII веке как индуистский храм, позже ставший буддийским.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Angkor_Wat_W-Seite.jpg",
    correct_longitude: 103.8660,
    correct_latitude: 13.4125,
    question_type: "point",
    radius_meters: null,
    difficulty: 6
  },
  {
    title: "Где находится Бранденбургские ворота?",
    description: "Бранденбургские ворота — главный символ Берлина и всей Германии, построенные в 1791 году.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Potsdam_Brandenburger_Tor_asv2023-07.jpg",
    correct_longitude: 13.3777,
    correct_latitude: 52.5163,
    question_type: "point",
    radius_meters: null,
    difficulty: 3
  },
  {
    title: "Где находится Мост Золотые Ворота в Сан-Франциско?",
    description: "Мост Золотые Ворота — висячий мост через пролив Золотые Ворота, символ Сан-Франциско и Калифорнии, открыт в 1937 году.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Golden_Gate_Bridge_as_seen_from_Battery_East.jpg",
    correct_longitude: -122.4783,
    correct_latitude: 37.8199,
    question_type: "point_with_radius",
    radius_meters: 800,
    difficulty: 4
  },
  {
    title: "Где находится Мачу-Пикчу?",
    description: "Мачу-Пикчу — древний город инков в Перу, расположенный на вершине горного хребта на высоте 2430 метров.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/80_-_Machu_Picchu_-_Juin_2009_-_edit.jpg/1280px-80_-_Machu_Picchu_-_Juin_2009_-_edit.jpg",
    correct_longitude: -72.5450,
    correct_latitude: -13.1631,
    question_type: "point",
    radius_meters: null,
    difficulty: 6
  },
  {
    title: "Где находится Ниагарский водопад?",
    description: "Ниагарский водопад — комплекс водопадов на границе США и Канады, один из самых мощных в Северной Америке.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/3Falls_Niagara.jpg",
    correct_longitude: -79.0751,
    correct_latitude: 43.0828,
    question_type: "point_with_radius",
    radius_meters: 1000,
    difficulty: 3
  },
  {
  title: "Где находится озеро Байкал?",
  description: "Байкал — самое глубокое озеро в мире, расположенное в Восточной Сибири. Его возраст около 25-35 миллионов лет.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/%D0%9C%D1%8B%D1%81_%D0%9B%D1%83%D0%B4%D0%B0%D1%80%D1%8C%2C_17_%D0%B8%D1%8E%D0%BD%D1%8F_2013_%D0%B3%D0%BE%D0%B4%D0%B0.jpg/330px-%D0%9C%D1%8B%D1%81_%D0%9B%D1%83%D0%B4%D0%B0%D1%80%D1%8C%2C_17_%D0%B8%D1%8E%D0%BD%D1%8F_2013_%D0%B3%D0%BE%D0%B4%D0%B0.jpg",
  correct_longitude: 104.3000,
  correct_latitude: 53.5000,
  question_type: "point_with_radius",
  radius_meters: 50000,
  difficulty: 4
},
{
  title: "Где находится Эверест (Джомолунгма)?",
  description: "Эверест — высочайшая вершина Земли (8848 м), расположенная в Гималаях на границе Непала и Тибета.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Everest_kalapatthar.jpg",
  correct_longitude: 86.9226,
  correct_latitude: 27.9881,
  question_type: "point_with_radius",
  radius_meters: 10000,
  difficulty: 5
},
{
  title: "Где находится Великая Китайская стена?",
  description: "Великая Китайская стена — серия укреплений длиной более 21000 км, строившаяся с III века до н.э. для защиты от кочевников.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Gran_Muralla_Xinesa.jpg/1280px-Gran_Muralla_Xinesa.jpg",
  correct_longitude: 116.2700,
  correct_latitude: 40.4300,
  question_type: "point_with_radius",
  radius_meters: 5000,
  difficulty: 4
},
{
  title: "Где находится Петра (древний город в Иордании)?",
  description: "Петра — древний город, высеченный в скалах, столица Набатейского царства. Известен благодаря храму Эль-Хазне.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Gravkammare_2.jpg",
  correct_longitude: 35.4444,
  correct_latitude: 30.3285,
  question_type: "point",
  radius_meters: null,
  difficulty: 5
},
{
  title: "Где находится Фудзияма?",
  description: "Фудзияма — действующий вулкан и высочайшая вершина Японии (3776 м), священное место и популярный туристический объект.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/c/c3/FujiWestView2157.jpg",
  correct_longitude: 138.7278,
  correct_latitude: 35.3606,
  question_type: "point_with_radius",
  radius_meters: 8000,
  difficulty: 4
},
{
  title: "Где находится Венеция?",
  description: "Венеция — город на воде в северной Италии, построенный на 118 островах, разделённых каналами и соединённых мостами.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Venice_Old_Town_Lagoon_Aerial_View.jpg?utm_source=ru.wikiquote.org&utm_campaign=index&utm_content=original",
  correct_longitude: 12.3155,
  correct_latitude: 45.4408,
  question_type: "point_with_radius",
  radius_meters: 5000,
  difficulty: 3
},
{
  title: "Где находится Кремль в Москве?",
  description: "Московский Кремль — древнейшая часть Москвы, главный общественно-политический и историко-художественный комплекс города.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/DSC07437-%D0%9C%D0%BE%D1%81%D0%BA%D0%BE%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D0%9A%D1%80%D0%B5%D0%BC%D0%BB%D1%8C.jpg/330px-DSC07437-%D0%9C%D0%BE%D1%81%D0%BA%D0%BE%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D0%9A%D1%80%D0%B5%D0%BC%D0%BB%D1%8C.jpg",
  correct_longitude: 37.6176,
  correct_latitude: 55.7520,
  question_type: "point",
  radius_meters: null,
  difficulty: 3
},
{
  title: "Где находится Акрополь в Афинах?",
  description: "Афинский Акрополь — древняя крепость на скале, главный архитектурный ансамбль Древней Греции, включающий Парфенон.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Attica_06-13_Athens_50_View_from_Philopappos_-_Acropolis_Hill.jpg",
  correct_longitude: 23.7260,
  correct_latitude: 37.9715,
  question_type: "point_with_radius",
  radius_meters: 300,
  difficulty: 4
},
{
  title: "Где находится Мёртвое море?",
  description: "Мёртвое море — солёное озеро между Израилем и Иорданией, самая низкая точка земной поверхности (430 м ниже уровня моря).",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/2/21/Dead_Sea_by_David_Shankbone.jpg",
  correct_longitude: 35.5000,
  correct_latitude: 31.5000,
  question_type: "point_with_radius",
  radius_meters: 15000,
  difficulty: 3
},
{
  title: "Где находится Йосемитский национальный парк?",
  description: "Йосемити — национальный парк в Калифорнии, известный своими гранитными скалами, водопадами и гигантскими секвойями.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Half_Dome_with_Eastern_Yosemite_Valley_%2850MP%29.jpg",
  correct_longitude: -119.6000,
  correct_latitude: 37.7500,
  question_type: "point_with_radius",
  radius_meters: 20000,
  difficulty: 5
},
{
  title: "Где находится озеро Титикака?",
  description: "Титикака — крупнейшее озеро Южной Америки, расположенное в Андах на границе Перу и Боливии. Это самое высокогорное судоходное озеро в мире.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Lake_Titicaca_on_the_Andes_from_Bolivia.jpg",
  correct_longitude: -69.3000,
  correct_latitude: -15.8000,
  question_type: "point_with_radius",
  radius_meters: 50000,
  difficulty: 5
},
{
  title: "Где находится Диснейленд в Париже?",
  description: "Диснейленд Париж — крупнейший тематический парк развлечений в Европе, открытый в 1992 году в восточном пригороде Парижа.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Sleeping_Beauty_Castle_at_Night.jpg",
  correct_longitude: 2.7840,
  correct_latitude: 48.8738,
  question_type: "point",
  radius_meters: null,
  difficulty: 2
},
{
  title: "Где находится гора Килиманджаро?",
  description: "Килиманджаро — высочайшая вершина Африки (5895 м), потухший вулкан в Танзании, покрытый вечными снегами.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Mount_Kilimanjaro.jpg",
  correct_longitude: 37.3500,
  correct_latitude: -3.0750,
  question_type: "point_with_radius",
  radius_meters: 15000,
  difficulty: 5
},
{
  title: "Где находится Гранд-Каньон?",
  description: "Гранд-Каньон — один из глубочайших каньонов мира, прорезанный рекой Колорадо в штате Аризона, США.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/2/29/10_Grand_Canyon_Navajo_Point_viewpoint_terrace%2C_Grand_Canyon_National_Park%2C_USA_-_American_nature.jpg",
  correct_longitude: -112.2500,
  correct_latitude: 36.1000,
  question_type: "point_with_radius",
  radius_meters: 30000,
  difficulty: 4
},
{
  title: "Где находится Старый город в Иерусалиме?",
  description: "Старый город Иерусалима — исторический район, священное место для иудаизма, христианства и ислама. Здесь находятся Стена Плача, Храм Гроба Господня и Купол Скалы.",
  image_url: "https://upload.wikimedia.org/wikipedia/commons/9/99/Old_City_%28Jerusalem%29.jpg",
  correct_longitude: 35.2330,
  correct_latitude: 31.7767,
  question_type: "point_with_radius",
  radius_meters: 800,
  difficulty: 5
}
];

async function ensureSeedAuthor() {
  const password_hash = await bcrypt.hash('__seed_no_login__', 10);
  const [user] = await User.findOrCreate({
    where: { email: SEED_AUTHOR_EMAIL },
    defaults: {
      username: SEED_AUTHOR_USERNAME,
      email: SEED_AUTHOR_EMAIL,
      password_hash,
      role: 'admin'
    }
  });
  return user.id;
}

/**
 * Идемпотентно добавляет вопросы в БД (по паре title + author_id).
 * @returns {{ created: number, skipped: number, authorId: number }}
 */
async function seedQuestions() {
  const authorId = await ensureSeedAuthor();
  let created = 0;
  let skipped = 0;

  for (const row of QUESTION_SEEDS) {
    const [, wasCreated] = await Question.findOrCreate({
      where: {
        title: row.title,
        author_id: authorId
      },
      defaults: {
        title: row.title,
        description: row.description,
        image_url: row.image_url,
        correct_longitude: row.correct_longitude,
        correct_latitude: row.correct_latitude,
        question_type: row.question_type,
        radius_meters: row.radius_meters,
        difficulty: row.difficulty,
        author_id: authorId,
        status: 'active'
      }
    });
    if (wasCreated) {
      created += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(
    `[seed] questions: создано ${created}, уже было ${skipped}, author_id=${authorId}`
  );
  return { created, skipped, authorId };
}

export { seedQuestions, QUESTION_SEEDS };
