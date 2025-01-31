import React from 'react';
import './style/FlippableCard.css'

interface FlippableCardProps { show: boolean, children: React.ReactNode, styleName: string };

export default React.forwardRef<HTMLDivElement, FlippableCardProps>(({ show, children, styleName }, ref) => {
    const baseClassName = 'flippable-card';
    const customClassName = styleName ? baseClassName + '__' + styleName : '';
    const classes = baseClassName + ' ' + customClassName + (show ? '' : ` ${baseClassName}__hidden`)
    return (
        <div ref={ref} className={classes}>
            <div className={baseClassName + '__content-container'}>
                {children}
            </div>
        </div>
    );
});
