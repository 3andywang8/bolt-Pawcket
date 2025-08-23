import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';

export default function SplashScreen() {
  const router = useRouter();

  // 初始化播放器，啟用自動播放且不重複
  const player = useVideoPlayer(require('../assets/logo.mp4'), (player) => {
    player.loop = false; // 播放完才會觸發結束
    player.muted = true; // 網頁自動播放策略需要靜音
    player.play(); // 自動播放
  });

  // 聚焦播放、失焦暫停
  useFocusEffect(
    useCallback(() => {
      player.play();
      return () => {
        player.pause();
      };
    }, [player])
  );

  // 影片播畢 1 秒後自動導向 /(tabs)
  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    });
    return () => sub.remove();
  }, [player, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredContent}>
        <VideoView
          style={styles.video}
          player={player}
          nativeControls={false} // 不顯示控制列
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          contentFit="cover" // 填滿容器
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: 206,
    height: 206,
  },
});
