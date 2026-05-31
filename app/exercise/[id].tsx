import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateRecord } from '../../store/userSlice';
import { saveRecords } from '../../utils/database';
import { useThemeColor } from '../../hooks/use-theme-color';

const exerciseData = {
  bench: {
    title: 'Жим лежачи',
    image: require('./benchpress.png'),
    auxiliaryExercises: [
      { id: 'bench-narrow', name: 'Жим лежачи вузьким хватом' },
      { id: 'bench-dumbbells', name: 'Жим гантелей лежачи на лаві' },
      { id: 'dips', name: 'Віджимання на брусах' },
      { id: 'seated-press', name: 'Жим сидячи' },
      { id: 'triceps-extension', name: 'Розгинання на трицепс' },
      { id: 'butterfly', name: 'Бабочка' },
    ]
  },
  squat: {
    title: 'Присяд зі штангою',
    image: require('./squat.png'),
    auxiliaryExercises: [
      { id: 'box-squat', name: 'Присідання на тумбу' },
      { id: 'leg-press', name: 'Жим ногами' },
      { id: 'dumbbell-lunges', name: 'Випади з гантелями' },
      { id: 'good-mornings', name: 'Нахили зі штангою' },
      { id: 'cable-pull', name: 'Тяга блока' },
    ]
  },
  deadlift: {
    title: 'Станова тяга',
    image: require('./deadlift.png'),
    auxiliaryExercises: [
      { id: 'romanian-deadlift', name: 'Румунська тяга (задня поверхня стегна/сідниці)' },
      { id: 'deficit-deadlift', name: 'Тяга з ями (зрив)' },
      { id: 'hyperextension', name: 'Гіперекстензія (розгиначі спини)' },
      { id: 'bent-over-row', name: 'Тяга в нахилі (найширші)' },
    ]
  }
};

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();

  const data = exerciseData[id as keyof typeof exerciseData];
  const records = useSelector((state: any) => state.user.records);
  const currentRecord = records ? records[id as string] : 0;

  const [newValue, setNewValue] = useState(currentRecord ? currentRecord.toString() : '');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBgColor = useThemeColor({ light: '#fff', dark: '#222' }, 'background');
  const subTextColor = useThemeColor({ light: '#666', dark: '#aaa' }, 'text');
  const buttonBgColor = useThemeColor({ light: '#f8f9fa', dark: '#333' }, 'background');
  const borderColor = useThemeColor({ light: '#e9ecef', dark: '#444' }, 'background');

  if (!data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Text style={{ color: textColor }}>Вправу не знайдено</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={{ color: textColor }}>Назад</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const user = useSelector((state: any) => state.user);

  const handleSave = async () => {
    const val = parseFloat(newValue);
    if (!isNaN(val) && val >= 0) {
      dispatch(updateRecord({ exercise: id, value: val }));
      
      if (user.email) {
        const updatedRecords = { ...records, [id]: val };
        await saveRecords(
          user.email,
          updatedRecords.bench || 0,
          updatedRecords.squat || 0,
          updatedRecords.deadlift || 0
        );
      }
      
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { backgroundColor }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>{data.title}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>

          <View style={styles.iconContainer}>
            <Image source={data.image} style={{ width: 120, height: 120, resizeMode: 'contain' }} />
          </View>

          <View style={[styles.card, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.cardTitle, { color: subTextColor }]}>Ваш рекорд (кг)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                value={newValue}
                onChangeText={setNewValue}
                placeholder="0"
                placeholderTextColor={subTextColor}
                maxLength={4}
              />
              <Text style={[styles.kgText, { color: subTextColor }]}>кг</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Зберегти результат</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.tipsContainer, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.tipsTitle, { color: textColor }]}>Вправи для покращення рекорду:</Text>
            {data.auxiliaryExercises.map((exercise: any) => (
              <TouchableOpacity 
                key={exercise.id} 
                style={[styles.exerciseButton, { backgroundColor: buttonBgColor, borderColor }]}
                onPress={() => router.push(`/auxiliary/${exercise.id}`)}
              >
                <Text style={[styles.exerciseButtonText, { color: textColor }]}>{exercise.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#007bff" />
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  card: {
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 25,
  },
  input: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 100,
    borderBottomWidth: 2,
    paddingBottom: 5,
  },
  kgText: {
    fontSize: 24,
    marginLeft: 10,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsContainer: {
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  exerciseButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  exerciseButtonText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    paddingRight: 10,
  },
});
