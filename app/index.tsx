
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 300);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredContent}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={require('../assets/mp4.mov')}
          shouldPlay
          resizeMode="contain"
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
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
