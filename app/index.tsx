import React from 'react';
import { Button, Platform, View } from 'react-native';
import { AdEventType, RewardedAd, TestIds } from 'react-native-google-mobile-ads';
import { RewardedAdEventType } from 'react-native-google-mobile-ads/src';

const Page = () => {
  const [loading, setLoading] = React.useState(false);

  const handleShowRewarded = async () => {
    console.log('Show rewarded button pressed');
    setLoading(true);
    try {
      // For testing, we'll skip the consent check
      console.log('Creating rewarded ad request with test ID...');
      const rewarded = RewardedAd.createForAdRequest(TestIds.REWARDED, {
        // Add server-side verification options if needed
        serverSideVerificationOptions: {
          userId: 'user123',
        },
      });

      // Handle ad loaded
      const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('Rewarded ad loaded, showing ad...');
        // On iOS, we need to ensure the ad is presented modally
        if (Platform.OS === 'ios') {
          rewarded.show({
            immersiveModeEnabled: true,
            // Add any additional presentation options if needed
          });
        } else {
          rewarded.show();
        }
        setLoading(false);
        unsubscribeLoaded();
      });
      
      // Handle ad closed
      const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Rewarded ad closed');
        setLoading(false);
        unsubscribeClosed();
      });

      // Handle reward earned
      const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        console.log('User earned reward:', reward);
        unsubscribeEarned();
      });
      
      // Add error listener
      rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('Rewarded ad error:', error);
        setLoading(false);
      });

      console.log('Loading rewarded ad...');
      rewarded.load();
    } catch (error) {
      console.log('Error creating rewarded ad:', error);
      setLoading(false);
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button disabled={loading} onPress={handleShowRewarded} title="Show rewarded"/>
    </View>
  )
}

export default Page;
