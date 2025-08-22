import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function initNotifications(): Promise<boolean> {
  const perms = await Notifications.getPermissionsAsync();
  let status = perms.status;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return status === 'granted';
}

export async function scheduleReminder(title: string, delayMs: number) {
  const seconds = Math.max(1, Math.floor(delayMs / 1000));
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: 'Time to take your dose',
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: { seconds, channelId: 'reminders' },
  });
}

export async function sendImmediate(title: string) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: 'Time to take your dose',
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  });
}


