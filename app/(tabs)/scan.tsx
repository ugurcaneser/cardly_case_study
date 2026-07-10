import { Redirect } from 'expo-router';

// This tab's own screen is unreachable in normal use — CaptureTabButton
// (this tab's custom tabBarButton) always intercepts the press and opens
// /capture directly instead of switching to this tab. The redirect here is
// just a defensive fallback in case this route is ever reached some other way
// (e.g. a deep link).
export default function ScanTabRedirect() {
  return <Redirect href="/capture" />;
}
