import { Redirect } from 'expo-router';

// This is the "Scan" tab's screen — it has no content of its own, it just
// immediately redirects to the capture modal as soon as the tab is pressed.
export default function ScanTabRedirect() {
  return <Redirect href="/capture" />;
}
