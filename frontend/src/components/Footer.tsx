import React from 'react';
import './style/Footer.css';

export default function Footer({ children }: { children: React.ReactNode }) {
    return (
        <footer>
            {children}
        </footer>
    );
}
