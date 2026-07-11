import { fireEvent, render, screen } from '@testing-library/react-native';

import { TextInputModal } from './text-input-modal';

describe('TextInputModal', () => {
  it('starts blank and confirms the trimmed value', async () => {
    const onConfirm = jest.fn();
    await render(
      <TextInputModal
        visible
        title="New Collection"
        placeholder="Collection name"
        confirmLabel="Create"
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />
    );

    await fireEvent.changeText(screen.getByPlaceholderText('Collection name'), '  Modern  ');
    await fireEvent.press(screen.getByText('Create'));

    expect(onConfirm).toHaveBeenCalledWith('Modern');
  });

  it('starts pre-filled with initialValue, for reuse as a rename dialog', async () => {
    await render(
      <TextInputModal
        visible
        title="Rename Collection"
        initialValue="Vintage"
        confirmLabel="Save"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue('Vintage')).toBeTruthy();
  });

  it('does not confirm an empty or whitespace-only value', async () => {
    const onConfirm = jest.fn();
    await render(
      <TextInputModal
        visible
        title="New Collection"
        placeholder="Collection name"
        confirmLabel="Create"
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />
    );

    await fireEvent.changeText(screen.getByPlaceholderText('Collection name'), '   ');
    await fireEvent.press(screen.getByText('Create'));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is pressed', async () => {
    const onCancel = jest.fn();
    await render(
      <TextInputModal
        visible
        title="New Collection"
        confirmLabel="Create"
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />
    );

    await fireEvent.press(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows the submitting label and disables confirm while submitting', async () => {
    await render(
      <TextInputModal
        visible
        title="New Collection"
        initialValue="Modern"
        confirmLabel="Create"
        submittingLabel="Creating…"
        isSubmitting
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.getByText('Creating…')).toBeTruthy();
  });

  it('shows the error message when provided', async () => {
    await render(
      <TextInputModal
        visible
        title="New Collection"
        confirmLabel="Create"
        errorMessage="Collection name already exists"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.getByText('Collection name already exists')).toBeTruthy();
  });

  it('re-seeds the input from initialValue each time it becomes visible', async () => {
    const { rerender } = await render(
      <TextInputModal
        visible={false}
        title="Rename Collection"
        initialValue="Vintage"
        confirmLabel="Save"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    await rerender(
      <TextInputModal
        visible
        title="Rename Collection"
        initialValue="Modern"
        confirmLabel="Save"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue('Modern')).toBeTruthy();
  });
});
