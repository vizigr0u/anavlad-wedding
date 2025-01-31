import './style/GiftsSection.css'

import { useQuery } from "@tanstack/react-query";
import usePrivateTranslation from "../hooks/UsePrivateTranslation";
import Section from "./Section";
import axios from "axios";
import { JSX, useContext, useState } from "react";
import CopyToClipboardButton from "./CopyToClipboardButton";
import { useTranslation } from "react-i18next";
import { ConfigContext } from '../AppConfigContext';

interface BankPaymentInfo {
    text: string;
    name: string;
    fields: { [key: string]: string };
}

function BankInfoContent({ info }: { info: BankPaymentInfo }) {
    const { t } = useTranslation();

    return <div className={'bank-info__content tab-' + info.name + '__content'}>
        <div className="bank-info-content-text">{t(info.text)}</div>
        <div className="bank-fields-container">
            {Object.entries(info.fields).map(([key, value]) => <div key={key} className="bank-field">
                <label className="bank-field-name">{t('bank-field-' + key)}</label>
                <div className="bank-field-value">
                    {String(value)} <CopyToClipboardButton styleName='bank-field-copy' text={value} />
                </div>
            </div>)}
        </div>
    </div>
}

function BankArrow({ className }: { className: string }) {
    const classNames = 'bank-title__arrow ' + className;
    return <svg className={classNames} viewBox="0 0 20 20"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg>
}

function BankInfo({ paymentMethods }: { paymentMethods: BankPaymentInfo[] }) {
    const [expanded, setExpanded] = useState(false);
    const { t } = useTranslation();


    const buttonClasses = 'bank-info__toggle ' + (expanded ? 'bank-info__toggle--expanded' : 'bank-info__toggle--collapsed');
    return <div className="bank-info">
        <button className={buttonClasses} onClick={() => setExpanded(!expanded)}>
            <BankArrow className="bank-title__arrow--right" />
            <div className="bank-info-title">
                <div className="bank-title__icon"></div>
                <div className="bank-title__text">{t('Bank-Info')}</div>
            </div>
            <BankArrow className="bank-title__arrow--left" />
        </button>
        {expanded && <div className="bank-info__container">
            {paymentMethods.map((method: BankPaymentInfo, i: Number) => <>
                <input key={method.name + '--input'} type="radio" name="tabs" id={'input__' + method.name} className="bank-info__input" defaultChecked={i === 0} />
                <label key={method.name + '--label'} htmlFor={'input__' + method.name} className='bank-info__input-label'>
                    <div className={'bank-info__icon bank-info-icon__' + method.name}></div>
                </label>
            </>)}
            <div className="bank-info__content-container">
                {paymentMethods.map((method: BankPaymentInfo) =>
                    <BankInfoContent key={method.name} info={method} />
                )}
            </div>
        </div>
        }
    </div>;
}

export default function GiftsSection(): JSX.Element {
    const { t } = usePrivateTranslation();
    const config = useContext(ConfigContext);

    const { data: bankData, status } = useQuery({
        queryKey: ["get_bank_info"],
        queryFn: () => axios.get("/api/bank-info")
            .then((res) => res.data),
        refetchOnWindowFocus: false
    });
    const { paymentMethods } = bankData ?? [];
    const showBankingInformation = config.showBankingInformation && status === "success" && paymentMethods.length > 0;

    return (
        <Section title={t('Gifts')} styleName={'gifts'} >
            <div className='gifts-description'>{t('Gifts-Description')}</div>
            {showBankingInformation && <BankInfo paymentMethods={paymentMethods} />}
        </Section>
    );
}
