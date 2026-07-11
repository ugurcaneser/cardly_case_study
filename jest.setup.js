// Every API call now reads a device id via AsyncStorage (src/services/device/deviceId.ts),
// so this is a transitive dependency of nearly every screen/hook test, not
// just the files that use AsyncStorage directly. The upstream package ships
// its own jest mock, but its methods are jest.fn()-wrapped - the same
// resetAllMocks() footgun documented below for safe-area-context silently
// wipes its implementation the first time any test in a file calls
// jest.resetAllMocks(), making every later getItem/setItem in that file a
// no-op. Plain functions backed by an object aren't touched by resetAllMocks.
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    getItem: async (key) => (key in store ? store[key] : null),
    setItem: async (key, value) => {
      store[key] = value;
    },
    removeItem: async (key) => {
      delete store[key];
    },
    clear: async () => {
      store = {};
    },
  };
});

// The library's own jest/mock.tsx implements useSafeAreaInsets/useSafeAreaFrame
// with jest.fn(...) - since nearly every test file's beforeEach calls
// jest.resetAllMocks(), that wipes the mock's implementation (not just this
// file's own mocks) after the first test, making the hook return undefined.
// A plain-function mock isn't a jest.fn(), so resetAllMocks can't touch it.
jest.mock('react-native-safe-area-context', () => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 320, height: 640 };

  return {
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets, frame },
  };
});
