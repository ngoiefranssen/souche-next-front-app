import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormSelect } from '../FormSelect';

describe('FormSelect', () => {
  const mockOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  describe('Rendering', () => {
    it('should render with label', () => {
      render(<FormSelect label="Select Option" options={mockOptions} />);
      expect(screen.getByLabelText('Select Option')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(<FormSelect label="Select Option" options={mockOptions} />);

      mockOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it('should render placeholder option when placeholder is provided', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          placeholder="Choose an option"
        />
      );
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('should make placeholder option disabled', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          placeholder="Choose an option"
        />
      );
      const placeholderOption = screen.getByText(
        'Choose an option'
      ) as HTMLOptionElement;
      expect(placeholderOption).toBeDisabled();
    });

    it('should show required asterisk when required is true', () => {
      render(
        <FormSelect label="Select Option" options={mockOptions} required />
      );
      const label = screen.getByText('Select Option').parentElement;
      expect(label?.textContent).toContain('*');
    });

    it('should render chevron icon', () => {
      const { container } = render(
        <FormSelect label="Select Option" options={mockOptions} />
      );
      const chevron = container.querySelector('svg');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error prop is provided', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          error="Selection is required"
        />
      );
      expect(screen.getByText('Selection is required')).toBeInTheDocument();
    });

    it('should have error styles when error is present', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          error="Selection is required"
        />
      );
      const select = screen.getByLabelText('Select Option');
      expect(select).toHaveClass('border-red-500', 'focus:ring-red-500');
    });

    it('should not have error styles when error is not present', () => {
      render(<FormSelect label="Select Option" options={mockOptions} />);
      const select = screen.getByLabelText('Select Option');
      expect(select).toHaveClass('border-gray-300', 'focus:ring-[#2B6A8E]');
    });

    it('should hide helper text when error is present', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          helperText="Choose one option"
          error="Selection is required"
        />
      );
      expect(screen.queryByText('Choose one option')).not.toBeInTheDocument();
      expect(screen.getByText('Selection is required')).toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('should display helper text when provided', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          helperText="Choose one option"
        />
      );
      expect(screen.getByText('Choose one option')).toBeInTheDocument();
    });

    it('should have correct styling for helper text', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          helperText="Choose one option"
        />
      );
      const helperText = screen.getByText('Choose one option');
      expect(helperText).toHaveClass('text-sm', 'text-gray-500');
    });
  });

  describe('Interactions', () => {
    it('should call onChange when selection changes', () => {
      const onChange = jest.fn();
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          onChange={onChange}
        />
      );

      const select = screen.getByLabelText('Select Option');
      fireEvent.change(select, { target: { value: '2' } });

      expect(onChange).toHaveBeenCalled();
    });

    it('should update select value', () => {
      render(<FormSelect label="Select Option" options={mockOptions} />);
      const select = screen.getByLabelText(
        'Select Option'
      ) as HTMLSelectElement;

      fireEvent.change(select, { target: { value: '2' } });
      expect(select.value).toBe('2');
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <FormSelect label="Select Option" options={mockOptions} disabled />
      );
      const select = screen.getByLabelText('Select Option');
      expect(select).toBeDisabled();
    });

    it('should have disabled styles when disabled', () => {
      render(
        <FormSelect label="Select Option" options={mockOptions} disabled />
      );
      const select = screen.getByLabelText('Select Option');
      expect(select).toHaveClass(
        'disabled:bg-gray-100',
        'disabled:cursor-not-allowed'
      );
    });
  });

  describe('Options with Different Value Types', () => {
    it('should handle numeric values', () => {
      const numericOptions = [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
        { label: 'Three', value: 3 },
      ];

      render(<FormSelect label="Select Number" options={numericOptions} />);

      const select = screen.getByLabelText(
        'Select Number'
      ) as HTMLSelectElement;
      const options = select.querySelectorAll('option');

      expect(options[0]).toHaveValue('1');
      expect(options[1]).toHaveValue('2');
      expect(options[2]).toHaveValue('3');
    });

    it('should handle string values', () => {
      const stringOptions = [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
      ];

      render(<FormSelect label="Select Color" options={stringOptions} />);

      const select = screen.getByLabelText('Select Color') as HTMLSelectElement;
      const options = select.querySelectorAll('option');

      expect(options[0]).toHaveValue('red');
      expect(options[1]).toHaveValue('blue');
      expect(options[2]).toHaveValue('green');
    });
  });

  describe('Accessibility', () => {
    it('should have correct id attribute', () => {
      render(<FormSelect label="Select Option" options={mockOptions} />);
      const select = screen.getByLabelText('Select Option');
      expect(select).toHaveAttribute('id', 'select-select-option');
    });

    it('should use custom id when provided', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          id="custom-select"
        />
      );
      const select = screen.getByLabelText('Select Option');
      expect(select).toHaveAttribute('id', 'custom-select');
    });

    it('should have aria-invalid when error is present', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          error="Selection is required"
        />
      );
      const select = screen.getByLabelText('Select Option');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not have aria-invalid when error is not present', () => {
      render(<FormSelect label="Select Option" options={mockOptions} />);
      const select = screen.getByLabelText('Select Option');
      expect(select).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-describedby pointing to error when error is present', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          error="Selection is required"
        />
      );
      const select = screen.getByLabelText('Select Option');
      const errorId = select.getAttribute('aria-describedby');

      expect(errorId).toBeTruthy();
      expect(screen.getByText('Selection is required')).toHaveAttribute(
        'id',
        errorId!
      );
    });

    it('should have aria-describedby pointing to helper text when no error', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          helperText="Choose one option"
        />
      );
      const select = screen.getByLabelText('Select Option');
      const helperId = select.getAttribute('aria-describedby');

      expect(helperId).toBeTruthy();
      expect(screen.getByText('Choose one option')).toHaveAttribute(
        'id',
        helperId!
      );
    });

    it('should have role="alert" on error message', () => {
      render(
        <FormSelect
          label="Select Option"
          options={mockOptions}
          error="Selection is required"
        />
      );
      const errorMessage = screen.getByText('Selection is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should associate label with select', () => {
      render(<FormSelect label="Select Option" options={mockOptions} />);
      const label = screen.getByText('Select Option');
      const select = screen.getByLabelText('Select Option');

      expect(label).toHaveAttribute('for', select.id);
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to select element', () => {
      const ref = React.createRef<HTMLSelectElement>();
      render(
        <FormSelect label="Select Option" options={mockOptions} ref={ref} />
      );

      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
      expect(ref.current?.tagName).toBe('SELECT');
    });
  });

  describe('Styling', () => {
    it('should have appearance-none class to remove default styling', () => {
      render(<FormSelect label="Select Option" options={mockOptions} />);
      const select = screen.getByLabelText('Select Option');
      expect(select).toHaveClass('appearance-none');
    });

    it('should have padding for chevron icon', () => {
      render(<FormSelect label="Select Option" options={mockOptions} />);
      const select = screen.getByLabelText('Select Option');
      expect(select).toHaveClass('pr-10');
    });
  });
});
