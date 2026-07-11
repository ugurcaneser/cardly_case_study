import { Redirect } from 'expo-router';

// This tab's own screen is unreachable in normal use — the "scan" tab's
// tabPress listener in _layout.tsx intercepts the press and pushes /capture
// directly instead of switching to this tab. (Letting this screen itself
// mount and redirect would turn closing the capture modal into a loop back
// into this tab, since /capture lives in the root stack, not this one.) This
// redirect is just a defensive fallback in case the route is ever reached
// some other way (e.g. a deep link).
export default function ScanTabRedirect() {
  return <Redirect href="/capture" />;
}
