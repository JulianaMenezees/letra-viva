import React from 'react';
import { TouchableOpacity, Text, Vibration, StyleSheet } from 'react-native';

export default function LargeButton({ title, onPress, color = '#4A90E2', accessibilityLabel }) {
  return (
    <TouchableOpacity
      onPress={() => { Vibration.vibrate(50); onPress && onPress(); }}
      style={[styles.button, { backgroundColor: color }]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '80%', paddingVertical: 16, borderRadius: 12, marginVertical: 10, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 2, height: 4 }, shadowRadius: 6,
  },
  text: { color: '#fff', fontSize: 20, fontWeight: '600' },
});
