import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  describe('Rendering', () => {
    it('should render a single skeleton by default', () => {
      const { container } = render(<Skeleton />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(1);
    });

    it('should render multiple skeletons when count is specified', () => {
      const { container } = render(<Skeleton count={3} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('should render with text variant by default', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('rounded');
    });

    it('should render with different variants', () => {
      const { container, rerender } = render(<Skeleton variant="text" />);
      let skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('rounded');

      rerender(<Skeleton variant="circular" />);
      skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('rounded-full');

      rerender(<Skeleton variant="rectangular" />);
      skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('rounded-lg');
    });

    it('should render with custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('custom-class');
    });
  });

  describe('Dimensions', () => {
    it('should apply custom width as number', () => {
      const { container } = render(<Skeleton width={200} />);
      const skeleton = container.querySelector('.animate-pulse') as HTMLElement;
      expect(skeleton.style.width).toBe('200px');
    });

    it('should apply custom width as string', () => {
      const { container } = render(<Skeleton width="50%" />);
      const skeleton = container.querySelector('.animate-pulse') as HTMLElement;
      expect(skeleton.style.width).toBe('50%');
    });

    it('should apply custom height as number', () => {
      const { container } = render(<Skeleton height={100} />);
      const skeleton = container.querySelector('.animate-pulse') as HTMLElement;
      expect(skeleton.style.height).toBe('100px');
    });

    it('should apply custom height as string', () => {
      const { container } = render(<Skeleton height="2rem" />);
      const skeleton = container.querySelector('.animate-pulse') as HTMLElement;
      expect(skeleton.style.height).toBe('2rem');
    });

    it('should have default height for text variant', () => {
      const { container } = render(<Skeleton variant="text" />);
      const skeleton = container.querySelector('.animate-pulse') as HTMLElement;
      expect(skeleton.style.height).toBe('1rem');
    });

    it('should use width for height in circular variant when height not specified', () => {
      const { container } = render(<Skeleton variant="circular" width={50} />);
      const skeleton = container.querySelector('.animate-pulse') as HTMLElement;
      expect(skeleton.style.width).toBe('50px');
      expect(skeleton.style.height).toBe('50px');
    });

    it('should use default dimensions for circular variant when width not specified', () => {
      const { container } = render(<Skeleton variant="circular" />);
      const skeleton = container.querySelector('.animate-pulse') as HTMLElement;
      expect(skeleton.style.width).toBe('3rem');
      expect(skeleton.style.height).toBe('3rem');
    });
  });

  describe('Multiple Skeletons', () => {
    it('should wrap multiple skeletons in a container with spacing', () => {
      const { container } = render(<Skeleton count={3} />);
      const wrapper = container.querySelector('.space-y-2');
      expect(wrapper).toBeInTheDocument();
    });

    it('should render correct number of skeletons', () => {
      const { container } = render(<Skeleton count={5} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(5);
    });

    it('should apply same props to all skeletons', () => {
      const { container } = render(
        <Skeleton count={3} variant="circular" width={40} />
      );
      const skeletons = container.querySelectorAll('.animate-pulse');

      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('rounded-full');
        expect((skeleton as HTMLElement).style.width).toBe('40px');
      });
    });
  });

  describe('Styling', () => {
    it('should have animate-pulse class', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should have bg-gray-200 class', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('bg-gray-200');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden attribute', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have aria-hidden on all skeletons when count > 1', () => {
      const { container } = render(<Skeleton count={3} />);
      const skeletons = container.querySelectorAll('.animate-pulse');

      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});
