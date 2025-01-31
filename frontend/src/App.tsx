import { Route, Routes } from "react-router-dom"
import Home from "./Home"
import GalleryRoute from "./GalleryRoute"
import InitI18 from './translation';
import { Suspense, use } from "react";
import { loadConfig } from "./configLoader";
import { AppConfig } from "./types";
import { ConfigContext } from "./AppConfigContext";

InitI18();

function AppContent({ configPromise }: { configPromise: Promise<AppConfig> }) {
  const configContent = use(configPromise)

  return (
    <ConfigContext.Provider value={configContent}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<GalleryRoute />} />
      </Routes>
    </ConfigContext.Provider>
  )

}

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent configPromise={loadConfig()} />
    </Suspense>
  )
}
