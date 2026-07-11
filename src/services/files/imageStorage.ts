import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const CARDS_DIR_NAME = 'cards';
const DISPLAY_MAX_WIDTH = 1600;
const THUMBNAIL_MAX_WIDTH = 200;
// OCR.space's free-tier API key rejects uploads over 1.5MB (E556). A raw
// camera capture routinely lands at 4-8MB, so /enrich needs its own smaller,
// lower-quality copy — separate from the 1600px display copy stored on save.
const UPLOAD_MAX_WIDTH = 1200;
const UPLOAD_COMPRESS_QUALITY = 0.5;

export type StoredCardImage = {
  /** Persisted file:// URI of the compressed display-resolution copy. */
  localUri: string;
  /** Small compressed thumbnail, base64-encoded (no data: prefix) — sized to travel to the backend as `thumbnail_base64`. */
  thumbnailBase64: string;
};

function getCardsDirectory(): Directory {
  const directory = new Directory(Paths.document, CARDS_DIR_NAME);
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return directory;
}

function generateFileName(extension: string): string {
  const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `card-${uniquePart}.${extension}`;
}

/**
 * Persists a compressed, display-resolution copy of a picked/captured photo
 * into app storage, and produces a small base64 thumbnail alongside it.
 */
export async function storeCardImage(pickedUri: string): Promise<StoredCardImage> {
  const displayImage = await ImageManipulator.manipulate(pickedUri)
    .resize({ width: DISPLAY_MAX_WIDTH })
    .renderAsync();
  const displayResult = await displayImage.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });

  const destinationFile = new File(getCardsDirectory(), generateFileName('jpg'));
  new File(displayResult.uri).copy(destinationFile);

  const thumbnailImage = await ImageManipulator.manipulate(pickedUri)
    .resize({ width: THUMBNAIL_MAX_WIDTH })
    .renderAsync();
  const thumbnailResult = await thumbnailImage.saveAsync({
    compress: 0.5,
    format: SaveFormat.JPEG,
    base64: true,
  });

  if (!thumbnailResult.base64) {
    throw new Error('Failed to generate a thumbnail for the captured image');
  }

  return {
    localUri: destinationFile.uri,
    thumbnailBase64: thumbnailResult.base64,
  };
}

/**
 * Produces a small, low-quality copy of a picked/captured photo suited to
 * OCR upload — kept well under OCR.space's free-tier 1.5MB request limit.
 * Result lives in the cache dir; callers don't need to clean it up.
 */
export async function prepareImageForUpload(pickedUri: string): Promise<string> {
  const uploadImage = await ImageManipulator.manipulate(pickedUri)
    .resize({ width: UPLOAD_MAX_WIDTH })
    .renderAsync();
  const uploadResult = await uploadImage.saveAsync({
    compress: UPLOAD_COMPRESS_QUALITY,
    format: SaveFormat.JPEG,
  });

  return uploadResult.uri;
}
