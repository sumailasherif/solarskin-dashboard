// Real photos used on the dashboard. All come from Unsplash and are free to use under the
// Unsplash License (https://unsplash.com/license). A credit is not required, but each photo
// has a small "Photo credit" link (components/PhotoCredit.tsx) that shows the
// photographer and licence on hover. Names were checked against each photo page on 2026-11-22.
// Images load straight from Unsplash's image servers, resized to the size we ask for.

export type Photo = {
  /** Unsplash image id, e.g. "photo-1659469687849-17b452dfceb0" */
  id: string;
  /** Text for screen readers / if the image fails to load */
  alt: string;
  photographer: string;
  /** The photo's page on Unsplash (the photo credit links here) */
  page: string;
};

export const PHOTOS = {
  tashkentBlocks: {
    id: 'photo-1659469687849-17b452dfceb0',
    alt: 'Rows of multi-storey apartment blocks in Tashkent under a blue sky, with trees in front',
    photographer: 'Salohiddin Kamolov',
    page: 'https://unsplash.com/photos/XM9svSm7u9I',
  },
  ferganaStreet: {
    id: 'photo-1654792171381-05d309da048b',
    alt: 'A sunny, tree-lined street with green grass in Fergana, Uzbekistan',
    photographer: 'Muhammadqodir Abdubannobov',
    page: 'https://unsplash.com/photos/YIEwRW6-SGc',
  },
  solarFacade: {
    id: 'photo-1764885518069-84608997f900',
    alt: 'A modern building façade with solar panels built into the wall',
    photographer: 'LEDC',
    page: 'https://unsplash.com/photos/at4KKO2AJDU',
  },
  panelCloseUp: {
    id: 'photo-1694327672187-74aa0605314d',
    alt: 'Close-up of a solar panel glowing in warm evening light',
    photographer: 'Michael Pointner',
    page: 'https://unsplash.com/photos/ZGzMr04QdmU',
  },
  solarField: {
    id: 'photo-1509391366360-2e959784a276',
    alt: 'Rows of solar panels on green grass under a blue sky with white clouds',
    photographer: 'American Public Power Association',
    page: 'https://unsplash.com/photos/513dBrMJ_5w',
  },
  tashkentBalcony: {
    id: 'photo-1765078455481-b3ad54b00b63',
    alt: 'An apartment balcony in Tashkent with colourful laundry drying in the sun',
    photographer: 'Far Chinberdiev',
    page: 'https://unsplash.com/photos/8PlMRWCye8o',
  },
  installer: {
    id: 'photo-1668097613572-40b7c11c8727',
    alt: 'A technician in gloves fixing a solar panel in place with a drill',
    photographer: 'Markus Spiske',
    page: 'https://unsplash.com/photos/rNn_TU8dvoY',
  },
  uzLandscape: {
    id: 'photo-1682432196414-932bbe699907',
    alt: 'Green hills and snow-capped mountains in Bostanlik District, Uzbekistan',
    photographer: 'Sodikjon Akhmedov',
    page: 'https://unsplash.com/photos/zOqKmuM8azY',
  },
  sensorKit: {
    id: 'photo-1555664424-778a1e5e1b48',
    alt: 'Low-cost electronics laid out on a table: a microcontroller board, sensors, displays and wires',
    photographer: 'Robin Glauser',
    page: 'https://unsplash.com/photos/zP7X_B86xOg',
  },
} satisfies Record<string, Photo>;

/** Build an Unsplash image URL at a given width (Unsplash resizes it for us). */
export function photoUrl(photo: Photo, width: number) {
  return `https://images.unsplash.com/${photo.id}?auto=format&fit=crop&w=${width}&q=80`;
}

/** A "srcset": the browser picks the smallest size that still looks sharp. */
export function photoSrcSet(photo: Photo) {
  return [640, 1080, 1600, 2400].map((w) => `${photoUrl(photo, w)} ${w}w`).join(', ');
}
