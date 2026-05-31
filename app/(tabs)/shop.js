import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { updateRecord } from '../../store/userSlice';
import { saveRecords } from '../../utils/database';
import {
  calculateDOTS,
  calculateIPF,
  calculateIPFGL,
  calculateNewWilks,
  calculateOldWilks,
} from '../../utils/calculator';
import { useThemeColor } from '../../hooks/use-theme-color';

export default function CalculatorScreen() {
  const records = useSelector((state) => state.user.records) || { bench: 0, squat: 0, deadlift: 0, bodyWeight: 0 };
  const userEmail = useSelector((state) => state.user.email);
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('1rm'); // '1rm' or 'scores'

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [oneRepMax, setOneRepMax] = useState(null);

  const [bw, setBw] = useState('');
  
  useEffect(() => {
    if (records.bodyWeight && !bw) {
      setBw(records.bodyWeight.toString());
    }
  }, [records.bodyWeight]);
  const [liftedWeight, setLiftedWeight] = useState('');
  const [isFemale, setIsFemale] = useState(false);
  const [isKg, setIsKg] = useState(true);
  const [event, setEvent] = useState('CL'); // CL = Classic/Raw, EQ = Equipped
  const [category, setCategory] = useState('PL'); // PL = Full Meet, BN = Bench Only
  const [scores, setScores] = useState(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBgColor = useThemeColor({ light: '#fff', dark: '#222' }, 'background');
  const subTextColor = useThemeColor({ light: '#666', dark: '#aaa' }, 'text');
  const inputBgColor = useThemeColor({ light: '#f8f9fa', dark: '#333' }, 'background');
  const borderColor = useThemeColor({ light: '#e9ecef', dark: '#444' }, 'background');
  const tabBgColor = useThemeColor({ light: '#e9ecef', dark: '#333' }, 'background');
  const tabActiveBgColor = useThemeColor({ light: '#fff', dark: '#444' }, 'background');
  const headerTextColor = useThemeColor({ light: '#1a1a2e', dark: '#fff' }, 'text');

  const calculate1RM = () => {
    Keyboard.dismiss();

    const m = parseFloat(weight);
    const k = parseInt(reps, 10);

    if (isNaN(m) || isNaN(k) || m <= 0 || k <= 0) {
      setOneRepMax(null);
      return;
    }

    if (k === 1) {
      setOneRepMax(m.toFixed(1));
      return;
    }

    const epley = (m * k) / 30 + m;
    const brzycki = m * (36 / (37 - k));
    const lander = (100 * m) / (101.3 - 2.67123 * k);
    const oconner = m * (1 + 0.025 * k);
    const average1RM = (epley + brzycki + lander + oconner) / 4;

    setOneRepMax(average1RM.toFixed(1));
  };

  const calculateScores = () => {
    Keyboard.dismiss();
    const bwVal = parseFloat(bw);
    const wlVal = parseFloat(liftedWeight);

    if (isNaN(bwVal) || isNaN(wlVal) || bwVal <= 0 || wlVal <= 0) {
      setScores(null);
      return;
    }

    const weightCoeff = 0.45359237;
    const bodyWeightKg = isKg ? bwVal : bwVal * weightCoeff;
    const liftedWeightKg = isKg ? wlVal : wlVal * weightCoeff;

    if (userEmail && bwVal !== records.bodyWeight) {
      dispatch(updateRecord({ exercise: 'bodyWeight', value: bwVal }));
      saveRecords(userEmail, records.bench, records.squat, records.deadlift, bwVal);
    }

    const compType = event + category; 

    setScores({
      dots: calculateDOTS(bodyWeightKg, liftedWeightKg, isFemale),
      ipfGL: calculateIPFGL(bodyWeightKg, liftedWeightKg, isFemale, compType),
      wilks2: calculateNewWilks(bodyWeightKg, liftedWeightKg, isFemale),
      oldWilks: calculateOldWilks(bodyWeightKg, liftedWeightKg, isFemale),
      ipf: calculateIPF(bodyWeightKg, liftedWeightKg, isFemale, compType),
    });
  };

  const setRecordsAsLiftedWeight = () => {
    const total = parseFloat(records.bench || 0) + parseFloat(records.squat || 0) + parseFloat(records.deadlift || 0);
    setLiftedWeight(total.toString());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: headerTextColor }]}>Калькулятори</Text>
            
            <View style={[styles.tabContainer, { backgroundColor: tabBgColor }]}>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === '1rm' && [styles.tabButtonActive, { backgroundColor: tabActiveBgColor }]]}
                onPress={() => setActiveTab('1rm')}
              >
                <Text style={[styles.tabText, activeTab === '1rm' && [styles.tabTextActive, { color: headerTextColor }]]}>1RM Максимум</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'scores' && [styles.tabButtonActive, { backgroundColor: tabActiveBgColor }]]}
                onPress={() => setActiveTab('scores')}
              >
                <Text style={[styles.tabText, activeTab === 'scores' && [styles.tabTextActive, { color: headerTextColor }]]}>Рейтинги (DOTS/GL)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeTab === '1rm' && (
            <View>
              <View style={styles.recordsContainer}>
                <Text style={[styles.recordsTitle, { color: textColor }]}>Мої Рекорди</Text>
                <View style={styles.recordsRow}>
                  <TouchableOpacity style={[styles.recordCard, { backgroundColor: cardBgColor }]} onPress={() => router.push('/exercise/bench')}>
                    <Image source={require('../../app/exercise/benchpress.png')} style={styles.recordIcon} />
                    <Text style={[styles.recordLabel, { color: subTextColor }]}>Жим лежачи</Text>
                    <Text style={[styles.recordValue, { color: headerTextColor }]}>{records.bench} кг</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.recordCard, { backgroundColor: cardBgColor }]} onPress={() => router.push('/exercise/squat')}>
                    <Image source={require('../../app/exercise/squat.png')} style={styles.recordIcon} />
                    <Text style={[styles.recordLabel, { color: subTextColor }]}>Присяд зі штангою</Text>
                    <Text style={[styles.recordValue, { color: headerTextColor }]}>{records.squat} кг</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.recordCard, { backgroundColor: cardBgColor }]} onPress={() => router.push('/exercise/deadlift')}>
                    <Image source={require('../../app/exercise/deadlift.png')} style={styles.recordIcon} />
                    <Text style={[styles.recordLabel, { color: subTextColor }]}>Станова тяга</Text>
                    <Text style={[styles.recordValue, { color: headerTextColor }]}>{records.deadlift} кг</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.card, { backgroundColor: cardBgColor }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>Вага штанги (кг):</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
                    keyboardType="numeric"
                    placeholder="Наприклад: 80"
                    placeholderTextColor={subTextColor}
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>Кількість повторень:</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
                    keyboardType="numeric"
                    placeholder="Наприклад: 8"
                    placeholderTextColor={subTextColor}
                    value={reps}
                    onChangeText={setReps}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, (!weight || !reps) && styles.buttonDisabled]}
                  onPress={calculate1RM}
                  disabled={!weight || !reps}
                >
                  <Text style={styles.buttonText}>Розрахувати максимум</Text>
                </TouchableOpacity>
              </View>

              {oneRepMax !== null && (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>Ваш разовий максимум:</Text>
                  <Text style={styles.resultValue}>{oneRepMax} <Text style={styles.resultUnit}>кг</Text></Text>
                </View>
              )}

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Увага!</Text>
                <Text style={styles.infoText}>
                  Точне значення одноповторного максимуму залежить від багатьох індивідуальних особливостей організму кожної конкретної людини.
                  Слід враховувати, що похибка даних формул може становити до <Text style={styles.boldText}>4%</Text>.
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'scores' && (
            <View>
              <View style={[styles.card, { backgroundColor: cardBgColor }]}>
                
                {/* Gender & Unit Toggles */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Стать:</Text>
                    <View style={[styles.switchContainer, { backgroundColor: inputBgColor, borderColor }]}>
                      <TouchableOpacity 
                        style={[styles.switchButton, !isFemale && styles.switchButtonActive]} 
                        onPress={() => setIsFemale(false)}>
                        <Text style={[styles.switchText, !isFemale && styles.switchTextActive]}>Чол.</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.switchButton, isFemale && styles.switchButtonActive]} 
                        onPress={() => setIsFemale(true)}>
                        <Text style={[styles.switchText, isFemale && styles.switchTextActive]}>Жін.</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.toggleGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Одиниці:</Text>
                    <View style={[styles.switchContainer, { backgroundColor: inputBgColor, borderColor }]}>
                      <TouchableOpacity 
                        style={[styles.switchButton, isKg && styles.switchButtonActive]} 
                        onPress={() => setIsKg(true)}>
                        <Text style={[styles.switchText, isKg && styles.switchTextActive]}>KG</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.switchButton, !isKg && styles.switchButtonActive]} 
                        onPress={() => setIsKg(false)}>
                        <Text style={[styles.switchText, !isKg && styles.switchTextActive]}>LBS</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>Власна вага:</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
                    keyboardType="numeric"
                    placeholder={isKg ? "Наприклад: 80" : "Наприклад: 175"}
                    placeholderTextColor={subTextColor}
                    value={bw}
                    onChangeText={setBw}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={[styles.label, { color: textColor }]}>Піднята вага:</Text>
                    <TouchableOpacity onPress={setRecordsAsLiftedWeight}>
                      <Text style={styles.linkText}>Використати мої рекорди</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
                    keyboardType="numeric"
                    placeholder={isKg ? "Наприклад: 400" : "Наприклад: 880"}
                    placeholderTextColor={subTextColor}
                    value={liftedWeight}
                    onChangeText={setLiftedWeight}
                  />
                </View>

                {/* Event & Category Toggles */}
                <View style={{ marginBottom: 15 }}>
                  <View style={{ marginBottom: 15 }}>
                    <Text style={[styles.label, { color: textColor }]}>Екіпірування:</Text>
                    <View style={[styles.switchContainer, { backgroundColor: inputBgColor, borderColor }]}>
                      <TouchableOpacity 
                        style={[styles.switchButton, event === 'CL' && styles.switchButtonActive]} 
                        onPress={() => setEvent('CL')}>
                        <Text style={[styles.switchText, event === 'CL' && styles.switchTextActive]}>Без екіпірування</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.switchButton, event === 'EQ' && styles.switchButtonActive]} 
                        onPress={() => setEvent('EQ')}>
                        <Text style={[styles.switchText, event === 'EQ' && styles.switchTextActive]}>В екіпіруванні</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View>
                    <Text style={[styles.label, { color: textColor }]}>Тип змагань:</Text>
                    <View style={[styles.switchContainer, { backgroundColor: inputBgColor, borderColor }]}>
                      <TouchableOpacity 
                        style={[styles.switchButton, category === 'PL' && styles.switchButtonActive]} 
                        onPress={() => setCategory('PL')}>
                        <Text style={[styles.switchText, category === 'PL' && styles.switchTextActive]}>Триборство</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.switchButton, category === 'BN' && styles.switchButtonActive]} 
                        onPress={() => setCategory('BN')}>
                        <Text style={[styles.switchText, category === 'BN' && styles.switchTextActive]}>Лише Жим</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, (!bw || !liftedWeight) && styles.buttonDisabled, {marginTop: 20}]}
                  onPress={calculateScores}
                  disabled={!bw || !liftedWeight}
                >
                  <Text style={styles.buttonText}>Розрахувати рейтинги</Text>
                </TouchableOpacity>
              </View>

              {scores && (
                <View style={styles.scoresGrid}>
                  <View style={styles.scoreBoxMain}>
                    <Text style={styles.scoreTitle}>DOTS</Text>
                    <Text style={styles.scoreValueMain}>{scores.dots}</Text>
                  </View>
                  <View style={styles.scoreBoxMain}>
                    <Text style={styles.scoreTitle}>IPF GL</Text>
                    <Text style={styles.scoreValueMain}>{scores.ipfGL}</Text>
                  </View>
                  
                  <View style={styles.scoreRow}>
                    <View style={[styles.scoreBoxSecondary, { backgroundColor: cardBgColor, borderColor }]}>
                      <Text style={[styles.scoreTitleSecondary, { color: subTextColor }]}>Wilks (Новий)</Text>
                      <Text style={[styles.scoreValueSecondary, { color: headerTextColor }]}>{scores.wilks2}</Text>
                    </View>
                    <View style={[styles.scoreBoxSecondary, { backgroundColor: cardBgColor, borderColor }]}>
                      <Text style={[styles.scoreTitleSecondary, { color: subTextColor }]}>Wilks (Старий)</Text>
                      <Text style={[styles.scoreValueSecondary, { color: headerTextColor }]}>{scores.oldWilks}</Text>
                    </View>
                    <View style={[styles.scoreBoxSecondary, { backgroundColor: cardBgColor, borderColor }]}>
                      <Text style={[styles.scoreTitleSecondary, { color: subTextColor }]}>IPF Бали</Text>
                      <Text style={[styles.scoreValueSecondary, { color: headerTextColor }]}>{scores.ipf}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  recordsContainer: {
    marginBottom: 20,
  },
  recordsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordCard: {
    flex: 1,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recordIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  recordLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  recordValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 13,
    color: '#007bff',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#b3d7ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 16,
    color: '#a0aab2',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  resultUnit: {
    fontSize: 24,
    fontWeight: '500',
    color: '#a0aab2',
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  toggleGroup: {
    flex: 1,
    marginRight: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  switchButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#007bff',
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
  },
  switchTextActive: {
    color: '#fff',
  },
  scoresGrid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreBoxMain: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreBoxSecondary: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
  },
  scoreTitle: {
    fontSize: 14,
    color: '#a0aab2',
    marginBottom: 5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scoreValueMain: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  scoreTitleSecondary: {
    fontSize: 10,
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreValueSecondary: {
    fontSize: 16,
    fontWeight: '800',
  },
});