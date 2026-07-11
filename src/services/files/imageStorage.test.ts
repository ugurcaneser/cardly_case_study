import { storeCardImage } from './imageStorage';

const mockManipulate = jest.fn();
const mockDirectoryCreate = jest.fn();
const mockFileCopy = jest.fn();
// Mutable so a test can simulate the cards directory already existing -
// reset in beforeEach so that's opt-in per test, not a leaked global.
let mockDirectoryExists = false;

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: (uri: string) => mockManipulate(uri) },
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-file-system', () => {
  class MockDirectory {
    uri = 'file:///document/cards';
    get exists() {
      return mockDirectoryExists;
    }
    create(...args: unknown[]) {
      mockDirectoryCreate(...args);
    }
  }
  class MockFile {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = typeof parts[0] === 'string' ? parts[0] : 'file:///document/cards/mock-generated.jpg';
    }
    copy(destination: { uri: string }) {
      mockFileCopy(this.uri, destination.uri);
    }
  }
  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { document: 'file:///document' },
  };
});

function mockManipulationStep(width: number, saveResult: { uri: string; width: number; height: number; base64?: string }) {
  return () => ({
    resize: (size: { width: number }) => {
      expect(size).toEqual({ width });
      return { renderAsync: async () => ({ saveAsync: async () => saveResult }) };
    },
  });
}

describe('storeCardImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDirectoryExists = false;
  });

  it('ensures the cards directory exists', async () => {
    mockManipulate
      .mockImplementationOnce(
        mockManipulationStep(1600, { uri: 'file:///cache/display.jpg', width: 1600, height: 1200 })
      )
      .mockImplementationOnce(
        mockManipulationStep(200, {
          uri: 'file:///cache/thumb.jpg',
          width: 200,
          height: 150,
          base64: 'BASE64DATA',
        })
      );

    await storeCardImage('file:///picked/photo.jpg');

    expect(mockDirectoryCreate).toHaveBeenCalledWith({ intermediates: true, idempotent: true });
  });

  it('does not recreate the cards directory when it already exists', async () => {
    mockDirectoryExists = true;
    mockManipulate
      .mockImplementationOnce(
        mockManipulationStep(1600, { uri: 'file:///cache/display.jpg', width: 1600, height: 1200 })
      )
      .mockImplementationOnce(
        mockManipulationStep(200, {
          uri: 'file:///cache/thumb.jpg',
          width: 200,
          height: 150,
          base64: 'BASE64DATA',
        })
      );

    await storeCardImage('file:///picked/photo.jpg');

    expect(mockDirectoryCreate).not.toHaveBeenCalled();
  });

  it('resizes a 1600px display copy and a 200px thumbnail, persisting the display copy', async () => {
    mockManipulate
      .mockImplementationOnce(
        mockManipulationStep(1600, { uri: 'file:///cache/display.jpg', width: 1600, height: 1200 })
      )
      .mockImplementationOnce(
        mockManipulationStep(200, {
          uri: 'file:///cache/thumb.jpg',
          width: 200,
          height: 150,
          base64: 'BASE64DATA',
        })
      );

    const result = await storeCardImage('file:///picked/photo.jpg');

    expect(mockFileCopy).toHaveBeenCalledWith(
      'file:///cache/display.jpg',
      'file:///document/cards/mock-generated.jpg'
    );
    expect(result).toEqual({
      localUri: 'file:///document/cards/mock-generated.jpg',
      thumbnailBase64: 'BASE64DATA',
    });
  });

  it('throws when the thumbnail step has no base64 data', async () => {
    mockManipulate
      .mockImplementationOnce(
        mockManipulationStep(1600, { uri: 'file:///cache/display.jpg', width: 1600, height: 1200 })
      )
      .mockImplementationOnce(
        mockManipulationStep(200, { uri: 'file:///cache/thumb.jpg', width: 200, height: 150 })
      );

    await expect(storeCardImage('file:///picked/photo.jpg')).rejects.toThrow(
      'Failed to generate a thumbnail for the captured image'
    );
  });
});
