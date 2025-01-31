import React, { useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from "react-i18next";
import axios from "axios";

import './style/CarpoolSection.css'

import Section from "./Section";
import { UserData, Carpool } from "../types";
import { ConfigContext } from "../AppConfigContext";

type DataToSync = { [key: string]: string | null | number };

function NoCarPool() {
  const { t } = useTranslation();
  return <p className="no-carpool-text">{t('NoCarpoolListedYet')}</p>
}

function CarpoolLine({ carpool, onRequestExpand, expanded = false }: { carpool: Carpool, onRequestExpand: (expand: boolean) => void, expanded?: boolean }) {
  const { t } = useTranslation();
  const config = useContext(ConfigContext);
  const languagesAsString = carpool.languages
    .map(l => config.languages[l]?.name)
    .filter(l => !!l)
    .join(', ');
  return <div className='carpooler'>
    <button className="carpooler-header carpooler-header--expandable" onClick={() => onRequestExpand(!expanded)}>
      <NameContainer>{carpool.name}</NameContainer>
      <div className={'carpooler-header-visibility' + (expanded ? '' : ' carpooler-header-visibility--expanded')} />
    </button>
    {expanded && <div className="carpooler-content">
      <FieldContainer name='seats'>{carpool.seats} {t('Seats')}</FieldContainer>
      <FieldContainer name='contact'>{carpool.contact.length > 0 ? carpool.contact : t('NoContactProvided')}</FieldContainer>
      <FieldContainer name='languages'><div className="carpooler-languages">{languagesAsString}</div></FieldContainer>
      {carpool.message.length > 0 && <FieldContainer name='message'><div className="carpooler-message">{carpool.message}</div></FieldContainer>}
    </div>}
  </div>;
}

function FieldContainer({ name, children }: { name: string, children: React.ReactNode }) {
  return <div className={'carpooler-field carpooler-' + name}>{children}</div>;
}

function NameContainer({ children }: { children: React.ReactNode }) {
  return <div className="carpooler-name">{children}</div>;
}

function EditableCarpoolData({ carpool }: { carpool: Carpool }) {
  const TimeMsBetweenChangeAndSync = 1000;
  const { t } = useTranslation();

  const [displayData, setDisplayData] = useState<Carpool>(copyCarpool(carpool));
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (data: DataToSync) => axios.patch('/api/carpools',
      data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get_carpools'] })
  }
  );

  const deleteMutation = useMutation({
    mutationFn: () => axios.delete('/api/carpools'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get_carpools'] })
  }
  );

  function onInputChange<K extends keyof Carpool>(fieldName: K, value: Carpool[K]) {
    if (carpool[fieldName] === value) {
      return;
    }
    let newData = copyCarpool(carpool);
    newData[fieldName] = value;
    setDisplayData(newData);
  }

  function LangsAreSame(a: string[], b: string[]) {
    return a.length === b.length
      && JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
  }

  function GetChangesToSync() {
    let changes: DataToSync = {};
    if (carpool !== displayData)
      changes = Object.fromEntries(Object.entries(displayData).filter(([k, v]) => k == "languages" ? !LangsAreSame(v, carpool.languages) : v !== carpool[k as keyof Carpool]));
    return changes;
  }

  // unless component gets updated, schedule data sync
  useEffect(() => {
    function SyncIfNeeded() {
      const changes = GetChangesToSync();
      if (Object.keys(changes).length > 0) {
        updateMutation.mutate(changes);
      }
    }

    const nextSyncTimeout = setTimeout(SyncIfNeeded, TimeMsBetweenChangeAndSync);
    return (() => { clearTimeout(nextSyncTimeout); })
  }, [displayData, carpool]);

  return <div className='carpooler'>
    <div className="carpooler-header">
      <NameContainer><input className="name-input carpool-input" type="text" value={displayData.name} onChange={(e) => onInputChange("name", e.target.value)} /></NameContainer>
    </div>
    <div className="carpooler-content">
      <FieldContainer name='seats'><input className="seats-input carpool-input" type="number" value={displayData.seats} min={0} max={9} onChange={(e) => onInputChange("seats", e.target.valueAsNumber)} /> {t('Seats')}</FieldContainer>
      <FieldContainer name='contact'><input className="contact-input carpool-input" placeholder={t("CarpoolContactPlaceholder")} type="text" value={displayData.contact} onChange={(e) => onInputChange("contact", e.target.value)} /></FieldContainer>
      <FieldContainer name='languages'><LanguageEditor languages={displayData.languages} onChange={(langs) => onInputChange("languages", langs)} /></FieldContainer>
      <FieldContainer name='message'><input className="message-input carpool-input" type="text" value={displayData.message} placeholder={t("CarpoolMessagePlaceholder")} onChange={e => onInputChange("message", e.target.value)} /></FieldContainer>
      <button className="delete-carpool-button" onClick={() => deleteMutation.mutate()}>❌ {t('StopListing')}</button>
    </div>
  </div>;
}

function copyCarpool(carpool: Carpool): Carpool {
  let newData = { ...carpool };
  newData.languages = carpool.languages.map(l => l);
  return newData;
}

function LanguageEditor({ languages, onChange }: { languages: string[], onChange: (languages: string[]) => void }) {
  function changeLang(lang: string, enabled: boolean) {
    if (enabled) {
      onChange(languages.concat([lang]));
      return;
    }
    onChange(languages.filter(l => l != lang));
  }

  function isChecked(lang: string): boolean {
    return languages.some(l => l == lang);
  }
  const config = useContext(ConfigContext);
  return <div className="language-editor">
    {Object.keys(config.languages).map(k =>
      <label key={k}>
        {config.languages[k]?.name ?? "/!\\ Undefined Language"} <input type="checkbox" checked={isChecked(k)} onChange={(e) => changeLang(k, e.target.checked)} />
      </label>)}
  </div>;
}

function CarpoolList({ carpools }: { carpools: Carpool[] }) {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState(-1);
  // const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([i18n.language as Language]);

  function showCarpool(carpool: Carpool) {
    return;
  }

  // const filteredCarpools = carpools.filter(c => c.isMine || c.languages.some(l => supportedLanguages.includes(l)))

  if (carpools.length < 1)
    return <NoCarPool />;

  function OnRequestExpand(index: number, expand: boolean) {
    if (expand) {
      setExpandedIndex(index);
    } else if (index === expandedIndex) {
      setExpandedIndex(-1);
    }
  }

  return (
    <div className="carpoolers-container">
      <p>{t('Here-are-people-to-contact-for-a-seat')}</p>
      <div className="carpoolers">
        {carpools.map((c, i) => <CarpoolLine key={i} carpool={c} expanded={i === expandedIndex} onRequestExpand={exp => OnRequestExpand(i, exp)} />)}
      </div>
    </div>);
}

export default function CarpoolSection({ userData }: { userData: UserData }) {
  const { t, i18n } = useTranslation();

  const queryClient = useQueryClient();

  const postMutation = useMutation({
    mutationFn: (carpool: Carpool) => axios.post('/api/carpools', carpool),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get_carpools'] })
  }
  );

  function AddDefaultCarpool() {
    const defaultName = userData.attendees.filter(att => att.rsvpAnswer === 1).map(att => att.name.split(' ')[0]).join("&");
    const data: Carpool = {
      name: defaultName,
      contact: "",
      seats: 5 - userData.attendees.length,
      message: "",
      languages: [i18n.language]
    };
    postMutation.mutate(data);
  }

  const { isLoading: carpoolsLoading, data: carpools, isError: fetchCarpoolsError } = useQuery<Carpool[]>({
    queryKey: ["get_carpools"],
    queryFn: async (): Promise<Carpool[]> =>
      axios.get("/api/carpools")
        .then((res) => res.data),
    refetchOnWindowFocus: false,
    refetchInterval: 20000
  }
  );

  const allCarPools = Array.isArray(carpools) ? carpools.filter(carpool => carpool.isMine || carpool.seats > 0) : [];
  const myCarPools = allCarPools.filter(c => c.isMine);
  const otherCarPools = allCarPools.filter(c => !c.isMine);
  const myCarPool = myCarPools.length > 0 ? myCarPools[0] : undefined;

  return (
    <>
      <Section title={t('Carpooling')} styleName='carpool'>
        <h4>{t('TravelWithOtherGuests')}</h4>
        <h3>{t('WantToGiveARide')}</h3>
        {myCarPool ? <div className="carpoolers-container"><EditableCarpoolData carpool={myCarPool} /></div> : <button className="add-carpool-button" onClick={AddDefaultCarpool} >{t('Add-My-Carpool')}</button>}
        <h3>{t('LookingForCarpool')}</h3>
        <CarpoolList carpools={allCarPools} />
      </Section >
    </>
  );
}
