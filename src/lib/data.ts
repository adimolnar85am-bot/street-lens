export interface NavItem {
  label: string;
  href?: string;
  description?: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: "Comunitate",
    children: [
      {
        label: "Despre noi",
        href: "/despre",
        description: "Povestea comunității de street photography",
      },
      {
        label: "Photowalk-uri",
        href: "/photowalks",
        description: "Întâlniri săptămânale cu teme alese",
      },
      {
        label: "Harta comunității",
        href: "/harta",
        description: "Pin-uri și poze de pe traseele noastre",
      },
      {
        label: "Galerie membri",
        href: "/galerie",
        description: "Lucrări selectate din comunitate",
      },
    ],
  },
  {
    label: "Fotografie",
    children: [
      {
        label: "Digital",
        href: "/fotografie/digital",
        description: "Mirrorless, DSLR și workflow digital",
      },
      {
        label: "Analog",
        href: "/fotografie/analog",
        description: "Film, procesare și estetica argintului",
      },
      {
        label: "Telefon",
        href: "/fotografie/telefon",
        description: "Mobile street photography și aplicații",
      },
      {
        label: "Ghiduri & Tutoriale",
        href: "/ghiduri",
        description: "Tehnici, compoziție, post-procesare",
      },
    ],
  },
  {
    label: "Concursuri",
    children: [
      {
        label: "Tema lunii",
        href: "/concursuri",
        description: "Provocarea activă — trimite fotografia ta",
      },
      {
        label: "Arhivă câștigători",
        href: "/concursuri/arhiva",
        description: "Lucrările premiate din trecut",
      },
      {
        label: "Regulament",
        href: "/concursuri/regulament",
        description: "Cum participi și ce criterii judecăm",
      },
    ],
  },
  {
    label: "Magazin",
    children: [
      {
        label: "Merch",
        href: "/magazin",
        description: "Tricouri, șepci, accesorii foto",
      },
      {
        label: "Print",
        href: "/magazin/print",
        description: "Tiraje limitate ale comunității",
      },
    ],
  },
  {
    label: "Resurse",
    children: [
      {
        label: "Blog",
        href: "/blog",
        description: "Articole, interviuri, recenzii gear",
      },
      {
        label: "Calendar",
        href: "/calendar",
        description: "Photowalk-uri și evenimente viitoare",
      },
      {
        label: "Membership",
        href: "/membership",
        description: "Susține comunitatea",
      },
    ],
  },
];

export interface PhotowalkPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  photographer: string;
  image: string;
  theme: string;
  date: string;
}

export interface Photowalk {
  id: string;
  title: string;
  theme: string;
  date: string;
  location: string;
  coverImage: string;
  description: string;
  participantCount: number;
  center: [number, number];
  pins: PhotowalkPin[];
}

export interface Contest {
  id: string;
  title: string;
  theme: string;
  themeNumber: number;
  deadline: string;
  prize: string;
  image: string;
  submissions: number;
}

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes?: string[];
}

export interface PhotoCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  /** Tall card on homepage (portrait frame) */
  heroImage: string;
  /** Wide banner on category page (landscape frame) */
  bannerImage: string;
  tagline: string;
  articles: { title: string; excerpt: string; image: string; date: string }[];
}
