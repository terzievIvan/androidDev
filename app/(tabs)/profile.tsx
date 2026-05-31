import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, logoutUser } from '../../store/userSlice';
import { setTheme } from '../../store/themeSlice';
import { router } from 'expo-router';
import { updateUser } from '../../utils/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '../../hooks/use-theme-color';

export default function EditProfileScreen() {
  const user = useSelector((state: any) => state.user);
  const themeMode = useSelector((state: any) => state.theme?.mode || 'system');
  const dispatch = useDispatch();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const inputBgColor = useThemeColor({ light: '#f9f9f9', dark: '#222' }, 'background');
  const borderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'background');

  const [name, setName] = useState(user.name || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user.avatarUri || null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Помилка', 'Ім\'я не може бути порожнім');
      return;
    }

    const result = await updateUser(user.email, name, avatarUri);

    if (result) {
      dispatch(updateUserProfile({
        name,
        avatarUri,
      }));

      Alert.alert('Успіх', 'Дані профілю оновлено');
      router.navigate('/shop');
    } else {
      Alert.alert('Помилка', 'Не вдалося оновити дані на сервері');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    dispatch(logoutUser());
    router.replace('/');
  };

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    dispatch(setTheme(newTheme));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Редагування профілю</Text>

        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>+</Text>
            </View>
          )}
          <Text style={styles.avatarLabel}>Змінити аватар</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Email (тільки читання)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
            value={user.email}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Ім'я</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
            placeholder="Введіть ваше нове ім'я"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.themeContainer}>
          <Text style={[styles.label, { color: textColor }]}>Тема оформлення</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'system' && styles.themeOptionActive]} 
              onPress={() => handleThemeChange('system')}
            >
              <Text style={[styles.themeOptionText, themeMode === 'system' && styles.themeOptionTextActive]}>Системна</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'light' && styles.themeOptionActive]} 
              onPress={() => handleThemeChange('light')}
            >
              <Text style={[styles.themeOptionText, themeMode === 'light' && styles.themeOptionTextActive]}>Світла</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'dark' && styles.themeOptionActive]} 
              onPress={() => handleThemeChange('dark')}
            >
              <Text style={[styles.themeOptionText, themeMode === 'dark' && styles.themeOptionTextActive]}>Темна</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Зберегти зміни</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.navigate('/shop')}>
          <Text style={styles.cancelButtonText}>Скасувати</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Вийти з акаунту</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  avatarText: {
    fontSize: 40,
    color: '#888',
  },
  avatarLabel: {
    marginTop: 10,
    fontSize: 14,
    color: '#007bff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  disabledInput: {
    opacity: 0.7,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 40,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeContainer: {
    marginBottom: 20,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#007bff',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  themeOptionActive: {
    backgroundColor: '#007bff',
  },
  themeOptionText: {
    color: '#007bff',
    fontWeight: '600',
  },
  themeOptionTextActive: {
    color: '#fff',
  },
});
