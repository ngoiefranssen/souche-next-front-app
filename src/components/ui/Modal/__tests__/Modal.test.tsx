import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = 'unset';
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render with correct size classes', () => {
      const { rerender } = render(<Modal {...defaultProps} size="sm" />);
      let dialog = screen.getByRole('dialog').firstChild as HTMLElement;
      expect(dialog).toHaveClass('max-w-md');

      rerender(<Modal {...defaultProps} size="lg" />);
      dialog = screen.getByRole('dialog').firstChild as HTMLElement;
      expect(dialog).toHaveClass('max-w-2xl');

      rerender(<Modal {...defaultProps} size="xl" />);
      dialog = screen.getByRole('dialog').firstChild as HTMLElement;
      expect(dialog).toHaveClass('max-w-4xl');
    });

    it('should show close button by default', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByLabelText('Fermer')).toBeInTheDocument();
    });

    it('should hide close button when showCloseButton is false', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByLabelText('Fermer')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByLabelText('Fermer'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when other keys are pressed', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when overlay is clicked and closeOnOverlayClick is true', () => {
      const onClose = jest.fn();
      render(
        <Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={true} />
      );

      const overlay = screen.getByRole('dialog');
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when overlay is clicked and closeOnOverlayClick is false', () => {
      const onClose = jest.fn();
      render(
        <Modal
          {...defaultProps}
          onClose={onClose}
          closeOnOverlayClick={false}
        />
      );

      const overlay = screen.getByRole('dialog');
      fireEvent.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when modal content is clicked', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Modal Content'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Blocking', () => {
    it('should block body scroll when modal is open', () => {
      render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal is closed', () => {
      const { rerender } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('unset');
    });

    it('should restore body scroll when component unmounts', () => {
      const { unmount } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');

      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have accessible title', () => {
      render(<Modal {...defaultProps} />);
      const title = screen.getByText('Test Modal');

      expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('should have accessible close button', () => {
      render(<Modal {...defaultProps} />);
      const closeButton = screen.getByLabelText('Fermer');

      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe('BUTTON');
    });
  });
});
