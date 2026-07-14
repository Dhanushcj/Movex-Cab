import { registerRootComponent } from 'expo';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';

// Register background handler
import * as Notifications from 'expo-notifications';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  // If it's a data-only message or we want to ensure it displays:
  if (remoteMessage.data || remoteMessage.notification) {
    const title = remoteMessage.notification?.title || (remoteMessage.data?.title as string | undefined) || 'New Notification';
    const body = remoteMessage.notification?.body || (remoteMessage.data?.body as string | undefined) || 'You have a new message.';
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: remoteMessage.data,
      },
      trigger: null,
    });
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
