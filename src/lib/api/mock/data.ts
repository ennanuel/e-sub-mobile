/**
 * Sample content for the mock API: CityView, Apo Wasa, from LCR's FAQ and form (Oct 2026).
 * The real backend should return the same shapes (see ../types.ts and docs/API.md).
 */
import type { BankAccount, Development, Faq, Paper, Terms } from '../types';

export const development: Development = {
  slug: 'cityview',
  name: 'CityView',
  fullName: 'CityView Park & Resort',
  area: 'Apo, Abuja',
  address: 'Apo Wasa, Abuja',
  description:
    'A new gated estate in Apo, at the end of the new road through the rock. The land has a C of O, the estate is secured day and night, and you can pay for your plot over time.',
  startingPrice: 8_400_000,
  realtor: {
    name: 'Gbemileke Peters',
    role: 'Realtor',
    phone: '+2348030000000',
    photoUrl: '/mock/realtor.jpg',
  },
  amenities: [
    { label: 'Gated entrance', icon: 'gate' },
    { label: '24-hour security', icon: 'shield' },
    { label: 'Paved roads', icon: 'road' },
    { label: 'Street lights', icon: 'lamp' },
    { label: 'Drainage', icon: 'drain' },
    { label: 'Green spaces', icon: 'leaf' },
  ],
  photos: [
    { url: '/mock/gate.jpg', title: 'The gate', caption: 'Gatehouse and barrier' },
    { url: '/mock/gate.jpg', title: 'Estate road', caption: 'The paved road in' },
    { url: '/mock/gate.jpg', title: 'The plots', caption: 'Cleared and marked' },
    { url: '/mock/gate.jpg', title: 'The view', caption: 'Hills around Apo' },
  ],
  paperwork: {
    summary: 'C of O, survey plan, offer of statutory right of occupancy',
    documents: [
      { id: 'rofo', label: 'FEDERAL CAPITAL TERRITORY', title: 'Right of Occupancy' },
      { id: 'survey', label: 'SURVEY PLAN', title: 'Plot boundaries' },
      { id: 'cofo', label: 'CERTIFICATE OF OCCUPANCY', title: 'C of O' },
    ],
  },
  plots: [
    {
      id: '200-res',
      sizeSqm: 200,
      use: 'Residential',
      outrightPrice: 8_400_000,
      deposit: 1_000_000,
      plans: [
        { months: 6, total: 9_400_000 },
        { months: 12, total: 10_400_000 },
        { months: 18, total: 11_400_000 },
      ],
    },
    {
      id: '300-res',
      sizeSqm: 300,
      use: 'Residential',
      outrightPrice: 12_600_000,
      deposit: 1_500_000,
      plans: [
        { months: 6, total: 14_100_000 },
        { months: 12, total: 15_600_000 },
        { months: 18, total: 17_100_000 },
      ],
    },
    {
      id: '500-res',
      sizeSqm: 500,
      use: 'Residential',
      outrightPrice: 21_000_000,
      deposit: 2_000_000,
      plans: [
        { months: 6, total: 23_000_000 },
        { months: 12, total: 25_000_000 },
        { months: 18, total: 27_000_000 },
      ],
    },
    {
      id: '1000-res',
      sizeSqm: 1000,
      use: 'Residential',
      outrightPrice: 42_000_000,
      deposit: 5_000_000,
      plans: [
        { months: 6, total: 44_500_000 },
        { months: 12, total: 45_000_000 },
        { months: 18, total: 47_500_000 },
      ],
    },
    {
      id: '1000-com',
      sizeSqm: 1000,
      use: 'Commercial',
      outrightPrice: 55_000_000,
      deposit: 7_500_000,
      plans: [
        { months: 6, total: 58_000_000 },
        { months: 12, total: 61_000_000 },
        { months: 18, total: 64_000_000 },
      ],
    },
  ],
  closingCosts: { surveyFee: 1_000_000, legalFee: 500_000 },
  // TODO: replace with the exact pin for the site when LCR shares it.
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=CityView+Park+%26+Resort%2C+Apo+Wasa%2C+Abuja',
};

export const accountName = 'LCR LIMITED';

export const bankAccounts: BankAccount[] = [
  { bank: 'Abbey Mortgage Bank', accountNumber: '0006162760' },
  { bank: 'Alpha Morgan Bank', accountNumber: '2010025319' },
  { bank: 'GTBank', accountNumber: '0885375920' },
];

