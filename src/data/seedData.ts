import {
  ServiceCategory,
  Service,
  Client,
  Transaction,
  Expense,
  BusinessSettings,
} from '../types';

export const defaultCleanSettings: BusinessSettings = {
  businessName: 'IncomeFlow',
  currency: 'DT',
  phone: '',
  email: '',
  address: '',
  receiptFooter: 'Thank you for your visit!',
  taxRate: 0,
};

export const starterCategories: ServiceCategory[] = [
  { id: 'cat-1', name: 'Hair', createdAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Facial', createdAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Massage', createdAt: new Date().toISOString() },
  { id: 'cat-4', name: 'Beauty', createdAt: new Date().toISOString() },
  { id: 'cat-5', name: 'Other', createdAt: new Date().toISOString() },
];

export const initialCategories: ServiceCategory[] = [
  { id: 'cat-1', name: 'Hair', createdAt: '2026-01-01T08:00:00.000Z' },
  { id: 'cat-2', name: 'Facial', createdAt: '2026-01-01T08:00:00.000Z' },
  { id: 'cat-3', name: 'Massage', createdAt: '2026-01-01T08:00:00.000Z' },
  { id: 'cat-4', name: 'Beauty', createdAt: '2026-01-01T08:00:00.000Z' },
  { id: 'cat-5', name: 'Other', createdAt: '2026-01-01T08:00:00.000Z' },
];

