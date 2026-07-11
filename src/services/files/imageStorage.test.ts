import { storeCardImage } from './imageStorage';

const mockManipulate = jest.fn();
const mockDirectoryCreate = jest.fn();
const mockFileCopy = jest.fn();

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: (uri: string) => mockManipulate(uri) },
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-file-system', () => {
  class MockDirectory {
    uri = 'file:///document/cards';
    exists = false;
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
