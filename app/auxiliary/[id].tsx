import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, Image } from 'react-native';

const auxiliaryData = {
  'bench-narrow': { 
    title: 'Жим лежачи вузьким хватом',
    image: require('../exercise/enges-bankdruecken.jpg'),
    description: 'Жим лежачи вузьким хватом фокусується на трицепсах та внутрішній частині грудних м\'язів. Ляжте на лаву, візьміться за гриф хватом на ширині плечей або трохи вужче, опустіть штангу до нижньої частини грудей, тримаючи лікті близько до тіла, і вижміть вагу вгору.'
  },
  'bench-dumbbells': { 
    title: 'Жим гантелей лежачи на лаві',
    image: require('../exercise/kurzhantel-bankdruecken.webp'),
    description: 'Жим гантелей лежачи є чудовою альтернативою жиму зі штангою. Ця вправа дозволяє збільшити амплітуду рухів та вирівняти м\'язовий дисбаланс, ефективно навантажуючи великий грудний м\'яз.'
  },
  'dips': { 
    title: 'Віджимання на брусах',
    image: require('../exercise/arnold-dips.gif'),
    description: 'Віджимання на брусах — базова вправа з власною вагою. Для акценту на грудні м\'язи потрібно нахилити корпус вперед і злегка розвести лікті в сторони. Чудово розвиває нижню частину грудей та трицепс.'
  },
  'seated-press': { 
    title: 'Жим сидячи',
    image: require('../exercise/multipresse-bankdruecken.jpg'),
    description: 'Жим у тренажері або тренажері Сміта забезпечує контрольовану траєкторію руху. Ідеально підходить для новачків або для безпечного виконання з великою вагою без страхувальника, ефективно опрацьовуючи грудні м\'язи.'
  },
  'triceps-extension': { title: 'Розгинання на трицепс' },
  'butterfly': { 
    title: 'Бабочка',
    image: require('../exercise/cable-crossover-liegend.gif'),
    description: 'Вправа "Метелик" на тренажері або в кросовері ізолює грудні м\'язи, забезпечуючи постійне напруження протягом всього руху. Вона допомагає "промалювати" м\'язи та покращити їх форму.'
  },
  
  'box-squat': { title: 'Присідання на тумбу' },
  'leg-press': { title: 'Жим ногами' },
  'dumbbell-lunges': { title: 'Випади з гантелями' },
  'good-mornings': { title: 'Нахили зі штангою' },
  'cable-pull': { title: 'Тяга блока' },

  'romanian-deadlift': { title: 'Румунська тяга (задня поверхня стегна/сідниці)' },
  'deficit-deadlift': { title: 'Тяга з ями (зрив)' },
  'hyperextension': { title: 'Гіперекстензія (розгиначі спини)' },
  'bent-over-row': { title: 'Тяга в нахилі (найширші)' },
};

export default function AuxiliaryExerciseScreen() {
  const { id } = useLocalSearchParams();
  const data = auxiliaryData[id as keyof typeof auxiliaryData];

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Вправу не знайдено</Text>
        <TouchableOpacity style={{ alignItems: 'center', marginTop: 20 }} onPress={() => router.back()}>
          <Text style={{ color: '#007bff' }}>Назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{data.title}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {data.image ? (
          <Image source={data.image} style={styles.exerciseImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={60} color="#ccc" />
            <Text style={styles.imagePlaceholderText}>Зображення буде додано пізніше</Text>
          </View>
        )}

        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Опис вправи</Text>
          <Text style={styles.descriptionPlaceholder}>
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
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#f5f7fa',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#eaeaea',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  exerciseImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 30,
    resizeMode: 'cover',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  contentCard: {
    backgroundColor: '#fff',
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
    color: '#333',
    marginBottom: 15,
  },
  descriptionPlaceholder: {
    fontSize: 15,
    color: '#666',
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
