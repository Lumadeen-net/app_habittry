import { Habit } from '../store/useHabitStore';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

class ReminderService {
  private motivationalMessages = [
    "Check in for the Day and be a better person each Day! 🌟",
    "Small steps lead to big changes. Time for your habit! 🚀",
    "Consistency is the key to success. Keep going! 💪",
    "Believe in yourself. You're doing great! ✨",
    "Another day, another opportunity to grow. 🌿",
    "Your future self will thank you. Stay focused! 🎯",
    "Don't stop until you're proud. Let's do this! 🔥",
    "Every day counts. Make today amazing! 🌈"
  ];

  private getRandomMotivationalMessage() {
    return this.motivationalMessages[Math.floor(Math.random() * this.motivationalMessages.length)];
  }

  async start() {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== 'granted') {
        await this.requestPermission();
      }

      // Create channel for Android
      await LocalNotifications.createChannel({
        id: 'habit-reminders',
        name: 'Habit Reminders',
        description: 'Daily habit check-in reminders',
        importance: 5,
        visibility: 1,
        sound: 'default'
      });
    } catch (e) {
      console.warn('LocalNotifications plugin initialization issues:', e);
    }
  }

  async requestPermission() {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Generates a unique integer ID for a habit-day combination
   */
  private getNotificationId(habitId: string, offset: number = 0): number {
    let hash = 0;
    for (let i = 0; i < habitId.length; i++) {
      const char = habitId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash + offset) % 2147483647;
  }

  /**
   * Synchronizes native scheduled notifications with the current habits.
   */
  async sync(habits: Habit[]) {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== 'granted') {
        console.log('[ReminderService] Notification permission not granted. Skipping sync.');
        return;
      }

      // 1. Cancel all existing notifications to start fresh
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      const notifications: ScheduleOptions['notifications'] = [];

      habits.forEach((habit) => {
        if (!habit.reminder || !habit.reminder.enabled || habit.status !== 'active') return;

        const [hour, minute] = habit.reminder.time.split(':').map(Number);
        const motivationalMessage = this.getRandomMotivationalMessage();

        if (habit.reminder.frequency === 'daily') {
          notifications.push({
            id: this.getNotificationId(habit.id, 0),
            title: habit.name,
            body: motivationalMessage,
            channelId: 'habit-reminders',
            schedule: {
              on: { hour, minute },
              repeats: true,
              allowWhileIdle: true
            },
            sound: 'default'
          });
        } else if (habit.reminder.frequency === 'weekdays') {
          [2, 3, 4, 5, 6].forEach((day) => {
            notifications.push({
              id: this.getNotificationId(habit.id, day),
              title: habit.name,
              body: motivationalMessage,
              channelId: 'habit-reminders',
              schedule: {
                on: { weekday: day, hour, minute },
                repeats: true,
                allowWhileIdle: true
              },
              sound: 'default'
            });
          });
        } else if (habit.reminder.frequency === 'weekends') {
          [1, 7].forEach((day) => {
            notifications.push({
              id: this.getNotificationId(habit.id, day),
              title: habit.name,
              body: motivationalMessage,
              channelId: 'habit-reminders',
              schedule: {
                on: { weekday: day, hour, minute },
                repeats: true,
                allowWhileIdle: true
              },
              sound: 'default'
            });
          });
        }
      });

      if (notifications.length > 0) {
        console.log(`[ReminderService] Scheduling ${notifications.length} notifications natively.`);
        await LocalNotifications.schedule({ notifications });
      }
    } catch (error) {
      console.error('[ReminderService] Sync error:', error);
    }
  }
}

export const reminderService = new ReminderService();
