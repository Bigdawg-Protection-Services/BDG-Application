import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';
import URL from './res/data/Environment';
import CameraView from './views/CameraView';
import ErrorBoundary from './components/ErrorBoundary';
import { installGlobalErrorHandler } from './utils/errorReporter';

const Stack = createStackNavigator();

function PrimaryButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function NoticeBanner() {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>
        BDG App is undergoing updates and bug fixes. To maintain company
        operations, only basic functions are currently available.
      </Text>
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Login', 'Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const url = URL.concat('api/login');
      const response = await axios.post(url, {
        email: email.toLowerCase().trim(),
        password,
      });
      const user = response.data?.data?.doc;
      if (!user?.token || !user?._id) {
        throw new Error('Invalid login response');
      }
      await AsyncStorage.setItem('@loginToken', user.token);
      await AsyncStorage.setItem('@userId', user._id);
      await AsyncStorage.setItem('@userName', user.name || '');
      await AsyncStorage.setItem('@userEmail', user.email || '');
      await AsyncStorage.setItem('@isLoggedIn', 'true');
      navigation.replace('Home');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Login failed';
      Alert.alert('Login failed', message);
    } finally {
      setLoading(false);
    }
  }, [email, password, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <NoticeBanner />
      <View style={styles.header}>
        <Text style={styles.title}>BDG</Text>
        <Text style={styles.subtitle}>Login</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholder="email@example.com"
          placeholderTextColor="#9ca3af"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholder="password"
          placeholderTextColor="#9ca3af"
        />
        <PrimaryButton label={loading ? 'Signing in...' : 'Sign in'} onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [clockStatus, setClockStatus] = useState('unknown');
  const [clockLoading, setClockLoading] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const name = (await AsyncStorage.getItem('@userName')) || '';
      const email = (await AsyncStorage.getItem('@userEmail')) || '';
      const token = await AsyncStorage.getItem('@loginToken');
      const userId = await AsyncStorage.getItem('@userId');
      setUserName(name);
      setUserEmail(email);

      if (userId) {
        const url = URL.concat('api/users/').concat(userId);
        const response = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const shiftStatus = parseInt(response.data?.data?.doc?.shift, 10);
        if (!Number.isNaN(shiftStatus)) {
          setClockStatus(shiftStatus === 1 ? 'in' : 'out');
        }
      }
    } catch (err) {
      console.error('Failed to load user status', err);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogout = useCallback(async () => {
    await AsyncStorage.removeItem('@loginToken');
    await AsyncStorage.removeItem('@userId');
    await AsyncStorage.removeItem('@userName');
    await AsyncStorage.removeItem('@userEmail');
    await AsyncStorage.removeItem('@isLoggedIn');
    navigation.replace('Login');
  }, [navigation]);

  const handleClock = useCallback(
    async (action) => {
      setClockLoading(true);
      try {
        const token = await AsyncStorage.getItem('@loginToken');
        const userId = await AsyncStorage.getItem('@userId');
        if (!userId) throw new Error('Missing user id');
        const url = URL.concat(action === 'in' ? 'api/checker/in' : 'api/checker/out');
        await axios.post(
          url,
          { user: userId },
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
        );
        setClockStatus(action === 'in' ? 'in' : 'out');
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'Clock action failed';
        Alert.alert('Clock', message);
      } finally {
        setClockLoading(false);
      }
    },
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <NoticeBanner />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>BDG</Text>
        <Text style={styles.subtitle}>Minimal Ops</Text>
        <View style={styles.card}>
          <Text style={styles.label}>User</Text>
          <Text style={styles.value}>{userName || '-'}</Text>
          <Text style={styles.value}>{userEmail || '-'}</Text>
          <Text style={styles.label}>Clock Status</Text>
          <Text style={styles.value}>
            {clockStatus === 'in' ? 'Clocked In' : clockStatus === 'out' ? 'Clocked Out' : 'Unknown'}
          </Text>
        </View>
        <PrimaryButton
          label={clockLoading ? 'Clocking in...' : 'Clock In'}
          onPress={() => handleClock('in')}
        />
        <PrimaryButton
          label={clockLoading ? 'Clocking out...' : 'Clock Out'}
          onPress={() => handleClock('out')}
        />
        <PrimaryButton label="Open Camera" onPress={() => navigation.navigate('Camera')} />
        <PrimaryButton label="New Report" onPress={() => navigation.navigate('Report')} />
        <PrimaryButton label="Logout" onPress={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ReportScreen({ navigation }) {
  const [location, setLocation] = useState('');
  const [reportType, setReportType] = useState('Incident report');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const draft = await AsyncStorage.getItem('@reportDraft');
        if (draft) {
          const parsed = JSON.parse(draft);
          setLocation(parsed.location || '');
          setReportType(parsed.reportType || 'Incident report');
          setContent(parsed.content || '');
        }
      } catch (err) {
        console.error('Failed to load report draft', err);
      } finally {
        setDraftLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    const draft = JSON.stringify({ location, reportType, content });
    AsyncStorage.setItem('@reportDraft', draft).catch(err =>
      console.error('Failed to save report draft', err)
    );
  }, [location, reportType, content, draftLoaded]);

  const canSubmit = useMemo(() => location && reportType && content, [location, reportType, content]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      Alert.alert('Report', 'Location, type, and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('@loginToken');
      const userId = await AsyncStorage.getItem('@userId');
      if (!token || !userId) {
        throw new Error('Not logged in');
      }
      const now = new Date();
      const url = URL.concat('api/reports');
      await axios.post(
        url,
        {
          user: userId,
          content,
          location,
          reportType,
          startTime: now.toISOString(),
          endTime: now.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await AsyncStorage.removeItem('@reportDraft');
      Alert.alert('Report', 'Submitted.');
      navigation.goBack();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Submit failed';
      Alert.alert('Report failed', message);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, content, location, navigation, reportType]);

  return (
    <SafeAreaView style={styles.container}>
      <NoticeBanner />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Report</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            style={styles.input}
            placeholder="Site location"
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.label}>Type</Text>
          <TextInput
            value={reportType}
            onChangeText={setReportType}
            style={styles.input}
            placeholder="Incident report"
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.label}>Content</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            style={[styles.input, styles.textarea]}
            placeholder="Write report"
            placeholderTextColor="#9ca3af"
            multiline
          />
        </View>
        <PrimaryButton label={submitting ? 'Submitting...' : 'Submit Report'} onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  useEffect(() => {
    installGlobalErrorHandler();
  }, []);

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Camera" component={CameraView} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    padding: 20,
    gap: 14,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  label: {
    fontSize: 13,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  textarea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  notice: {
    backgroundColor: '#fde68a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  noticeText: {
    color: '#92400e',
    fontSize: 13,
    lineHeight: 18,
  },
});
