# Public User Data Directory

This directory contains data that can or could be accessed by any visitor. For anything you want to keep private, look at the private user data directory in /server/user-data.

The goal of this directory is to keep some assets that can be changed without having to rebuild the react project or event restart the frontend server.

Eventually we could add ways to configure this straight from the admin space.

## Content of this directory

1. **images** directory: images and photos used as assets on the website, e.g. background photo, slideshow photos.
The original background.jpg used is tiny (300*200px) and blurred in css.
Note: original photos in this directory are provided as placeholder and are the property of Vladimir Nachbaur.

2. **locales** directory: Contains public translations for every language you support.
Since translations can contain information you don't necessarily want available to any visitor (e.g. event related details etc.), there are also translations in the private user data directory.

3. **appconfig.json** file: Public data used to configure the website: homepage slideshow slides and speed, menu choices,  available languages.
This object needs to be compatible with the AppConfig type found in src/types.ts
Note: the link to photos is present by default for you to see but you might want to hide it until you have photos to show. For this, simply replace the line
`"photoGalleryLink": "/gallery",`
with
`"photoGalleryLink": null,`
