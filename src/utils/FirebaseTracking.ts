import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

export const trackButtonClick = (buttonName : string, extraParams = {}) => {
  logEvent(getAnalytics(), 'Click_on', {
    button_name: buttonName,
    ...extraParams,
  });
};