export const initialServices: Service[] = [
  {
    id: 'srv-1',
    categoryId: 'cat-1',
    name: 'Haircut',
    price: 25,
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'srv-2',
    categoryId: 'cat-1',
    name: 'Beard',
    price: 10,
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'srv-3',
    categoryId: 'cat-1',
    name: 'Haircut + Beard',
    price: 30,
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'srv-4',
    categoryId: 'cat-2',
    name: 'Facial',
    price: 40,
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'srv-5',
    categoryId: 'cat-1',
    name: 'Hair Styling',
    price: 20,
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'srv-6',
    categoryId: 'cat-3',
    name: 'Deep Tissue Massage',
    price: 60,
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'srv-7',
    categoryId: 'cat-4',
    name: 'Exfoliating Scrub',
    price: 35,
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
];

export const initialClients: Client[] = [
  {
    id: 'cl-1',
    name: 'Ahmed Ben Ali',
    phone: '21 345 678',
    email: 'ahmed.benali@email.com',
    notes: 'Prefers classic scissors cut',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-09-25T09:15:00.000Z',
  },
  {
    id: 'cl-2',
    name: 'Mohamed Trabelsi',
    phone: '98 765 432',
    email: 'm.trabelsi@email.com',
    notes: 'Sensitive skin, hypoallergenic products',
    createdAt: '2026-02-14T11:00:00.000Z',
    updatedAt: '2026-09-25T10:30:00.000Z',
  },
  {
    id: 'cl-3',
    name: 'Sami Khelifi',
    phone: '55 123 456',
    email: 'sami.k@email.com',
    notes: 'Regular beard grooming every 2 weeks',
    createdAt: '2026-03-01T14:00:00.000Z',
    updatedAt: '2026-09-25T12:10:00.000Z',
  },
  {
    id: 'cl-4',
    name: 'Youssef Mansour',
    phone: '24 889 900',
    email: 'youssef.m@email.com',
    notes: 'Always books morning appointments',
    createdAt: '2026-03-15T09:30:00.000Z',
    updatedAt: '2026-09-24T16:20:00.000Z',
  },
  {
    id: 'cl-5',
    name: 'Karim Bouazizi',
    phone: '50 443 322',
    email: 'karim.b@email.com',
    notes: '',
    createdAt: '2026-04-10T16:00:00.000Z',
    updatedAt: '2026-09-25T14:00:00.000Z',
  },
  {
    id: 'cl-6',
    name: 'Tarek Hamdi',
    phone: '92 112 233',
    email: 'tarek.h@email.com',
    notes: '',
    createdAt: '2026-05-02T11:30:00.000Z',
    updatedAt: '2026-09-25T16:45:00.000Z',
  },
];

export const initialSettings: BusinessSettings = {
  businessName: 'Barber & Spa Lounge',
  currency: 'DT',
  phone: '+216 71 234 567',
  email: 'contact@barberspa.tn',
  address: 'Avenue Habib Bourguiba, Tunis',
  receiptFooter: 'Thank you for your visit! Follow us on Instagram @BarberSpaTN',
  taxRate: 0,
};

// Generate realistic transactions anchored dynamically to today's date
export function generateSeedTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  // Helper to format ISO
  const makeDate = (dOffsetDays: number, hours: number, minutes: number): string => {
    const target = new Date(year, month, date - dOffsetDays, hours, minutes, 0);
    return target.toISOString();
  };

  const list: Transaction[] = [
    // Today's transactions: 25 + 40 + 10 + 30 + 50 + 30 = 185 DT (matching spec exactly!)
    {
      id: 'TX-1048',
      clientId: 'cl-1',
      clientName: 'Ahmed Ben Ali',
      clientPhone: '21 345 678',
      items: [
        {
          id: 'item-1048-1',
          transactionId: 'TX-1048',
          serviceId: 'srv-1',
          serviceName: 'Haircut',
          unitPrice: 25,
          quantity: 1,
          total: 25,
        },
      ],
      subtotal: 25,
      discount: 0,
      total: 25,
      paymentMethod: 'Cash',
      transactionDate: makeDate(0, 9, 15),
      createdAt: makeDate(0, 9, 15),
      updatedAt: makeDate(0, 9, 15),
    },
    {
      id: 'TX-1049',
      clientId: 'cl-2',
      clientName: 'Mohamed Trabelsi',
      clientPhone: '98 765 432',
      items: [
        {
          id: 'item-1049-1',
          transactionId: 'TX-1049',
          serviceId: 'srv-4',
          serviceName: 'Facial',
          unitPrice: 40,
          quantity: 1,
          total: 40,
        },
      ],
      subtotal: 40,
      discount: 0,
      total: 40,
      paymentMethod: 'Card',
      transactionDate: makeDate(0, 10, 30),
      createdAt: makeDate(0, 10, 30),
      updatedAt: makeDate(0, 10, 30),
    },
    {
      id: 'TX-1050',
      clientId: 'cl-3',
      clientName: 'Sami Khelifi',
      clientPhone: '55 123 456',
      items: [
        {
          id: 'item-1050-1',
          transactionId: 'TX-1050',
          serviceId: 'srv-2',
          serviceName: 'Beard',
          unitPrice: 10,
          quantity: 1,
          total: 10,
        },
      ],
      subtotal: 10,
      discount: 0,
      total: 10,
      paymentMethod: 'Cash',
      transactionDate: makeDate(0, 12, 10),
      createdAt: makeDate(0, 12, 10),
      updatedAt: makeDate(0, 12, 10),
    },
    {
      id: 'TX-1051',
      clientId: 'cl-5',
      clientName: 'Karim Bouazizi',
      clientPhone: '50 443 322',
      items: [
        {
          id: 'item-1051-1',
          transactionId: 'TX-1051',
          serviceId: 'srv-3',
          serviceName: 'Haircut + Beard',
          unitPrice: 30,
          quantity: 1,
          total: 30,
        },
      ],
      subtotal: 30,
      discount: 0,
      total: 30,
      paymentMethod: 'Cash',
      transactionDate: makeDate(0, 14, 0),
      createdAt: makeDate(0, 14, 0),
      updatedAt: makeDate(0, 14, 0),
    },
    {
      id: 'TX-1052',
      clientId: 'cl-6',
      clientName: 'Tarek Hamdi',
      clientPhone: '92 112 233',
      items: [
        {
          id: 'item-1052-1',
          transactionId: 'TX-1052',
          serviceId: 'srv-1',
          serviceName: 'Haircut',
          unitPrice: 25,
          quantity: 2,
          total: 50,
        },
      ],
      subtotal: 50,
      discount: 0,
      total: 50,
      paymentMethod: 'Card',
      transactionDate: makeDate(0, 15, 20),
      createdAt: makeDate(0, 15, 20),
      updatedAt: makeDate(0, 15, 20),
    },
    {
      id: 'TX-1053',
      clientId: 'cl-4',
      clientName: 'Youssef Mansour',
      clientPhone: '24 889 900',
      items: [
        {
          id: 'item-1053-1',
          transactionId: 'TX-1053',
          serviceId: 'srv-3',
          serviceName: 'Haircut + Beard',
          unitPrice: 30,
          quantity: 1,
          total: 30,
        },
      ],
      subtotal: 30,
      discount: 0,
      total: 30,
      paymentMethod: 'Cash',
      transactionDate: makeDate(0, 16, 45),
      createdAt: makeDate(0, 16, 45),
      updatedAt: makeDate(0, 16, 45),
    },
  ];

  // Add realistic past days in current month to reach around 4,820 DT
  const pastDaysData = [
    { offset: 1, count: 5, amounts: [25, 30, 40, 60, 25], client: 'Sami Khelifi', srv: 'Deep Tissue Massage' },
    { offset: 2, count: 6, amounts: [25, 10, 40, 30, 25, 60], client: 'Karim Bouazizi', srv: 'Haircut' },
    { offset: 3, count: 4, amounts: [30, 40, 25, 25], client: 'Ahmed Ben Ali', srv: 'Haircut + Beard' },
    { offset: 4, count: 7, amounts: [25, 30, 35, 40, 20, 10, 60], client: 'Mohamed Trabelsi', srv: 'Exfoliating Scrub' },
    { offset: 5, count: 5, amounts: [25, 25, 40, 30, 60], client: 'Tarek Hamdi', srv: 'Deep Tissue Massage' },
    { offset: 6, count: 6, amounts: [40, 25, 10, 30, 20, 25], client: 'Youssef Mansour', srv: 'Facial' },
    { offset: 7, count: 8, amounts: [25, 30, 40, 60, 25, 10, 30, 40], client: 'Ahmed Ben Ali', srv: 'Haircut' },
    { offset: 8, count: 5, amounts: [35, 25, 30, 20, 40], client: 'Sami Khelifi', srv: 'Hair Styling' },
    { offset: 9, count: 7, amounts: [25, 10, 60, 30, 40, 25, 25], client: 'Karim Bouazizi', srv: 'Beard' },
    { offset: 10, count: 6, amounts: [25, 40, 30, 60, 10, 25], client: 'Mohamed Trabelsi', srv: 'Facial' },
    { offset: 12, count: 8, amounts: [25, 30, 40, 25, 10, 60, 35, 20], client: 'Ahmed Ben Ali', srv: 'Haircut' },
    { offset: 14, count: 7, amounts: [30, 25, 40, 10, 60, 25, 30], client: 'Tarek Hamdi', srv: 'Haircut + Beard' },
    { offset: 16, count: 6, amounts: [25, 40, 30, 25, 60, 20], client: 'Youssef Mansour', srv: 'Deep Tissue Massage' },
    { offset: 18, count: 8, amounts: [25, 10, 30, 40, 60, 25, 35, 25], client: 'Sami Khelifi', srv: 'Beard' },
    { offset: 20, count: 7, amounts: [40, 25, 30, 10, 25, 60, 30], client: 'Mohamed Trabelsi', srv: 'Facial' },
    { offset: 22, count: 8, amounts: [25, 30, 40, 60, 25, 10, 20, 35], client: 'Ahmed Ben Ali', srv: 'Haircut + Beard' },
    { offset: 24, count: 6, amounts: [30, 25, 40, 60, 25, 10], client: 'Karim Bouazizi', srv: 'Haircut' },
  ];

  let txIdCounter = 1000;
  const methods: ('Cash' | 'Card' | 'Bank Transfer')[] = ['Cash', 'Cash', 'Card', 'Cash', 'Card', 'Bank Transfer'];

  pastDaysData.forEach((dayData) => {
    dayData.amounts.forEach((amt, idx) => {
      txIdCounter--;
      const hours = 9 + (idx % 9);
      const minutes = (idx * 17) % 60;
      const method = methods[(idx + dayData.offset) % methods.length];
      
      list.push({
        id: `TX-${txIdCounter}`,
        clientId: idx % 2 === 0 ? 'cl-1' : 'cl-2',
        clientName: dayData.client,
        items: [
          {
            id: `item-${txIdCounter}-1`,
            transactionId: `TX-${txIdCounter}`,
            serviceName: dayData.srv,
            unitPrice: amt,
            quantity: 1,
            total: amt,
          },
        ],
        subtotal: amt,
        discount: 0,
        total: amt,
        paymentMethod: method,
        transactionDate: makeDate(dayData.offset, hours, minutes),
        createdAt: makeDate(dayData.offset, hours, minutes),
        updatedAt: makeDate(dayData.offset, hours, minutes),
      });
    });
  });

  // Add historical transactions earlier this year so This Year totals ~38,450 DT
  const priorMonths = [1, 2, 3, 4, 5, 6, 7];
  priorMonths.forEach((mOffset) => {
    for (let i = 0; i < 18; i++) {
      txIdCounter--;
      const d = 1 + (i * 2);
      const targetDate = new Date(year, Math.max(0, month - mOffset), d, 11, 30, 0).toISOString();
      const amt = 240; // bulked historical representation
      list.push({
        id: `TX-${txIdCounter}`,
        clientName: i % 2 === 0 ? 'Mohamed Trabelsi' : 'Ahmed Ben Ali',
        items: [
          {
            id: `item-${txIdCounter}-1`,
            transactionId: `TX-${txIdCounter}`,
            serviceName: 'Haircut + Facial Package',
            unitPrice: amt,
            quantity: 1,
            total: amt,
          },
        ],
        subtotal: amt,
        discount: 0,
        total: amt,
        paymentMethod: i % 3 === 0 ? 'Card' : 'Cash',
        transactionDate: targetDate,
        createdAt: targetDate,
        updatedAt: targetDate,
      });
    }
  });

  return list.sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );
}

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    name: 'Salon Monthly Rent',
    category: 'Rent',
    amount: 600,
    date: '2026-09-01',
    notes: 'Commercial space September payment',
    createdAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 'exp-2',
    name: 'Electricity & Water Bill (STEG)',
    category: 'Electricity',
    amount: 95,
    date: '2026-09-05',
    notes: 'August consumption bill',
    createdAt: '2026-09-05T10:00:00.000Z',
  },
  {
    id: 'exp-3',
    name: 'Hair Pomades & Shampoos Wholesale',
    category: 'Supplies',
    amount: 120,
    date: '2026-09-12',
    notes: '20 jars pomade, 5L organic shampoo',
    createdAt: '2026-09-12T14:30:00.000Z',
  },
  {
    id: 'exp-4',
    name: 'Sanitary Towels & Disinfectants',
    category: 'Supplies',
    amount: 35,
    date: '2026-09-18',
    notes: 'Barber barbicide and neck strips',
    createdAt: '2026-09-18T16:00:00.000Z',
  },
];
