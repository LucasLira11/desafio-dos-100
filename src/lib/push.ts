import webpush from 'web-push';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;

// O e-mail deve ser um contato válido (exigência do protocolo Web Push)
webpush.setVapidDetails(
  'mailto:lucasponteslira@gmail.com',
  publicVapidKey,
  privateVapidKey
);

export async function sendPushNotification(subscription: any, payload: string) {
  try {
    await webpush.sendNotification(subscription, payload);
  } catch (error) {
    console.error('Erro ao enviar push:', error);
  }
}