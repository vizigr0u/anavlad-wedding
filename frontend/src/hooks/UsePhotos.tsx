import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { GalleryPhoto, LoginStatus } from "../types";
import { useEffect } from "react";

function clearTokenFromUrl(): void {
  window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
}

export default function UsePhotos(): { photos: GalleryPhoto[], status: LoginStatus } {
  const urlToken = new URLSearchParams(window.location.search).get('token');
  const { data: photos, isError, isLoading, isSuccess, isFetched } = useQuery<GalleryPhoto[]>({
    queryKey: ["get_photos"],
    queryFn: (): Promise<GalleryPhoto[]> =>
      axios.get("/photos", { params: { token: urlToken } })
        .then((res) => res.data),
    refetchOnWindowFocus: false,
  }
  );
  useEffect(() => {
    if (isSuccess) {
      clearTokenFromUrl();
    }
  }, [isSuccess]);
  let status: LoginStatus = isSuccess || !isFetched ? LoginStatus.LoggedIn : LoginStatus.LoggedOff;
  if (isLoading)
    status = !!urlToken ? LoginStatus.LoggingIn : LoginStatus.LoadingData;
  if (isError && !!urlToken)
    status = LoginStatus.LoginFailed;

  console.log(LoginStatus[status]);
  return { photos: photos ?? [], status };
}
