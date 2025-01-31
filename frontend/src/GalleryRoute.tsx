import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";

import { LoginStatus } from "./types";
import PleaseLogin from './components/PleaseLogin';
import UsePhotos from "./hooks/UsePhotos";
import { lazy, Suspense } from 'react';

const Gallery = lazy(() => import('./components/Gallery.tsx'));

export default function GalleryRoute() {
  const { t } = useTranslation();
  const { status, photos } = UsePhotos();

  if (status !== LoginStatus.LoggedIn) {
    console.log('displaying text because: ' + LoginStatus[status]);
    return <div>
      <PleaseLogin loginStatus={status} />
      <Link to="/">{t('Back-To-Website')}</Link>
    </div>
  }
  return <Suspense fallback={<div>Loading Gallery...</div>}>
    <Gallery photoList={photos} />
  </Suspense>
}
