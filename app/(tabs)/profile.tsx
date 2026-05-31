import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, logoutUser } from '../../store/userSlice';
import { router } from 'expo-router';
import { updateUser } from '../../utils/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Редагування профілю</Text>

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
          <Text style={styles.label}>Email (тільки читання)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user.email}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ім'я</Text>
          <TextInput
            style={styles.input}
            placeholder="Введіть ваше нове ім'я"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#888"
          />
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
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#eaeaea',
    color: '#888',
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
});
