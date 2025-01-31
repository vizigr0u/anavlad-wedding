import './style/PleaseLogin.css';

import { LoginStatus } from '../types';
import { useTranslation } from "react-i18next";
import CircularProgress from '@mui/material/CircularProgress';
import { useContext } from 'react';
import { ConfigContext } from '../AppConfigContext';

function AttemptingLogin({ loginStatus }: { loginStatus: LoginStatus }) {
    const { t } = useTranslation();
    const text = loginStatus === LoginStatus.LoadingData ? t('Loading') + '...' : t('Logging-In');
    return (
        <div className="attempting-login">
            {text} <CircularProgress />
        </div>
    );
}

export default function PleaseLogin({ loginStatus }: { loginStatus: LoginStatus }) {
    const { t } = useTranslation();
    const { contactName: contact } = useContext(ConfigContext);

    if (loginStatus === LoginStatus.LoggingIn || loginStatus === LoginStatus.LoadingData)
        return <AttemptingLogin loginStatus={loginStatus} />;

    const text = loginStatus === LoginStatus.LoggedOff
        ? t("Please-Click-Link-From-Mail-To-Login", { contact })
        : t('Login-Failed', { contact });
    return (
        <div className="please-login">
            {text}
        </div>
    );
}
