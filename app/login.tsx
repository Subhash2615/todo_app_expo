import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID', // TODO: Replace with your Expo client ID
    iosClientId: 'YOUR_IOS_CLIENT_ID',   // TODO: Replace with your iOS client ID
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // TODO: Replace with your Android client ID
    webClientId: 'YOUR_WEB_CLIENT_ID',   // TODO: Replace with your web client ID
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        setLoading(true);
        AsyncStorage.setItem('userToken', authentication.accessToken)
          .then(() => {
            setLoading(false);
            router.replace('/(tabs)');
          })
          .catch(() => {
            setLoading(false);
            setError('Failed to save token.');
          });
      }
    } else if (response?.type === 'error') {
      setError('Authentication failed.');
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in to Todo App</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
title="Sign in with Google"
onPress={() => promptAsync()}
disabled={!request}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
}); 