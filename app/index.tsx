import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Alert, Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/userSlice'; // Reusing this action to set current user
import { loginUser, loginWithGoogle } from '../utils/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '1018057413277-38klvoncefrmb5dpnde54rl53304h4mr.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: '1018057413277-qojrkel2f67rh0nedr96lok23r6fdqcr.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'com.vanaterziev.gym',
    }),
  });

  console.log('Redirect URI for Google Cloud Console:', AuthSession.makeRedirectUri({
    scheme: 'com.vanaterziev.gym',
  }));

  React.useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          dispatch(registerUser(user));
          router.replace('/shop');
        }
      } catch (e) {
        console.error('Failed to auto-login', e);
      }
    };
    checkAutoLogin();
  }, []);

  React.useEffect(() => {
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
          Alert.alert('Помилка', 'Не вдалося увійти через сервер');
        }
      }
    } catch (e) {
      Alert.alert('Помилка', 'Не вдалося отримати дані від Google');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Помилка', 'Будь ласка, введіть email та пароль');
      return;
    }

    const user = await loginUser(email, password);

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
      Alert.alert('Помилка', 'Невірний email або пароль');
    }
  };

  const handleEmailChange = (text: string) => {
    if (text.length - email.length > 1) {
      Keyboard.dismiss();
    }
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    if (text.length - password.length > 1) {
      Keyboard.dismiss();
    }
    setPassword(text);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Вхід в акаунт</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
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
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              placeholder="Введіть пароль"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              placeholderTextColor="#888"
              textContentType="password"
              autoComplete="password"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Увійти</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#4285F4', marginTop: 15 }]}
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <Text style={styles.buttonText}>Увійти через Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Немає акаунту? Зареєструватися</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
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
