import React from 'react';
import './style/Table.css'

export default function Table({ name, children }: { name: string; children: React.ReactNode }) {
    return (
        <div className='table'>
            <strong>{name}</strong>
            {children}
        </div>
    );
};
