import webpush from "web-push";
import { connectDB } from "@/lib/db";
import { PushSubscription } from "@/lib/models/PushSubscription";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Sends a push notification to every device a user has subscribed on.
 * A dead/expired subscription (410 Gone, 404) is removed automatically —
 * push endpoints do expire, and there's no value in retrying a dead one.
 */
export async function sendPushToUser(userEmail: string, payload: PushPayload) {
  await connectDB();
  const subs = await PushSubscription.find({ userEmail });

  if (subs.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await PushSubscription.deleteOne({ endpoint: sub.endpoint });
        } else {
          console.error(`Push failed for ${userEmail}:`, err);
        }
      }
    })
  );

  return { sent, failed };
}