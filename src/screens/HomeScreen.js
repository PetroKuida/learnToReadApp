/**
 * HomeScreen — stub implementation.
 * Full implementation in task 6.2.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home</Text>
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
