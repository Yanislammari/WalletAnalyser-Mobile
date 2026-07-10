import analytics from '@react-native-firebase/analytics';

export const trackButtonClick = (buttonName : string, extraParams = {}) => {
  analytics().logEvent('button_click', {
    button_name: buttonName,
    ...extraParams,
  });
};