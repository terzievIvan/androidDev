import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, Image } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';

const auxiliaryData = {
  'bench-narrow': { 
    title: 'Жим лежачи вузьким хватом',
    image: require('../exercise/enges-bankdruecken.gif'),
    description: 'Жим лежачи вузьким хватом фокусується на трицепсах та внутрішній частині грудних м\'язів. Ляжте на лаву, візьміться за гриф хватом на ширині плечей або трохи вужче, опустіть штангу до нижньої частини грудей, тримаючи лікті близько до тіла, і вижміть вагу вгору.'
  },
  'bench-dumbbells': { 
    title: 'Жим гантелей лежачи на лаві',
    image: require('../exercise/kurzhantel-bankdruecken-flachbank.gif'),
    description: 'Жим гантелей лежачи є чудовою альтернативою жиму зі штангою. Ця вправа дозволяє збільшити амплітуду рухів та вирівняти м\'язовий дисбаланс, ефективно навантажуючи великий грудний м\'яз.'
  },
  'dips': { 
    title: 'Віджимання на брусах',
    image: require('../exercise/arnold-dips.gif'),
    description: 'Віджимання на брусах — базова вправа з власною вагою. Для акценту на грудні м\'язи потрібно нахилити корпус вперед і злегка розвести лікті в сторони. Чудово розвиває нижню частину грудей та трицепс.'
  },
  'seated-press': { 
    title: 'Жим сидячи',
    image: require('../exercise/brustpresse.gif'),
    description: 'Жим у тренажері або тренажері Сміта забезпечує контрольовану траєкторію руху. Ідеально підходить для новачків або для безпечного виконання з великою вагою без страхувальника, ефективно опрацьовуючи грудні м\'язи.'
  },
  'triceps-extension': { 
    title: 'Розгинання на трицепс',
    image: require('../exercise/trizeps-pushdown-kabelzug-seil.gif'),
    description: 'Розгинання на трицепс у блочному тренажері - популярна ізолююча вправа. Виконується стоячи, тягнучи канат або рукоятку вниз, зосереджуючись на максимальному скороченні трицепса.'
  },
  'butterfly': { 
    title: 'Бабочка',
    image: require('../exercise/cable-crossover-liegend.gif'),
    description: 'Вправа "Метелик" на тренажері або в кросовері ізолює грудні м\'язи, забезпечуючи постійне напруження протягом всього руху. Вона допомагає "промалювати" м\'язи та покращити їх форму.'
  },
  
  'box-squat': { 
    title: 'Присідання на тумбу',
    image: require('../exercise/klassischen-langhantel-kniebeugen-mit-bank.gif'),
    description: 'Присідання на тумбу допомагають розвинути вибухову силу та відпрацювати глибину присіду. Сідаючи на тумбу, ви на мить розслабляєте м\'язи та змушені виконувати підйом за рахунок чистої сили ніг і сідниць.'
  },
  'leg-press': { 
    title: 'Жим ногами',
    image: require('../exercise/45-grad-beinpresse-mit-breiter-fussstellung.gif'),
    description: 'Жим ногами в тренажері - безпечна альтернатива присіданням, що знімає навантаження зі спини. Змінюючи постановку ніг, можна зміщувати акцент на різні ділянки стегон та сідниць.'
  },
  'dumbbell-lunges': { 
    title: 'Випади з гантелями',
    image: require('../exercise/ausfallschritte-mit-kurzhanteln.gif'),
    description: 'Випади з гантелями чудово опрацьовують квадрицепси, сідниці та м\'язи стабілізатори. Вони дозволяють збалансувати силу правої та лівої ноги, забезпечуючи більшу свободу рухів порівняно зі штангою.'
  },
  'good-mornings': { 
    title: 'Нахили зі штангою',
    image: require('../exercise/good-mornings-mit-der-langhantel.gif'),
    description: 'Нахили зі штангою на плечах активно залучають м\'язи розгиначі спини, задню поверхню стегна та сідниці. Вправа вимагає правильної техніки та прямої спини для уникнення травм.'
  },
  'cable-pull': { 
    title: 'Тяга блока',
    image: require('../exercise/latzug-breit-zur-brust.gif'),
    description: 'Тяга верхнього блоку до грудей широким хватом - базова вправа для розвитку найширших м\'язів спини. Контрольований рух дозволяє якісно відчути м\'язи спини та сформувати гарну поставу.'
  },

  'romanian-deadlift': { 
    title: 'Румунська тяга (задня поверхня стегна/сідниці)',
    image: require('../exercise/rumaenisches-kreuzheben.gif'),
    description: 'Румунська станова тяга виконується на злегка зігнутих ногах з фокусом на розтягнення задньої поверхні стегна та сідниць. На відміну від класичної, штанга не опускається повністю на підлогу.'
  },
  'deficit-deadlift': { 
    title: 'Тяга з ями (зрив)',
    description: 'Станова тяга з дефіциту (з підвищення під ногами) збільшує амплітуду руху та ускладнює початкову фазу зриву штанги. Це чудова допоміжна вправа для покращення стартової сили у класичній тязі.'
  },
  'hyperextension': { 
    title: 'Гіперекстензія (розгиначі спини)',
    image: require('../exercise/hyperextensions-auf-der-hyperextension-bank-anfaenger.gif'),
    description: 'Гіперекстензія - безпечна і ефективна вправа для зміцнення м\'язів нижньої частини спини. Вона є відмінною профілактикою травм та допомагає стабілізувати корпус при виконанні базових вправ.'
  },
  'bent-over-row': { 
    title: 'Тяга в нахилі (найширші)',
    image: require('../exercise/langhantelrudern-obergriff.gif'),
    description: 'Тяга штанги в нахилі - потужна базова вправа для нарощування маси та сили всієї спини. Використання верхнього прямого хвату сильніше залучає ромбоподібні м\'язи та задні дельти.'
  },
};

