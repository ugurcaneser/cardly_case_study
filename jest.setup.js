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
