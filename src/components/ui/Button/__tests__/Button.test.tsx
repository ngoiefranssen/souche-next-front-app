import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Plus } from 'lucide-react';

describe('Button', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      render(<Button>Click Me</Button>);
      expect(
        screen.getByRole('button', { name: 'Click Me' })
      ).toBeInTheDocument();
    });

    it('should render with primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[#356ca5]');
    });

    it('should render with different variants', () => {
      const { rerender } = render(
        <Button variant="secondary">Secondary</Button>
      );
      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200');

      rerender(<Button variant="danger">Danger</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');

      rerender(<Button variant="success">Success</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-700');

      rerender(<Button variant="ghost">Ghost</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });

    it('should render with different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');

      rerender(<Button size="md">Medium</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-base');
    });

    it('should render full width when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('should render with custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Icon Support', () => {
    it('should render icon on the left by default', () => {
      render(<Button icon={<Plus data-testid="icon" />}>With Icon</Button>);

      const button = screen.getByRole('button');
      const icon = screen.getByTestId('icon');

      expect(icon).toBeInTheDocument();
      // Icon should appear before the text
      screen.getByText('With Icon');
      const iconParent = icon.parentElement;
      expect(button.contains(iconParent)).toBe(true);
    });

    it('should render icon on the right when iconPosition is right', () => {
      render(
        <Button icon={<Plus data-testid="icon" />} iconPosition="right">
          With Icon
        </Button>
      );

      const button = screen.getByRole('button');
      const icon = screen.getByTestId('icon');

      expect(icon).toBeInTheDocument();
      // Icon should appear after the text
      const iconParent = icon.parentElement;
      expect(button.contains(iconParent)).toBe(true);
    });

    it('should not render icon when loading', () => {
      render(
        <Button icon={<Plus data-testid="icon" />} loading>
          Loading
        </Button>
      );

      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show spinner when loading is true', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');

      // Check for spinner SVG
      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should still show children text when loading', () => {
      render(<Button loading>Loading Text</Button>);
      expect(screen.getByText('Loading Text')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should have disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'disabled:opacity-50',
        'disabled:cursor-not-allowed'
      );
    });

    it('should not call onClick when disabled', () => {
      const onClick = jest.fn();
      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const onClick = jest.fn();
      render(
        <Button loading onClick={onClick}>
          Loading
        </Button>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should pass through other button props', () => {
      const onMouseEnter = jest.fn();
      render(
        <Button onMouseEnter={onMouseEnter} type="submit">
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');

      fireEvent.mouseEnter(button);
      expect(onMouseEnter).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Custom Label">Button</Button>);
      expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
    });

    it('should have focus styles', () => {
      render(<Button>Focus Me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2'
      );
    });
  });
});
