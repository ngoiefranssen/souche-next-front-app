import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '../Breadcrumb';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
  useLocale: jest.fn(),
}));

describe('Breadcrumb', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<
    typeof usePathname
  >;
  const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>;
  const mockUseTranslations = useTranslations as jest.MockedFunction<
    typeof useTranslations
  >;

  beforeEach(() => {
    mockUseLocale.mockReturnValue('en');
    mockUseTranslations.mockReturnValue((key: string) => {
      const translations: Record<string, string> = {
        home: 'Home',
        dashboard: 'Dashboard',
        users: 'Users',
        roles: 'Roles',
        profiles: 'Profiles',
        employmentStatus: 'Employment Status',
        permissions: 'Permissions',
        audit: 'Audit',
        rewards: 'Rewards',
        create: 'Create',
        edit: 'Edit',
        assign: 'Assign',
      };
      return translations[key] || key;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render on dashboard root', () => {
    mockUsePathname.mockReturnValue('/en/dashboard');
    const { container } = render(<Breadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it('should render breadcrumb for users page', () => {
    mockUsePathname.mockReturnValue('/en/settings/users');
    render(<Breadcrumb />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
  });

  it('should render breadcrumb for users create page', () => {
    mockUsePathname.mockReturnValue('/en/settings/users/create');
    render(<Breadcrumb />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('should render breadcrumb for employment status page', () => {
    mockUsePathname.mockReturnValue('/en/settings/employment-status');
    render(<Breadcrumb />);

    expect(screen.getByText('Employment Status')).toBeInTheDocument();
  });

  it('should make non-last segments clickable', () => {
    mockUsePathname.mockReturnValue('/en/settings/users/create');
    render(<Breadcrumb />);

    const usersLink = screen.getByText('Users').closest('a');
    expect(usersLink).toHaveAttribute('href', '/en/settings/users');
  });

  it('should not make last segment clickable', () => {
    mockUsePathname.mockReturnValue('/en/settings/users/create');
    render(<Breadcrumb />);

    const createSpan = screen.getByText('Create');
    expect(createSpan.tagName).toBe('SPAN');
    expect(createSpan).toHaveAttribute('aria-current', 'page');
  });

  it('should skip numeric segments (IDs)', () => {
    mockUsePathname.mockReturnValue('/en/settings/users/123/edit');
    render(<Breadcrumb />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('123')).not.toBeInTheDocument();
  });

  it('should render home icon with correct link', () => {
    mockUsePathname.mockReturnValue('/en/settings/users');
    render(<Breadcrumb />);

    const homeLink = screen.getByLabelText('Home');
    expect(homeLink).toHaveAttribute('href', '/en/dashboard');
  });

  it('should handle French locale', () => {
    mockUseLocale.mockReturnValue('fr');
    mockUseTranslations.mockReturnValue((key: string) => {
      const translations: Record<string, string> = {
        home: 'Accueil',
        dashboard: 'Tableau de bord',
        users: 'Utilisateurs',
        create: 'Créer',
      };
      return translations[key] || key;
    });
    mockUsePathname.mockReturnValue('/fr/settings/users/create');

    render(<Breadcrumb />);

    expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Créer')).toBeInTheDocument();
  });

  it('should fallback to a readable label when translation is missing', () => {
    mockUsePathname.mockReturnValue('/en/rewards/client-list');
    render(<Breadcrumb />);

    expect(screen.getByText('Client List')).toBeInTheDocument();
    expect(
      screen.queryByText('breadcrumb.client-list')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('clientList')).not.toBeInTheDocument();
  });

  it('should format malformed segments for display', () => {
    mockUsePathname.mockReturnValue('/en/rewards/client_list');
    render(<Breadcrumb />);
    expect(screen.getByText('Client List')).toBeInTheDocument();
  });

  it('should keep acronyms uppercase when fallback formatting is used', () => {
    mockUsePathname.mockReturnValue('/en/rewards/gprs_sms');
    render(<Breadcrumb />);
    expect(screen.getByText('GPRS SMS')).toBeInTheDocument();
  });

  it('should fallback when next-intl returns breadcrumb key path', () => {
    mockUseTranslations.mockReturnValue((key: string) => `breadcrumb.${key}`);
    mockUsePathname.mockReturnValue('/en/rewards/client-list');
    render(<Breadcrumb />);

    expect(screen.getByText('Client List')).toBeInTheDocument();
    expect(
      screen.queryByText('breadcrumb.client-list')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('breadcrumb.clientList')).not.toBeInTheDocument();
  });
});
