import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface AntiInflammatoryGuidePDFProps {}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSans',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#8B7FD6',
  },
  title: {
    fontFamily: 'NotoSans',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3D4461',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'NotoSans',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: 'NotoSans',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B7FD6',
    marginBottom: 12,
    marginTop: 20,
  },
  subsectionTitle: {
    fontFamily: 'NotoSans',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D4461',
    marginBottom: 8,
    marginTop: 15,
  },
  bodyText: {
    fontFamily: 'NotoSans',
    fontSize: 11,
    color: '#3D4461',
    marginBottom: 10,
    lineHeight: 1.6,
  },
  bulletPoint: {
    fontFamily: 'NotoSans',
    fontSize: 11,
    color: '#3D4461',
    marginBottom: 6,
    marginLeft: 15,
    lineHeight: 1.6,
  },
  highlightBox: {
    backgroundColor: '#F5F3FF',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    border: '1px solid #E8E5F2',
  },
  highlightText: {
    fontFamily: 'NotoSans',
    fontSize: 10,
    color: '#3D4461',
    lineHeight: 1.5,
  },
  bold: {
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#6B7280',
    fontFamily: 'NotoSans',
  },
})

export const AntiInflammatoryGuidePDF: React.FC<AntiInflammatoryGuidePDFProps> = () => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Противовоспалительное питание</Text>
          <Text style={styles.subtitle}>Научно обоснованный гайд для женщин</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bodyText}>
            Этот гайд основан на последних научных исследованиях (2020-2025 годы) из ведущих медицинских журналов. 
            Здесь вы найдете практические рекомендации, которые помогут снизить хроническое воспаление в организме через питание.
          </Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              <Text style={styles.bold}>Важно:</Text> Этот гайд не заменяет консультацию врача. 
              При любых заболеваниях обязательно проконсультируйтесь со специалистом.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Глава 1: Почему воспаление — это важно</Text>
          
          <Text style={styles.subsectionTitle}>Что такое хроническое воспаление?</Text>
          <Text style={styles.bodyText}>
            Воспаление — это защитная реакция организма. Когда вы порезали палец, покраснение и отек вокруг раны — 
            это острое воспаление, которое помогает заживлению. Но существует и другой тип — хроническое воспаление.
          </Text>
          <Text style={styles.bodyText}>
            Хроническое воспаление — это когда иммунная система постоянно находится в состоянии «боевой готовности», 
            даже когда нет явной угрозы. Это как сигнализация, которая не выключается. Со временем это наносит вред вашему организму.
          </Text>

          <Text style={styles.subsectionTitle}>С какими состояниями связано хроническое воспаление?</Text>
          <Text style={styles.bulletPoint}>• Сердечно-сосудистые заболевания — атеросклероз, инфаркт, инсульт</Text>
          <Text style={styles.bulletPoint}>• Диабет 2 типа и метаболический синдром</Text>
          <Text style={styles.bulletPoint}>• Аутоиммунные заболевания — ревматоидный артрит, воспалительные заболевания кишечника</Text>
          <Text style={styles.bulletPoint}>• Онкологические заболевания — некоторые виды рака</Text>
          <Text style={styles.bulletPoint}>• Нейродегенеративные заболевания — болезнь Альцгеймера, болезнь Паркинсона</Text>
          <Text style={styles.bulletPoint}>• Ожирение и жировая болезнь печени</Text>
          <Text style={styles.bulletPoint}>• Депрессия и тревожность</Text>
          <Text style={styles.bulletPoint}>• Хроническая боль</Text>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Глава 2: Средиземноморская диета — золотой стандарт</Text>
          
          <Text style={styles.bodyText}>
            Средиземноморская диета — это самый изученный противовоспалительный тип питания. 
            Мета-анализ 2024 года (33 рандомизированных контролируемых исследования, 3,476 участников) показал:
          </Text>
          <Text style={styles.bulletPoint}>• Значительное снижение высокочувствительного СРБ (hs-CRP)</Text>
          <Text style={styles.bulletPoint}>• Снижение интерлейкина-6 (IL-6)</Text>
          <Text style={styles.bulletPoint}>• Снижение интерлейкина-17 (IL-17)</Text>

          <Text style={styles.subsectionTitle}>Что входит в средиземноморскую диету?</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Основа рациона (каждый день):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Овощи — минимум 2-3 порции</Text>
          <Text style={styles.bulletPoint}>• Фрукты — 2-3 порции</Text>
          <Text style={styles.bulletPoint}>• Цельнозерновые продукты — хлеб, паста, крупы</Text>
          <Text style={styles.bulletPoint}>• Оливковое масло extra virgin — 3-4 столовые ложки</Text>
          <Text style={styles.bulletPoint}>• Орехи — горсть (30 г)</Text>
          <Text style={styles.bulletPoint}>• Бобовые — фасоль, чечевица, нут</Text>
          <Text style={styles.bulletPoint}>• Семена, травы и специи</Text>

          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Регулярно (несколько раз в неделю):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Рыба и морепродукты — 2-3 раза в неделю</Text>
          <Text style={styles.bulletPoint}>• Птица — 2 раза в неделю</Text>
          <Text style={styles.bulletPoint}>• Яйца — 2-4 в неделю</Text>
          <Text style={styles.bulletPoint}>• Молочные продукты — йогурт, сыр (умеренно)</Text>

          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Редко:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Красное мясо — не чаще 1 раза в неделю</Text>
          <Text style={styles.bulletPoint}>• Сладости — по особым случаям</Text>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Глава 3: Омега-3 жирные кислоты</Text>
          
          <Text style={styles.bodyText}>
            Омега-3 — это особый тип полиненасыщенных жирных кислот. Два самых важных: EPA (эйкозапентаеновая кислота) 
            и DHA (докозагексаеновая кислота). Они называются «незаменимыми», потому что наш организм не может их вырабатывать — 
            мы должны получать их с пищей.
          </Text>

          <Text style={styles.subsectionTitle}>Источники омега-3</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Жирная рыба (лучший источник EPA и DHA):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Лосось (дикий) — 2,260 мг на 100 г</Text>
          <Text style={styles.bulletPoint}>• Скумбрия — 2,670 мг на 100 г</Text>
          <Text style={styles.bulletPoint}>• Сельдь — 2,150 мг на 100 г</Text>
          <Text style={styles.bulletPoint}>• Сардины — 1,480 мг на 100 г</Text>
          <Text style={styles.bulletPoint}>• Форель — 1,068 мг на 100 г</Text>

          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Растительные источники (содержат ALA):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Семена льна — 6,388 мг на столовую ложку</Text>
          <Text style={styles.bulletPoint}>• Семена чиа — 4,915 мг на столовую ложку</Text>
          <Text style={styles.bulletPoint}>• Грецкие орехи — 2,542 мг на 30 г</Text>

          <Text style={styles.subsectionTitle}>Практические рекомендации</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Для профилактики:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Ешьте жирную рыбу 2-3 раза в неделю (по 100-150 г)</Text>
          <Text style={styles.bulletPoint}>• Это даст вам примерно 1,500-2,000 мг EPA+DHA в неделю</Text>

          <Text style={styles.bodyText}>
            <Text style={styles.bold}>При воспалительных состояниях:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Рассмотрите прием добавок омега-3 (рыбий жир или масло водорослей для вегетарианцев)</Text>
          <Text style={styles.bulletPoint}>• Терапевтическая доза: 1-3 г EPA+DHA в день</Text>
          <Text style={styles.bulletPoint}>• Обязательно проконсультируйтесь с врачом, особенно если принимаете антикоагулянты</Text>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Глава 4: Полифенолы — защитники на клеточном уровне</Text>
          
          <Text style={styles.bodyText}>
            Полифенолы — это природные соединения в растительной пище, которые придают ей цвет, вкус и защищают растения от вредителей. 
            Для нас они работают как мощные антиоксиданты и противовоспалительные агенты.
          </Text>

          <Text style={styles.subsectionTitle}>Основные источники полифенолов</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Напитки:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Зеленый чай — 320 мг/чашка</Text>
          <Text style={styles.bulletPoint}>• Черный чай — 280 мг/чашка</Text>
          <Text style={styles.bulletPoint}>• Кофе — 200-550 мг/чашка</Text>
          <Text style={styles.bulletPoint}>• Красное вино — 100-200 мг/бокал (умеренно!)</Text>

          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Ягоды (на 100 г):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Черника — 560 мг</Text>
          <Text style={styles.bulletPoint}>• Черная смородина — 758 мг</Text>
          <Text style={styles.bulletPoint}>• Клубника — 235 мг</Text>
          <Text style={styles.bulletPoint}>• Малина — 215 мг</Text>
          <Text style={styles.bulletPoint}>• Ежевика — 260 мг</Text>

          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Другие источники:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Оливковое масло extra virgin — 55 мг/столовая ложка</Text>
          <Text style={styles.bulletPoint}>• Темный шоколад (70%+ какао) — 1,664 мг/100 г</Text>
          <Text style={styles.bulletPoint}>• Специи: гвоздика, мята, орегано</Text>

          <Text style={styles.subsectionTitle}>Практические советы</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Цель:</Text> ~1,000-1,500 мг полифенолов в день
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Простые привычки:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Пейте зеленый или черный чай вместо воды иногда</Text>
          <Text style={styles.bulletPoint}>• Добавляйте ягоды в завтраки (свежие или замороженные)</Text>
          <Text style={styles.bulletPoint}>• Перекусывайте темным шоколадом (70%+ какао)</Text>
          <Text style={styles.bulletPoint}>• Используйте оливковое масло extra virgin для салатов</Text>
          <Text style={styles.bulletPoint}>• Добавляйте специи в блюда (куркума, орегано, мята)</Text>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Глава 5: Куркумин — древняя специя с современными доказательствами</Text>
          
          <Text style={styles.bodyText}>
            Куркумин — это активное вещество в куркуме (желтой специи, которую используют в карри). 
            В традиционной индийской и китайской медицине куркума использовалась тысячи лет, а современная наука подтверждает 
            ее противовоспалительные свойства.
          </Text>

          <Text style={styles.subsectionTitle}>Что показывают исследования?</Text>
          <Text style={styles.bodyText}>
            Комплексный мета-анализ 2024 года (103 рандомизированных контролируемых исследования) показал:
          </Text>
          <Text style={styles.bulletPoint}>• СРБ: 7 из 10 мета-анализов показали значительное снижение</Text>
          <Text style={styles.bulletPoint}>• IL-6: 5 из 8 мета-анализов показали значительное снижение</Text>
          <Text style={styles.bulletPoint}>• TNF-α: 6 из 9 мета-анализов показали значительное снижение</Text>

          <Text style={styles.bodyText}>
            Новый мета-анализ 2025 года показал, что куркумин эффективен при ревматоидном артрите и системной красной волчанке. 
            Эффективность сопоставима с ибупрофеном и диклофенаком, но НЕ имеет обычных побочных эффектов НПВС.
          </Text>

          <Text style={styles.subsectionTitle}>Проблема биодоступности</Text>
          <Text style={styles.bodyText}>
            Главная проблема куркумина: он плохо усваивается в кишечнике. Большая часть просто проходит транзитом и выводится.
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Решения:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Черный перец (пиперин) — увеличивает усвоение куркумина в 20 раз</Text>
          <Text style={styles.bulletPoint}>• Нано-куркумин — частицы уменьшены до наноразмера</Text>
          <Text style={styles.bulletPoint}>• Теракурмин (Theracurmin) — специальная форма с улучшенной растворимостью</Text>
          <Text style={styles.bulletPoint}>• Фитосомный куркумин (Meriva) — куркумин связан с фосфолипидами</Text>

          <Text style={styles.subsectionTitle}>Практические рекомендации</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Для профилактики:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Используйте куркуму в готовке: добавляйте в супы, рагу, карри</Text>
          <Text style={styles.bulletPoint}>• Всегда добавляйте черный перец и немного жира (оливковое масло, кокосовое масло)</Text>
          <Text style={styles.bulletPoint}>• Делайте «золотое молоко» (куркума + молоко + черный перец + мед)</Text>

          <Text style={styles.bodyText}>
            <Text style={styles.bold}>При воспалительных состояниях:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Рассмотрите прием добавок куркумина</Text>
          <Text style={styles.bulletPoint}>• Дозировка: 500-2,000 мг куркумина в день</Text>
          <Text style={styles.bulletPoint}>• Выбирайте формулы с улучшенной биодоступностью</Text>
          <Text style={styles.bulletPoint}>• Принимайте во время еды с жирами</Text>
          <Text style={styles.bulletPoint}>• Курс: минимум 8-12 недель для эффекта</Text>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Глава 6: Продукты, которые усиливают воспаление</Text>
          
          <Text style={styles.subsectionTitle}>Красное и переработанное мясо</Text>
          <Text style={styles.bodyText}>
            Высокое содержание насыщенных жиров, арахидоновая кислота, конечные продукты гликирования (AGEs) при жарке 
            на высоких температурах делают красное мясо провоспалительным.
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Рекомендация:</Text> Ограничьте красное мясо до 1 раза в неделю. 
            Избегайте переработанного мяса или сведите к минимуму.
          </Text>

          <Text style={styles.subsectionTitle}>Рафинированные углеводы</Text>
          <Text style={styles.bodyText}>
            Белый хлеб, белый рис, белая паста, сладости имеют высокий гликемический индекс, что активирует 
            провоспалительные пути.
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Рекомендация:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Замените белый хлеб на цельнозерновой</Text>
          <Text style={styles.bulletPoint}>• Выбирайте бурый рис вместо белого</Text>
          <Text style={styles.bulletPoint}>• Ешьте цельнозерновую пасту</Text>
          <Text style={styles.bulletPoint}>• Ограничьте сахар до 25 г в день (6 чайных ложек)</Text>
          <Text style={styles.bulletPoint}>• Избегайте сладких напитков</Text>

          <Text style={styles.subsectionTitle}>Трансжиры и избыток насыщенных жиров</Text>
          <Text style={styles.bodyText}>
            Трансжиры повышают СРБ, IL-6, TNF-α. Избыток насыщенных жиров активирует провоспалительные рецепторы.
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Рекомендация:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Полностью исключите трансжиры</Text>
          <Text style={styles.bulletPoint}>• Ограничьте насыщенные жиры до 10% от калорийности</Text>
          <Text style={styles.bulletPoint}>• Замените на ненасыщенные жиры: оливковое масло, авокадо, орехи, рыбий жир</Text>

          <Text style={styles.subsectionTitle}>Ультраобработанные продукты</Text>
          <Text style={styles.bodyText}>
            Готовые блюда в упаковках, снеки, сладкие хлопья содержат комбинацию рафинированных углеводов, 
            трансжиров, соли, добавок и имеют низкое содержание клетчатки, витаминов, антиоксидантов.
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Рекомендация:</Text> Основывайте рацион на цельных, необработанных продуктах. 
            Готовьте дома. Читайте этикетки: если ингредиентов {'>'}5 и вы не знаете, что это такое, — избегайте.
          </Text>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Глава 7: Практическое руководство — Как начать</Text>
          
          <Text style={styles.subsectionTitle}>Шаг 1: Оцените текущее питание</Text>
          <Text style={styles.bodyText}>
            Ведите пищевой дневник 3-7 дней. Записывайте все, что едите и пьете.
          </Text>

          <Text style={styles.subsectionTitle}>Шаг 2: Начните с малого</Text>
          <Text style={styles.bodyText}>
            НЕ пытайтесь изменить все сразу. Выберите 1-2 изменения на первые 2 недели:
          </Text>
          <Text style={styles.bulletPoint}>• Замените завтрак на овсянку с ягодами и орехами</Text>
          <Text style={styles.bulletPoint}>• Добавьте 1 порцию овощей к обеду</Text>
          <Text style={styles.bulletPoint}>• Замените один перекус в день на горсть орехов</Text>
          <Text style={styles.bulletPoint}>• Пейте зеленый чай вместо кофе 1-2 раза в день</Text>
          <Text style={styles.bulletPoint}>• Используйте оливковое масло вместо сливочного для салатов</Text>

          <Text style={styles.subsectionTitle}>Шаг 3: Добавляйте, а не убирайте</Text>
          <Text style={styles.bodyText}>
            Вместо того чтобы концентрироваться на том, что нельзя есть, сосредоточьтесь на добавлении полезных продуктов. 
            Когда вы добавляете полезные продукты, вредные автоматически вытесняются.
          </Text>

          <Text style={styles.subsectionTitle}>Шаг 4: Планируйте питание</Text>
          <Text style={styles.bodyText}>
            Составьте план на неделю. Составьте список перед походом в магазин. Покупайте по списку. 
            Не ходите в магазин голодной.
          </Text>

          <Text style={styles.subsectionTitle}>Шаг 5: Готовьте дома</Text>
          <Text style={styles.bodyText}>
            Контроль ингредиентов, меньше соли, сахара, вредных жиров, больше полезных продуктов. 
            Простые блюда: запеченная рыба + овощи на пару = 20 минут.
          </Text>

          <Text style={styles.subsectionTitle}>Принцип 80/20</Text>
          <Text style={styles.bodyText}>
            80% времени питайтесь противовоспалительно, 20% времени позволяйте себе отступления. 
            Избегайте перфекционизма: один «неправильный» прием пищи не разрушит ваш прогресс.
          </Text>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Заключение: Ваше путешествие к здоровью</Text>
          
          <Text style={styles.bodyText}>
            Противовоспалительное питание — это не временная диета, а образ жизни. 
            Это инвестиция в ваше долгосрочное здоровье и качество жизни.
          </Text>

          <Text style={styles.subsectionTitle}>Что вы можете сделать уже сегодня</Text>
          <Text style={styles.bulletPoint}>• Добавьте овощи к обеду или ужину</Text>
          <Text style={styles.bulletPoint}>• Замените перекус на горсть орехов</Text>
          <Text style={styles.bulletPoint}>• Приготовьте зеленый чай вместо кофе</Text>
          <Text style={styles.bulletPoint}>• Используйте оливковое масло для салата</Text>

          <Text style={styles.subsectionTitle}>Помните</Text>
          <Text style={styles.bulletPoint}>• Маленькие шаги ведут к большим результатам</Text>
          <Text style={styles.bulletPoint}>• Прогресс, а не перфекционизм — ваша цель</Text>
          <Text style={styles.bulletPoint}>• Питание — только одна часть (сон, движение, стресс тоже важны)</Text>
          <Text style={styles.bulletPoint}>• Вы не одиноки — миллионы людей выбирают противовоспалительное питание</Text>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              <Text style={styles.bold}>Важное напоминание:</Text> Этот гайд предназначен для образовательных целей 
              и не заменяет медицинскую консультацию. Всегда консультируйтесь с врачом или дипломированным диетологом 
              перед значительными изменениями в питании, особенно если у вас есть хронические заболевания или вы принимаете лекарства.
            </Text>
          </View>

          <Text style={[styles.bodyText, { marginTop: 30, fontSize: 10, color: '#6B7280' }]}>
            Этот гайд основан на научных исследованиях из следующих журналов: Frontiers in Nutrition, 
            British Journal of Nutrition, Nutrients (MDPI), Cytokine, Inflammopharmacology, Frontiers in Immunology, 
            Nature Scientific Reports, Cochrane Database.
          </Text>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  )
}

