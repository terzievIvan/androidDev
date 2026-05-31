import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, SafeAreaView, ActivityIndicator, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/userSlice';
import { router } from 'expo-router';
import { initDB, getUser, saveUser, loginWithGoogle } from '../utils/database';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '../hooks/use-theme-color';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const inputBgColor = useThemeColor({ light: '#f9f9f9', dark: '#222' }, 'background');
  const borderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'background');

  const dispatch = useDispatch();

  useEffect(() => {
    const setupDB = async () => {
      await initDB();
      setLoading(false);
    };
    setupDB();
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '1018057413277-38klvoncefrmb5dpnde54rl53304h4mr.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: '1018057413277-qojrkel2f67rh0nedr96lok23r6fdqcr.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'com.vanaterziev.gym',
    }),
  });

  React.useEffect(() => {';'
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      
      if (user && user.email) {
        const dbUser = await loginWithGoogle(user.email, user.name || 'Google User', user.picture);
        if (dbUser) {
           const userData = {
            name: dbUser.name,
            email: dbUser.email,
            userTag: dbUser.userTag,
            avatarUri: dbUser.avatarUri,
            records: {
              bench: dbUser.bench || 0,
              squat: dbUser.squat || 0,
              deadlift: dbUser.deadlift || 0,
              bodyWeight: dbUser.bodyWeight || 0
            }
          };
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          dispatch(registerUser(userData));
          router.replace('/shop');
        } else {
           Alert.alert('Помилка', 'Не вдалося зареєструватись через сервер');
        }
      }
    } catch (e) {
      Alert.alert('Помилка', 'Не вдалося отримати дані від Google');
    }
  };

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

  const handleNameChange = (text: string) => {
    if (text.length - name.length > 1) Keyboard.dismiss();
    setName(text);
  };

  const handleEmailChange = (text: string) => {
    if (text.length - email.length > 1) Keyboard.dismiss();
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    if (text.length - password.length > 1) Keyboard.dismiss();
    setPassword(text);
  };

  const handleConfirmPasswordChange = (text: string) => {
    if (text.length - confirmPassword.length > 1) Keyboard.dismiss();
    setConfirmPassword(text);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі обов\'язкові поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Помилка', 'Паролі не співпадають');
      return;
    }

    const user = await saveUser(name, email, password, avatarUri);

    if (user) {
      const userData = {
        name: user.name,
        email: user.email,
        userTag: user.userTag,
        avatarUri: user.avatarUri,
        records: {
          bench: user.bench || 0,
          squat: user.squat || 0,
          deadlift: user.deadlift || 0,
          bodyWeight: user.bodyWeight || 0
        }
      };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      dispatch(registerUser(userData));

      router.replace('/shop');
    } else {
      Alert.alert('Помилка', 'Не вдалося зареєструватись на сервері');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Реєстрація</Text>

        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: inputBgColor, borderColor }]}>
              <Text style={styles.avatarText}>+</Text>
            </View>
          )}
          <Text style={styles.avatarLabel}>Оберіть аватар</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Ім'я</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
            placeholder="Введіть ваше ім'я"
            value={name}
            onChangeText={handleNameChange}
            placeholderTextColor="#888"
            textContentType="name"
            autoComplete="name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
            placeholder="Введіть ваш email"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#888"
            textContentType="emailAddress"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Пароль</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
            placeholder="Введіть пароль"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            placeholderTextColor="#888"
            textContentType="newPassword"
            autoComplete="password-new"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Підтвердження паролю</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
            placeholder="Введіть пароль ще раз"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            secureTextEntry
            placeholderTextColor="#888"
            textContentType="newPassword"
            autoComplete="password-new"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Зареєструватися</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#4285F4', marginTop: 15 }]} 
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Text style={styles.buttonText}>Зареєструватися через Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
          <Text style={styles.linkText}>Вже є акаунт? Увійти</Text>
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
    justifyContent: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
  button: {
    backgroundColor: '#007bff',
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
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
});
