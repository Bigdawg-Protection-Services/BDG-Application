import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { reportError } from '../utils/errorReporter';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    reportError(error, info, { scope: 'ErrorBoundary' }).catch(() => null);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>BDG is restarting</Text>
          <Text style={styles.subtitle}>
            A critical error occurred. Please try again. If this keeps happening,
            share this screen with support.
          </Text>
          <View style={styles.card}>
            <Text style={styles.label}>Error</Text>
            <Text style={styles.value}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5f5',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  button: {
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 15,
  },
});
