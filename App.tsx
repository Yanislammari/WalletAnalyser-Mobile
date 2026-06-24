import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Register from './src/screens/Register';
import Login from './src/screens/Login';
import { enableScreens } from 'react-native-screens';
import { Toaster } from 'sonner-native';
import { AuthProvider, navigationRef } from './src/providers/AuthProvider';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GOOGLE_CLIENT_ID } from './src/constants/env';
import Dashboard from './src/screens/Dashboard';
import ForgottenPassword from './src/screens/ForgottenPassword';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

enableScreens();
const Stack = createNativeStackNavigator();

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID,
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <AuthProvider>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Register" component={Register} options={{ headerShown: false }}/>
              <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
              <Stack.Screen name="Dashboard" component={Dashboard} />
              <Stack.Screen name="ForgottenPassword" component={ForgottenPassword} options={{ headerShown: false }}/>
            </Stack.Navigator>
          </AuthProvider>
        </NavigationContainer>
        <Toaster position="bottom-center" theme="dark" richColors closeButton />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}