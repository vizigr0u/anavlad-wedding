import './style/HackerDropdownView.css'
import React, { useEffect, useState } from 'react';
import { MobileView } from 'react-device-detect';

// hidden content coming from top of window when pressing ` key (on QWERTY, key under escape)
export default function HackerDropdownView({ eventCode = "Backquote", keyRequiresAlt = false, keyRequiresCtrl = false, children }: { eventCode?: string, keyRequiresAlt?: boolean, keyRequiresCtrl?: boolean, children: React.ReactNode }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        function onKeyUp(e: KeyboardEvent) {
            if (e.code !== eventCode || (keyRequiresCtrl !== e.ctrlKey) || (keyRequiresAlt !== e.metaKey))
                return;
            setShow(!show)
            e.preventDefault();
        }
        document.addEventListener("keyup", onKeyUp, false);
        return () => document.removeEventListener("keyup", onKeyUp);
    })

    function getClassNames() {
        return 'admin-panel' + (show ? ' admin-panel__visible' : '')
    }
    const buttonClasses = 'admin-panel-toggle ' + (show ? 'admin-panel-toggle__hide' : 'admin-panel-toggle__show');

    return <div className={getClassNames()}>
        {show && children}
        <MobileView>
            <button className={buttonClasses} onClick={() => setShow(!show)} />
        </MobileView>
    </div>;
}
