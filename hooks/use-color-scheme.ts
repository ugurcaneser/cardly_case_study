// Cardly ships a single, fixed light UI style — the app does not follow the
// system light/dark setting. Keeping this as a hook (rather than inlining
// 'light' everywhere) means every existing call site keeps working unchanged.
export function useColorScheme(): 'light' {
  return 'light';
}
