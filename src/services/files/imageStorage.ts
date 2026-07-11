import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const CARDS_DIR_NAME = 'cards';
const DISPLAY_MAX_WIDTH = 1600;
const THUMBNAIL_MAX_WIDTH = 200;

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
