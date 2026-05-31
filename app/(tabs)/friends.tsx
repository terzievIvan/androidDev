import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, SafeAreaView, Alert, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { addFriend, getFriends, removeFriend } from '../../utils/database';
import { useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { useThemeColor } from '../../hooks/use-theme-color';

export default function FriendsScreen() {
  const user = useSelector((state: any) => state.user);
  const [friendTag, setFriendTag] = useState('');
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBgColor = useThemeColor({ light: '#fff', dark: '#222' }, 'background');
  const inputBgColor = useThemeColor({ light: '#fff', dark: '#222' }, 'background');
  const borderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'background');
  const statBgColor = useThemeColor({ light: '#f9f9f9', dark: '#333' }, 'background');
  const subTextColor = useThemeColor({ light: '#666', dark: '#aaa' }, 'text');

  const loadFriends = async () => {
    if (!user.email) return;
    setLoading(true);
    const data = await getFriends(user.email);
    if (data && Array.isArray(data)) {
      setFriendsList(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [user.email])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const copyToClipboard = async () => {
    if (user.userTag) {
      await Clipboard.setStringAsync(user.userTag);
      Toast.show({
        type: 'success',
        text1: 'Скопійовано!',
        text2: 'Ваш тег скопійовано в буфер обміну',
        position: 'top',
      });
    }
  };

  const handleAddFriend = async () => {
    if (!friendTag.trim()) {
      Alert.alert('Помилка', 'Введіть тег друга');
      return;
    }
    if (friendTag === user.userTag) {
      Alert.alert('Помилка', 'Ви не можете додати самі себе');
      return;
    }

    const tagToSearch = friendTag.startsWith('#') ? friendTag : `#${friendTag}`;

    const result = await addFriend(user.email, tagToSearch.toLowerCase());
    
    if (result.error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: result.error,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Успіх',
        text2: 'Друга успішно додано!',
      });
      setFriendTag('');
      loadFriends();
    }
  };

  const handleDeleteFriend = (friendId: number, friendName: string) => {
    Alert.alert(
      'Видалити друга',
      `Ви впевнені, що хочете видалити ${friendName} зі списку друзів?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            const result = await removeFriend(user.email, friendId);
            if (result.error) {
              Toast.show({
                type: 'error',
                text1: 'Помилка',
                text2: result.error,
              });
            } else {
              Toast.show({
                type: 'success',
                text1: 'Успіх',
                text2: 'Друга видалено',
              });
              loadFriends();
            }
          },
        },
      ]
    );
  };

  const renderFriendCard = ({ item }: { item: any }) => (
    <View style={[styles.friendCard, { backgroundColor: cardBgColor }]}>
      <View style={styles.friendHeader}>
        {item.avatarUri ? (
          <Image source={{ uri: item.avatarUri }} style={styles.friendAvatar} />
        ) : (
          <View style={[styles.friendAvatar, styles.placeholderAvatar, { backgroundColor: statBgColor }]}>
            <FontAwesome name="user" size={24} color={subTextColor} />
          </View>
        )}
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.friendTag, { color: subTextColor }]}>{item.userTag}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteFriend(item.id, item.name)}>
          <Ionicons name="trash-outline" size={22} color="#ff4444" />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.statsContainer, { backgroundColor: statBgColor }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: subTextColor }]}>Жим</Text>
          <Text style={[styles.statValue, { color: textColor }]}>{item.bench || 0} кг</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: subTextColor }]}>Присяд</Text>
          <Text style={[styles.statValue, { color: textColor }]}>{item.squat || 0} кг</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: subTextColor }]}>Станова</Text>
          <Text style={[styles.statValue, { color: textColor }]}>{item.deadlift || 0} кг</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.container}>
        <View style={[styles.myTagContainer, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.myTagLabel, { color: subTextColor }]}>Ваш тег для друзів (натисніть, щоб скопіювати):</Text>
          <TouchableOpacity style={styles.tagBox} onPress={copyToClipboard}>
            <Text style={styles.myTagValue}>{user.userTag || 'Немає тегу'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addFriendContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
            placeholder="Введіть тег (наприклад #qw345r)"
            value={friendTag}
            onChangeText={setFriendTag}
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
            <Ionicons name="person-add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.listTitle, { color: textColor }]}>Ваші друзі ({friendsList.length})</Text>

        <FlatList
          data={friendsList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFriendCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007bff']} tintColor={textColor} />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={60} color={subTextColor} />
                <Text style={[styles.emptyText, { color: textColor }]}>У вас поки немає друзів.</Text>
                <Text style={[styles.emptySubtext, { color: subTextColor }]}>Додайте когось за тегом, щоб бачити їх результати!</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  myTagContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  myTagLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tagBox: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  myTagValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
    letterSpacing: 1,
  },
  addFriendContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007bff',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  friendCard: {
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  friendTag: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
