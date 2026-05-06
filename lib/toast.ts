import { Alert } from 'react-native';

export const toast = {
  success: (message: string, title = 'Success') => {
    Alert.alert(title, message);
  },
  error: (message: string, title = 'Error') => {
    Alert.alert(title, message);
  },
  info: (message: string, title = 'Info') => {
    Alert.alert(title, message);
  },
};
