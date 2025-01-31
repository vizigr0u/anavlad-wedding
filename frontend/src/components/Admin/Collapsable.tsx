import './style/Collapsable.css'

import { useState } from 'react';

interface CollapsableProps {
  title: string;
  children: React.ReactNode;
  styleNames?: string;
}

export default function Collapsable({ title, children, styleNames = '' }: CollapsableProps) {
  const [collapsed, setCollapsed] = useState(true);
  const buttonText = (title ?? '');
  const classNames = 'collapse-button ' + (collapsed ? 'collapse-button__collapsed ' : 'collapse-button__expanded ') + styleNames;
  return (
    <>
      <button className={classNames} onClick={() => setCollapsed(!collapsed)}>{buttonText}</button>
      {collapsed || <div className='collapse-content'>{children}</div>}
    </>
  );
}
