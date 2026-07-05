/**
 * AboutScreen — stub implementation.
 * Full implementation in task 8.1.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D1B69',
  },
  text: {
    color: '#F5F0FF',
    fontSize: 24,
  },
});
