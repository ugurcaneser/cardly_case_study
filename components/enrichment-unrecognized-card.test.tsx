import { render, screen } from '@testing-library/react-native';

import type { EnrichOcrResult } from '@/src/types/enrichment';

import { EnrichmentUnrecognizedCard } from './enrichment-unrecognized-card';

const emptyOcr: EnrichOcrResult = { rawText: null, parsedName: null, parsedNumber: null };

describe('EnrichmentUnrecognizedCard', () => {
  it('renders the not-recognized heading and a reason-specific message', async () => {
    await render(
      <EnrichmentUnrecognizedCard previewUri="file:///tmp/photo.jpg" ocr={emptyOcr} reason="no_ocr_text" />
    );

    expect(screen.getByText('Card not recognized')).toBeTruthy();
    expect(screen.getByText(/couldn't read any text/i)).toBeTruthy();
  });

  it('shows a different message for each reason', async () => {
    const { rerender } = await render(
      <EnrichmentUnrecognizedCard previewUri={null} ocr={emptyOcr} reason="no_scryfall_match" />
    );
    expect(screen.getByText(/couldn't find a matching card/i)).toBeTruthy();

    await rerender(<EnrichmentUnrecognizedCard previewUri={null} ocr={emptyOcr} reason="scryfall_unavailable" />);
    expect(screen.getByText(/temporarily unavailable/i)).toBeTruthy();

    await rerender(<EnrichmentUnrecognizedCard previewUri={null} ocr={emptyOcr} reason="number_mismatch" />);
    expect(screen.getByText(/collector number didn't line up/i)).toBeTruthy();
  });

  it('shows the detected raw OCR text when present', async () => {
    await render(
      <EnrichmentUnrecognizedCard
        previewUri={null}
        ocr={{ rawText: 'Blurry Text\n133', parsedName: null, parsedNumber: null }}
        reason="no_scryfall_match"
      />
    );

    expect(screen.getByText('Detected text')).toBeTruthy();
    expect(screen.getByText('Blurry Text\n133')).toBeTruthy();
  });

  it('omits the detected-text block when there is no raw OCR text', async () => {
    await render(<EnrichmentUnrecognizedCard previewUri={null} ocr={emptyOcr} reason="no_ocr_text" />);

    expect(screen.queryByText('Detected text')).toBeNull();
  });
});
