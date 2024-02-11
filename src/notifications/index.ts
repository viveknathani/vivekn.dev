import axios from 'axios';
import config from '../config';
import { NOTIFICATION_CHANNEL, NotificationRequest } from '../types';

async function sendNotification(request: NotificationRequest) {
  switch (request.channel) {
    case NOTIFICATION_CHANNEL.TELEGRAM: {
      await axios.post(
        `https://api.telegram.org/bot${config.TELEGRAM_API_KEY}/sendMessage`,
        {
          chat_id: 5501101308,
          text: request.data.text,
          disable_web_page_preview: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      break;
    }
    default: {
      throw new Error('unsupported channel!');
    }
  }
}

export { sendNotification };
