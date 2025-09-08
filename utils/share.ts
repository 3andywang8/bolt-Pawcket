import { Platform, Share as RNCoreShare } from 'react-native';

export type SocialTarget = 'whatsapp' | 'line' | 'facebook' | 'twitter' | 'instagram' | 'threads';
export type ShareVariant = 'default' | 'stories' | 'messages';
export type ShareOptions = {
  message?: string;
  url?: string;
  social?: SocialTarget; // 指定社群時才會走 shareSingle 或社群連結
  subject?: string; // 一些平台會用到
  variant?: ShareVariant; // instagram stories 等
};

function getWebSocialShareUrl(
  social: SocialTarget,
  message?: string,
  url?: string,
  variant: ShareVariant = 'default'
) {
  const text = encodeURIComponent([message, url].filter(Boolean).join(' '));
  const u = encodeURIComponent(url ?? '');
  switch (social) {
    case 'whatsapp':
      return `https://wa.me/?text=${text}`;
    case 'line':
      return `https://social-plugins.line.me/lineit/share?url=${u}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${text}`;
    case 'threads': {
      // Threads 支援 intent 連結
      const intent = `https://www.threads.net/intent/post?text=${text}`;
      return intent;
    }
    case 'instagram':
      // Web 無法直接分享到 IG Stories/DM，導向 IG 作為 fallback
      return 'https://www.instagram.com/';
    default:
      return undefined;
  }
}

export async function smartShare(opts: ShareOptions) {
  // 原生（iOS/Android）：盡量用 react-native-share.shareSingle
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      const Share = (await import('react-native-share')).default as any;
      const Social = (await import('react-native-share')).Social as any;

      if (opts.social) {
        // instagram stories 特例
        if (opts.social === 'instagram' && opts.variant === 'stories') {
          await Share.shareSingle({
            social: Social.INSTAGRAM_STORIES,
            message: opts.message,
            url: opts.url,
            subject: opts.subject,
          });
          return;
        }

        const socialMap: Record<SocialTarget, any> = {
          whatsapp: Social.WHATSAPP,
          line: Social.LINE,
          facebook: Social.FACEBOOK,
          twitter: Social.TWITTER,
          instagram: Social.INSTAGRAM,
          threads: Social.THREADS ?? Social.TWITTER, // 若套件無 Threads，退為 Twitter
        };

        await Share.shareSingle({
          social: socialMap[opts.social],
          message: opts.message,
          url: opts.url,
          subject: opts.subject,
        });
        return;
      }

      // 未指定社群 => 走一般分享
      await Share.open({
        message: opts.message,
        url: opts.url,
        subject: opts.subject,
      });
      return;
    } catch (e) {
      // 若 react-native-share 模組不可用（例如 Expo Go），fallback 到 RN 內建 Share
    }
  }

  // Web 或原生 fallback：使用 RN 內建 Share 或開啟社群網址
  try {
    if (opts.social) {
      const webUrl = getWebSocialShareUrl(opts.social, opts.message, opts.url, opts.variant);
      if (webUrl && typeof window !== 'undefined') {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    // 一般分享（在支援 Web Share API 的瀏覽器會彈出系統分享面板）
    await RNCoreShare.share({
      message: [opts.message, opts.url].filter(Boolean).join(' '),
      title: opts.subject,
      url: opts.url,
    });
  } catch {
    // 最後備援：複製到剪貼簿
    const fallbackText = [opts.message, opts.url].filter(Boolean).join(' ');
    if (fallbackText) {
      try {
        await (navigator as any).clipboard.writeText(fallbackText);
        if (typeof alert !== 'undefined') alert('已將內容複製到剪貼簿');
      } catch {
        if (typeof alert !== 'undefined')
          alert('分享失敗，請手動複製內容：\n' + fallbackText);
      }
    }
  }
}
