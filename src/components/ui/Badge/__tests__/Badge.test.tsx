import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render with neutral variant by default', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass(
        'bg-gray-100',
        'text-gray-800',
        'border-gray-200'
      );
    });

    it('should render with different variants', () => {
      const { rerender } = render(<Badge variant="success">Success</Badge>);
      let badge = screen.getByText('Success');
      expect(badge).toHaveClass(
        'bg-green-100',
        'text-green-800',
        'border-green-200'
      );

      rerender(<Badge variant="warning">Warning</Badge>);
      badge = screen.getByText('Warning');
      expect(badge).toHaveClass(
        'bg-yellow-100',
        'text-yellow-800',
        'border-yellow-200'
      );

      rerender(<Badge variant="danger">Danger</Badge>);
      badge = screen.getByText('Danger');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200');

      rerender(<Badge variant="info">Info</Badge>);
      badge = screen.getByText('Info');
      expect(badge).toHaveClass(
        'bg-blue-100',
        'text-blue-800',
        'border-blue-200'
      );
    });

    it('should render with different sizes', () => {
      const { rerender } = render(<Badge size="sm">Small</Badge>);
      let badge = screen.getByText('Small');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');

      rerender(<Badge size="md">Medium</Badge>);
      badge = screen.getByText('Medium');
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');

      rerender(<Badge size="lg">Large</Badge>);
      badge = screen.getByText('Large');
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-base');
    });

    it('should render with custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Dot Indicator', () => {
    it('should not show dot by default', () => {
      render(<Badge>No Dot</Badge>);
      const badge = screen.getByText('No Dot');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).not.toBeInTheDocument();
    });

    it('should show dot when dot prop is true', () => {
      render(<Badge dot>With Dot</Badge>);
      const badge = screen.getByText('With Dot');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with correct color for success variant', () => {
      render(
        <Badge variant="success" dot>
          Success
        </Badge>
      );
      const badge = screen.getByText('Success');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass('bg-green-500');
    });

    it('should render dot with correct color for warning variant', () => {
      render(
        <Badge variant="warning" dot>
          Warning
        </Badge>
      );
      const badge = screen.getByText('Warning');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass('bg-yellow-500');
    });

    it('should render dot with correct color for danger variant', () => {
      render(
        <Badge variant="danger" dot>
          Danger
        </Badge>
      );
      const badge = screen.getByText('Danger');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass('bg-red-500');
    });

    it('should render dot with correct color for info variant', () => {
      render(
        <Badge variant="info" dot>
          Info
        </Badge>
      );
      const badge = screen.getByText('Info');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass('bg-blue-500');
    });

    it('should render dot with correct color for neutral variant', () => {
      render(
        <Badge variant="neutral" dot>
          Neutral
        </Badge>
      );
      const badge = screen.getByText('Neutral');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass('bg-gray-500');
    });

    it('should render dot with correct size for small badge', () => {
      render(
        <Badge size="sm" dot>
          Small
        </Badge>
      );
      const badge = screen.getByText('Small');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass('w-1.5', 'h-1.5');
    });

    it('should render dot with correct size for medium badge', () => {
      render(
        <Badge size="md" dot>
          Medium
        </Badge>
      );
      const badge = screen.getByText('Medium');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass('w-2', 'h-2');
    });

    it('should render dot with correct size for large badge', () => {
      render(
        <Badge size="lg" dot>
          Large
        </Badge>
      );
      const badge = screen.getByText('Large');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass('w-2.5', 'h-2.5');
    });
  });

  describe('Styling', () => {
    it('should have rounded-full class', () => {
      render(<Badge>Rounded</Badge>);
      const badge = screen.getByText('Rounded');
      expect(badge).toHaveClass('rounded-full');
    });

    it('should have border class', () => {
      render(<Badge>Border</Badge>);
      const badge = screen.getByText('Border');
      expect(badge).toHaveClass('border');
    });

    it('should have inline-flex class', () => {
      render(<Badge>Inline</Badge>);
      const badge = screen.getByText('Inline');
      expect(badge).toHaveClass('inline-flex');
    });

    it('should have items-center class', () => {
      render(<Badge>Centered</Badge>);
      const badge = screen.getByText('Centered');
      expect(badge).toHaveClass('items-center');
    });
  });

  describe('Accessibility', () => {
    it('should render as span element', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge.tagName).toBe('SPAN');
    });

    it('should have aria-hidden on dot indicator', () => {
      render(<Badge dot>With Dot</Badge>);
      const badge = screen.getByText('With Dot');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