export default function AuxiliaryExerciseScreen() {
  const { id } = useLocalSearchParams();
  const data = auxiliaryData[id as keyof typeof auxiliaryData];

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBgColor = useThemeColor({ light: '#fff', dark: '#222' }, 'background');
  const subTextColor = useThemeColor({ light: '#666', dark: '#aaa' }, 'text');
  const imagePlaceholderBgColor = useThemeColor({ light: '#eaeaea', dark: '#333' }, 'background');
  const borderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'background');

  if (!data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Text style={{ textAlign: 'center', marginTop: 20, color: textColor }}>Вправу не знайдено</Text>
        <TouchableOpacity style={{ alignItems: 'center', marginTop: 20 }} onPress={() => router.back()}>
          <Text style={{ color: '#007bff' }}>Назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>{data.title}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {data.image ? (
          <Image source={data.image} style={styles.exerciseImage} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: imagePlaceholderBgColor, borderColor }]}>
            <Ionicons name="image-outline" size={60} color={subTextColor} />
            <Text style={[styles.imagePlaceholderText, { color: subTextColor }]}>Зображення буде додано пізніше</Text>
          </View>
        )}

        <View style={[styles.contentCard, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Опис вправи</Text>
          <Text style={[styles.descriptionPlaceholder, { color: subTextColor }]}>
            {data.description || `Тут буде детальний опис техніки виконання вправи "${data.title}". Цей текст тимчасовий та буде замінений у майбутньому.`}
          </Text>
        </View>

        <TouchableOpacity style={styles.youtubeButton} onPress={() => {
          const query = encodeURIComponent(data.title);
          Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
        }}>
          <Ionicons name="logo-youtube" size={24} color="#fff" />
          <Text style={styles.youtubeButtonText}>Шукати на YouTube</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  scrollContent: {
    padding: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  exerciseImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  imagePlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  contentCard: {
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  descriptionPlaceholder: {
    fontSize: 15,
    lineHeight: 24,
  },
  youtubeButton: {
    backgroundColor: '#ff0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  youtubeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
