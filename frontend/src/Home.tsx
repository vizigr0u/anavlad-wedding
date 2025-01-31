import './Home.css';
import MainContent from './components/MainContent';
import LanguageMenu from './components/LanguageMenu';
import RSVPSection from './components/RSVPSection';

import { useQuery } from '@tanstack/react-query'
import axios from "axios";

import IntroSection from './components/IntroSection';
import Section from './components/Section';
import usePrivateTranslation from './hooks/UsePrivateTranslation.js';
import Footer from './components/Footer';
import EventSection from './components/EventSection';
import GiftsSection from './components/GiftsSection';
import { UserData, LoginStatus } from './types';
import CarpoolSection from './components/CarpoolSection';
import { useEffect, lazy, Suspense, use } from 'react';
import HackerDropdownView from './components/Admin/HackerDropdownView';
import { ConfigContext } from './AppConfigContext.ts';

function clearTokenFromUrl(): void {
  window.history.replaceState({}, document.title, "/");
}

const AdminPanel = lazy(() => import('./components/Admin/AdminPanel.tsx'));

function AdminDropdown({ userData }: { userData: UserData }) {
  const config = use(ConfigContext)
  return (
    <HackerDropdownView eventCode={config.adminConfig.consoleKeyCode}>
      <Suspense fallback={<div>Loading Admin panel...</div>}>
        {userData && <AdminPanel userData={userData} />}
      </Suspense>
    </HackerDropdownView>
  );
}

export default function Home() {
  const config = use(ConfigContext)
  const urlToken = new URLSearchParams(window.location.search).get('token');

  const { t } = usePrivateTranslation();
  const { enableCarpool: EnableCarpool } = config;

  const { isLoading: userIsLoading, data: userData, isError: fetchFailed, isSuccess } = useQuery<UserData>({
    queryKey: ["get_user_data"],
    queryFn: (): Promise<UserData> =>
      axios.get("/api/user-data", { params: { token: urlToken } })
        .then((res) => res.data),
    refetchOnWindowFocus: false
  }
  );

  useEffect(() => {
    if (isSuccess) {
      clearTokenFromUrl();
    }
  }, [isSuccess]);

  var status = userData?.weddingData !== undefined ? LoginStatus.LoggedIn : (fetchFailed && urlToken ? LoginStatus.LoginFailed : LoginStatus.LoggedOff);
  if (userIsLoading) {
    status = urlToken ? LoginStatus.LoggingIn : LoginStatus.LoadingData;
  }

  // const anyUserAttending = userData?.attendees && userData.attendees.some(att => att.rsvpAnswer === 1);

  const dataWithLoading = userData ? Object.assign(userData, { isLoading: userIsLoading }) : undefined;
  const weddingData = userData?.weddingData;

  const hasMultipleLanguages = Object.keys(config.languages).length > 1;

  return (
    <div className="Home">
      {userData?.admin && <AdminDropdown userData={userData} />}
      <MainContent weddingData={weddingData} loginStatus={status}>
        <IntroSection />
        {/* <GallerySection /> */}
        <EventSection weddingData={weddingData} />
        <GiftsSection />
        {EnableCarpool && userData && <CarpoolSection userData={userData} />}
        <Section title={t('DressCode')} styleName={'dress-code'} startExpanded={false} >
          {t('DressCode-Description')}
        </Section>
        {userData && <RSVPSection userData={userData} />}
        <Footer>
          {t('Developed-by-Vlad')}
        </Footer>
      </MainContent>
      {hasMultipleLanguages && <LanguageMenu userData={dataWithLoading} />}
    </div>
  );
}
