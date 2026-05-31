import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Динамічно отримуємо IP-адресу сервера, щоб працювало і на телефоні
let API_URL = 'http://localhost:3000';

const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoGo?.debuggerHost;

if (debuggerHost) {
  API_URL = `http://${debuggerHost.split(':')[0]}:3000`;
} else if (Constants.experienceUrl && Constants.experienceUrl.includes('exp://')) {
  try {
    // Parse IP from exp://10.177.60.233:8081
    const match = Constants.experienceUrl.match(/exp:\/\/([0-9.]+):/);
    if (match && match[1]) {
      API_URL = `http://${match[1]}:3000`;
    }
  } catch(e) {}
} else if (Platform.OS === 'android') {
  API_URL = 'http://10.0.2.2:3000';
}

console.log('API_URL is set to:', API_URL);

export const initDB = async () => {
  // База даних тепер ініціалізується на сервері
  console.log('Using remote server for database operations.');
};

export const getUser = async () => {
  // Local auto-login is no longer managed by database.js directly fetching the last row.
  return null;
};

export const saveUser = async (name, email, password, avatarUri) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, avatarUri }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error saving user on server:', error);
    return null;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error logging in on server:', error);
    return null;
  }
};

export const updateUser = async (email, name, avatarUri) => {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, avatarUri }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Update failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating user on server:', error);
    return null;
  }
};

export const saveRecords = async (email, bench, squat, deadlift, bodyWeight) => {
  try {
    const response = await fetch(`${API_URL}/records`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, bench, squat, deadlift, bodyWeight }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Update records failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error saving records on server:', error);
    return null;
  }
};

export const addFriend = async (email, friendTag) => {
  try {
    const response = await fetch(`${API_URL}/friends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, friendTag }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to add friend');
    }
    
    return data;
  } catch (error) {
    console.error('Error adding friend on server:', error);
    return { error: error.message };
  }
};

export const getFriends = async (email) => {
  try {
    const response = await fetch(`${API_URL}/friends/${email}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch friends');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching friends on server:', error);
    return [];
  }
};

export const removeFriend = async (email, friendId) => {
  try {
    const response = await fetch(`${API_URL}/friends/${email}/${friendId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to remove friend');
    }
    
    return data;
  } catch (error) {
    console.error('Error removing friend on server:', error);
    return { error: error.message };
  }
};

export const loginWithGoogle = async (email, name, avatarUri) => {
  try {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, avatarUri }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Google login failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error logging in with Google on server:', error);
    return null;
  }
};
