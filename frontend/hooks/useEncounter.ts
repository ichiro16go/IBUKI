import { useEffect } from 'react';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

export const useEncounter = (userId: string) => {
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('位置情報の許可がありません');
        return;
      }

      interval = setInterval(async () => {
        const location = await Location.getCurrentPositionAsync({});

        const { data, error } = await supabase.functions.invoke('encounter', {
          body: {
            user_id: userId,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        });

        if (error) console.error(error);
        if (data?.encounters?.length > 0) {
          console.log('すれ違い発生!', data.encounters);
          // ここで通知やUIの更新を行う
        }
      },9000);
    };

    start();

    return () => clearInterval(interval);
  }, [userId]);
};