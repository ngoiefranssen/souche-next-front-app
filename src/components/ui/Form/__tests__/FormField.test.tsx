import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from '../FormField';
import { Mail } from 'lucide-react';

describe('FormField', () => {
  describe('Rendering', () => {
    it('should render with label', () => {
      render(<FormField label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<FormField label="Email" placeholder="Enter your email" />);
      expect(
        screen.getByPlaceholderText('Enter your email')
      ).toBeInTheDocument();
    });

    it('should show required asterisk when required is true', () => {
      render(<FormField label="Email" required />);
      const label = screen.getByText('Email').parentElement;
      expect(label?.textContent).toContain('*');
    });

    it('should not show required asterisk when required is false', () => {
      render(<FormField label="Email" />);
      const label = screen.getByText('Email').parentElement;
      expect(label?.textContent).not.toContain('*');
    });

    it('should render with icon', () => {
      render(
        <FormField label="Email" icon={<Mail data-testid="mail-icon" />} />
      );
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });

    it('should apply icon padding when icon is present', () => {
      render(<FormField label="Email" icon={<Mail />} />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass('pl-10');
    });

    it('should not apply icon padding when icon is not present', () => {
      render(<FormField label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).not.toHaveClass('pl-10');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error prop is provided', () => {
      render(<FormField label="Email" error="Email is required" />);
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('should have error styles when error is present', () => {
      render(<FormField label="Email" error="Email is required" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass('border-red-500', 'focus:ring-red-500');
    });

    it('should not have error styles when error is not present', () => {
      render(<FormField label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass('border-gray-300', 'focus:ring-[#2B6A8E]');
    });

    it('should hide helper text when error is present', () => {
      render(
        <FormField
          label="Email"
          helperText="Enter a valid email"
          error="Email is required"
        />
      );
      expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('should display helper text when provided', () => {
      render(<FormField label="Email" helperText="Enter a valid email" />);
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    });

    it('should have correct styling for helper text', () => {
      render(<FormField label="Email" helperText="Enter a valid email" />);
      const helperText = screen.getByText('Enter a valid email');
      expect(helperText).toHaveClass('text-sm', 'text-gray-500');
    });
  });

  describe('Interactions', () => {
    it('should call onChange when input value changes', () => {
      const onChange = jest.fn();
      render(<FormField label="Email" onChange={onChange} />);

      const input = screen.getByLabelText('Email');
      fireEvent.change(input, { target: { value: 'test@example.com' } });

      expect(onChange).toHaveBeenCalled();
    });

    it('should update input value', () => {
      render(<FormField label="Email" />);
      const input = screen.getByLabelText('Email') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      expect(input.value).toBe('test@example.com');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<FormField label="Email" disabled />);
      const input = screen.getByLabelText('Email');
      expect(input).toBeDisabled();
    });

    it('should have disabled styles when disabled', () => {
      render(<FormField label="Email" disabled />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass(
        'disabled:bg-gray-100',
        'disabled:cursor-not-allowed'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have correct id attribute', () => {
      render(<FormField label="Email Address" />);
      const input = screen.getByLabelText('Email Address');
      expect(input).toHaveAttribute('id', 'field-email-address');
    });

    it('should use custom id when provided', () => {
      render(<FormField label="Email" id="custom-email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'custom-email');
    });

    it('should have aria-invalid when error is present', () => {
      render(<FormField label="Email" error="Email is required" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not have aria-invalid when error is not present', () => {
      render(<FormField label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-describedby pointing to error when error is present', () => {
      render(<FormField label="Email" error="Email is required" />);
      const input = screen.getByLabelText('Email');
      const errorId = input.getAttribute('aria-describedby');

      expect(errorId).toBeTruthy();
      expect(screen.getByText('Email is required')).toHaveAttribute(
        'id',
        errorId!
      );
    });

    it('should have aria-describedby pointing to helper text when no error', () => {
      render(<FormField label="Email" helperText="Enter a valid email" />);
      const input = screen.getByLabelText('Email');
      const helperId = input.getAttribute('aria-describedby');

      expect(helperId).toBeTruthy();
      expect(screen.getByText('Enter a valid email')).toHaveAttribute(
        'id',
        helperId!
      );
    });

    it('should have role="alert" on error message', () => {
      render(<FormField label="Email" error="Email is required" />);
      const errorMessage = screen.getByText('Email is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should associate label with input', () => {
      render(<FormField label="Email" />);
      const label = screen.getByText('Email');
      const input = screen.getByLabelText('Email');

      expect(label).toHaveAttribute('for', input.id);
    });
  });

  describe('Input Types', () => {
    it('should support different input types', () => {
      const { rerender } = render(<FormField label="Email" type="email" />);
      let input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('type', 'email');

      rerender(<FormField label="Password" type="password" />);
      input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');

      rerender(<FormField label="Number" type="number" />);
      input = screen.getByLabelText('Number');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<FormField label="Email" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe('INPUT');
    });
  });
});
