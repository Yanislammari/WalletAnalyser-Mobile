import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet } from 'react-native';
import { RootStackParamList } from '../nav/ScreenParams';

type LoginProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>; // get autocompletion of nav
};

export default function Login({ navigation } : LoginProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Button
        title="Go to register"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});