export const papers: Paper[] = [
  {
    id: 'rofo',
    label: 'FEDERAL CAPITAL TERRITORY',
    title: 'Right of Occupancy',
    pages: [
      { plotNumber: '9142', area: '19.65 ha', imageUrl: '/mock/papers/rofo-9142.jpg' },
      { plotNumber: '9143', area: '31.37 ha', imageUrl: '/mock/papers/rofo-9143.jpg' },
    ],
  },
  {
    id: 'survey',
    label: 'SURVEY PLAN',
    title: 'Plot boundaries',
    pages: [
      { plotNumber: '9142', area: '19.65 ha', imageUrl: '/mock/papers/survey-9142.jpg' },
      { plotNumber: '9143', area: '31.37 ha', imageUrl: '/mock/papers/survey-9143.jpg' },
    ],
  },
  {
    id: 'cofo',
    label: 'CERTIFICATE OF OCCUPANCY',
    title: 'C of O',
    pages: [
      { plotNumber: '9142', area: '19.65 ha', imageUrl: '/mock/papers/cofo-9142.jpg' },
      { plotNumber: '9143', area: '31.37 ha', imageUrl: '/mock/papers/cofo-9143.jpg' },
    ],
  },
];

export const terms: Terms = {
  version: '2026-11-12',
  sections: [
    {
      title: 'Your form',
      clauses: [
        'Names will appear on your title documents exactly as you entered them. Any later change to your documents costs ₦200,000 for Lands.',
        'Give accurate information only. All information you give is treated as confidential.',
        'Your passport photo must be recent and a true likeness of you, or of the authorising officer if an organisation is applying.',
        'Filling the form without paying a deposit does not create any obligation between you and LCR.',
      ],
    },
    {
      title: 'Ownership',
      clauses: ['FCT Abuja does not allow double ownership of plots. Only one person may own a plot.', 'Apply for one owner per plot.'],
    },
    {
      title: 'Payment',
      clauses: [
        'All payments are made to LCR LIMITED.',
        'LCR accepts no liability for cash paid to any person or group of persons.',
        'There is no refund of any money paid, at any stage of the transaction.',
        'Prices are subject to periodic review.',
      ],
    },
    {
      title: 'Payment plans',
      clauses: [
        'After the initial deposit, the balance is paid monthly over the plan you chose (6, 12 or 18 months).',
        'Interest is charged on the balance after the initial deposit. It is included in the plan price.',
        'Not paying when due is a breach of contract, which can lead to termination or revocation of the contract.',
      ],
    },
    {
      title: 'Allocation',
      clauses: [
        'Plots are allocated on a first come, first served basis, on full payment.',
        'Physical allocation is given immediately after complete payment.',
        'After full payment you receive a duly executed receipt of purchase, a contract of sale and an invoice.',
      ],
    },
    {
      title: 'Building',
      clauses: [
        'Residential buildings may only be built in areas designated residential, and commercial buildings only in areas designated commercial.',
        'Shops in residential houses are not allowed.',
        'Tenement houses ("face me, I face you") are not permitted in the estate.',
        'The building permit fee for your plot size must be paid before you build.',
      ],
    },
    {
      title: 'Acknowledgement',
      clauses: [
        'You declare that all the information you gave is truly yours.',
        'You accept the information, FAQ and terms of this deal, and confirm you have received a copy of them.',
      ],
    },
  ],
};

