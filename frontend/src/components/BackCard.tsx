import React from 'react';
import './style/BackCard.css'
import { WeddingData } from '../types';

interface BackCardProps { weddingData: WeddingData, children: React.ReactNode };

export default React.forwardRef<HTMLDivElement, BackCardProps>(({ weddingData, children }, ref) => {
    return (
        <div ref={ref} className="back-card">
            {children}
        </div>
    );
});
