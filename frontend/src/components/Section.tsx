import React, { useState } from 'react';
import './style/Section.css';

export default function Section({ title, children, styleName, startExpanded = true }:
    { title: string, children: React.ReactNode, styleName: string, startExpanded?: boolean }) {
    const [expanded, setExpanded] = useState(startExpanded);
    const headerCollapsedStyle = expanded ? '' : 'section__header--collapsed ';
    const contentCollapsedStyle = expanded ? '' : 'section__content--collapsed ';
    const buttonCollapsedStyle = expanded ? '' : ' section-collapse-button--collapsed ';
    const iconCollapsedStyle = expanded ? '' : ' section-collapse-icon--collapsed ';
    return (
        <section className={styleName + '-section'} id={styleName + '-section'}>
            <button className={'section-collapse-button ' + buttonCollapsedStyle} onClick={() => setExpanded(!expanded)}>
                <div className={'section__header ' + headerCollapsedStyle + styleName + '-section__header'} onClick={() => setExpanded(!expanded)}>
                    <div className={'section__icon ' + styleName + '-section__icon'}></div>
                    <h2 className={'section__title ' + styleName + '-section__title'}>{title}</h2>
                </div>
                <div className={'section-collapse-icon' + iconCollapsedStyle} />
            </button>
            <div className={'section__content ' + contentCollapsedStyle + styleName + '-section__content'}>
                {children}
            </div>
        </section>
    );
}