/** Left out until LCR signs it off: "100% returns within 12 months". */
export const faq: Faq = {
  featuredCount: 6,
  items: [
    {
      id: 'where',
      category: 'The estate',
      question: 'Where is CityView, Apo Wasa?',
      answer: [
        {
          type: 'paragraph',
          text: 'Apo Wasa, in the Abuja Municipal Area Council (AMAC), just outside the central city in the southern corridor of the FCT. It is in Phase 5 of the Abuja master plan, an FCDA-approved district.',
        },
        {
          type: 'paragraph',
          text: 'It sits by the Outer Southern Expressway (the 10-lane Apo–Guzape–Kabusa highway), close to the Apo–Karshi road, Apo, Gudu and Lokogoma.',
        },
        { type: 'map' },
      ],
    },
    { id: 'title', category: 'Papers', question: 'What title is on the land?', answer: [{ type: 'paragraph', text: 'FCDA C of O.' }] },
    {
      id: 'extra-costs',
      category: 'Prices',
      question: 'What else do I pay apart from the land?',
      answer: [
        {
          type: 'table',
          rows: [
            ['Survey', '₦1,000,000'],
            ['Legal documentation', '₦500,000'],
            ['Development fee', '₦10,000 per sqm'],
          ],
        },
      ],
    },
    {
      id: 'price-fixed',
      category: 'Prices',
      question: 'Is the price fixed?',
      answer: [{ type: 'paragraph', text: 'No. Prices are reviewed from time to time.' }],
    },
    {
      id: 'balance',
      category: 'Prices',
      question: 'Can I pay the balance any time within my plan?',
      answer: [
        {
          type: 'paragraph',
          text: 'No. After the initial deposit, the balance is paid monthly. Not paying when due is a breach of contract, which can lead to termination or revocation of the contract.',
        },
      ],
    },
    {
      id: 'allocation',
      category: 'Papers',
      question: 'When will I get my plot?',
      answer: [{ type: 'paragraph', text: 'Physical allocation is given immediately after complete payment.' }],
    },
    { id: 'developer', category: 'The estate', question: 'Who is the developer?', answer: [{ type: 'paragraph', text: 'LCR Ltd.' }] },
    {
      id: 'nearby',
      category: 'The estate',
      question: 'What is within 3 km of the estate?',
      answer: [
        {
          type: 'list',
          items: [
            'FHA Green City Estate',
            '2,000-shop ultramodern market',
            'Proposed Wasa Housing Estate',
            'Apo mechanic and artisan corridor',
          ],
        },
      ],
    },
    {
      id: 'facilities',
      category: 'The estate',
      question: 'What will the estate have?',
      answer: [
        {
          type: 'list',
          items: [
            'Helipad',
            '9 hole golf course and resort',
            'Mini polo club',
            'Gym',
            'Children’s amusement park',
            'Event space',
            'Electric vehicle charging',
            'Solar power',
            '24/7 security',
          ],
        },
      ],
    },
    {
      id: 'outright',
      category: 'Prices',
      question: 'How much is each plot outright?',
      answer: [
        {
          type: 'table',
          rows: [
            ['200 sqm', '₦8.4M'],
            ['300 sqm', '₦12.6M'],
            ['500 sqm', '₦21M'],
            ['1000 sqm residential', '₦42M'],
            ['1000 sqm commercial', '₦55M'],
          ],
        },
      ],
    },
    {
      id: 'plans',
      category: 'Prices',
      question: 'What are the payment plans?',
      answer: [
        {
          type: 'table',
          head: ['sqm', 'Deposit', '6 mo', '12 mo', '18 mo'],
          rows: [
            ['200', '₦1M', '₦9.4M', '₦10.4M', '₦11.4M'],
            ['300', '₦1.5M', '₦14.1M', '₦15.6M', '₦17.1M'],
            ['500', '₦2M', '₦23M', '₦25M', '₦27M'],
            ['1000 R', '₦5M', '₦44.5M', '₦45M', '₦47.5M'],
            ['1000 C', '₦7.5M', '₦58M', '₦61M', '₦64M'],
          ],
        },
        { type: 'note', text: 'Plan prices are the full amount, deposit included.' },
      ],
    },
    {
      id: 'interest',
      category: 'Prices',
      question: 'Is there interest on the balance?',
      answer: [{ type: 'paragraph', text: 'Yes. It is already included in the payment plan prices.' }],
    },
    {
      id: 'corner',
      category: 'Prices',
      question: 'How much is a corner piece?',
      answer: [{ type: 'paragraph', text: '₦2,000,000 extra.' }],
    },
    {
      id: 'dev-fee',
      category: 'Prices',
      question: 'What is the development fee used for?',
      answer: [
        {
          type: 'list',
          items: [
            'Transformer and electricity',
            'Street lights',
            'Asphalt roads',
            'Drainage',
            'Recreation facilities',
            '24 hour armed and unarmed security',
          ],
        },
      ],
    },
    {
      id: 'where-pay',
      category: 'Prices',
      question: 'Where do I make payments?',
      answer: [
        { type: 'paragraph', text: 'Only into LCR LIMITED accounts, by transfer, deposit, bank draft or cheque:' },
        {
          type: 'table',
          rows: [
            ['Abbey Mortgage Bank', '0006 162 760'],
            ['Alpha Morgan Bank', '2010 025 319'],
            ['GTBank', '0885 375 920'],
          ],
        },
        { type: 'note', text: 'LCR is not liable for cash paid to anyone.' },
      ],
    },
    {
      id: 'after-paying',
      category: 'Papers',
      question: 'What do I get when I finish paying?',
      answer: [{ type: 'list', items: ['A duly executed receipt of purchase', 'Contract of sale', 'Invoice'] }],
    },
    {
      id: 'what-build',
      category: 'Building',
      question: 'What can I build on my plot?',
      answer: [
        {
          type: 'table',
          rows: [
            ['200 sqm', '3 bedroom terraces'],
            ['300 sqm', 'Semi detached'],
            ['500 sqm', 'Fully detached'],
            ['1000 sqm', 'Villa or block of flats'],
          ],
        },
      ],
    },
    {
      id: 'build-rules',
      category: 'Building',
      question: 'Are there rules on what I can build?',
      answer: [
        {
          type: 'paragraph',
          text: 'Yes. Residential houses only in residential areas, and commercial buildings only in commercial areas. Shops in residential houses are not allowed, and tenement houses ("face me, I face you") are not permitted.',
        },
      ],
    },
    {
      id: 'commercial',
      category: 'Building',
      question: 'What can I do with a commercial plot?',
      answer: [{ type: 'list', items: ['Financial institutions', 'Shopping mall', 'Hospitals', 'Schools, and more'] }],
    },
    {
      id: 'permit-fee',
      category: 'Building',
      question: 'What is the building permit fee?',
      answer: [
        {
          type: 'table',
          rows: [
            ['200 sqm', '₦750,000'],
            ['300 sqm', '₦1,125,000'],
            ['500 sqm', '₦1,875,000'],
            ['1000 sqm', '₦3,250,000'],
          ],
        },
        { type: 'note', text: 'Paid to LCR LIMITED, Globus Bank 1000 483 688.' },
      ],
    },
  ],
};
