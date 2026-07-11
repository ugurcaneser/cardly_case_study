import { render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

import SettingsScreen from '@/app/(tabs)/settings';

describe('SettingsScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('displays the persisted device id once it resolves', async () => {
    await render(<SettingsScreen />);

    await waitFor(() => expect(screen.queryByText('Loading…')).toBeNull());

    const id = await AsyncStorage.getItem('cardly-device-id');
    expect(id).toBeTruthy();
    expect(screen.getByText(id as string)).toBeTruthy();
  });
});
