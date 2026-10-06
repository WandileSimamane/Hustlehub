// src/components/Login.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Login from './Login';

describe('Login Component', () => {
    it('renders the login form elements', () => {
        render(<Login />);
        expect(screen.getByPlaceholderText('Email Address')).toBeDefined();
        expect(screen.getByPlaceholderText('Password')).toBeDefined();
        expect(screen.getByRole('button', { name: /login/i })).toBeDefined();
    });

    it('updates input values when the user types', () => {
        render(<Login />);
        const emailInput = screen.getByPlaceholderText('Email Address');
        fireEvent.change(emailInput, { target: { value: 'test@hustlehub.com' } });
        expect(emailInput.value).toBe('test@hustlehub.com');
    });
});