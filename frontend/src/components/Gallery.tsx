import './style/Gallery.css';
import { useState } from "react";
import PhotoAlbum, { Photo } from "react-photo-album";
import "react-photo-album/rows.css";

import Lightbox from "yet-another-react-lightbox";
// optional lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
// import "yet-another-react-lightbox/plugins/thumbnails.css";

import { GalleryPhoto } from "../types";

export default function Gallery({ photoList }: { photoList: GalleryPhoto[] }) {
  const [index, setIndex] = useState(-1);

  let largePhotos: Photo[] = [];
  let thumbnails: Photo[] = [];
  if (Array.isArray(photoList)) {
    thumbnails = photoList.map(photo => {
      return {
        src: photo.thumbnail,
        width: photo.thumbnailWidth,
        height: photo.thumbnailHeight
      };
    });
    largePhotos = photoList.map(photo => {
      return {
        src: photo.src,
        width: photo.width,
        height: photo.height
      }
    });
  }
  console.log(thumbnails.length);
  return <div className="photos-gallery">
    {thumbnails.length > 0 && <>
      <PhotoAlbum
        photos={thumbnails}
        layout="rows"
        targetRowHeight={200}
        onClick={({ index }) => setIndex(index)}
      />
      <Lightbox
        slides={largePhotos}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        plugins={[Fullscreen, Slideshow, Zoom]}
      />
    </>}
  </div>
}
