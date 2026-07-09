export interface RouteInfo {
  name: string;
  origin: string;
  destination: string;
  fare: string;
  distance: string;
  duration: string;
  frequency: string;
  buses: number;
  stops: { name: string; time: string }[];
  departures: { busId: string; time: string; seats: number; eta: string }[];
}

export const ROUTES: Record<string, RouteInfo> = {
  "umuahia-aba": {
    name: "Umuahia → Aba",
    origin: "Umuahia Central Terminal",
    destination: "Aba Main Terminal",
    fare: "₦800", distance: "63 km", duration: "~90 min",
    frequency: "Every 30 minutes", buses: 6,
    stops: [
      { name: "Umuahia Central Terminal", time: "Departure" },
      { name: "Isigate Junction",         time: "~15 min"   },
      { name: "Osisioma Interchange",     time: "~55 min"   },
      { name: "Aba Main Terminal",        time: "~90 min"   },
    ],
    departures: [
      { busId: "BUS-04", time: "9:48 AM",  seats: 16, eta: "7 min"  },
      { busId: "BUS-07", time: "10:13 AM", seats: 38, eta: "32 min" },
      { busId: "BUS-02", time: "10:43 AM", seats: 50, eta: "62 min" },
    ],
  },
  "umuahia-ohafia": {
    name: "Umuahia → Ohafia",
    origin: "Umuahia Central Terminal",
    destination: "Ohafia Bus Park",
    fare: "₦1,000", distance: "88 km", duration: "~2 hrs",
    frequency: "Every 45 minutes", buses: 4,
    stops: [
      { name: "Umuahia Central Terminal", time: "Departure" },
      { name: "Bende Junction",           time: "~40 min"   },
      { name: "Ohafia Bus Park",          time: "~2 hrs"    },
    ],
    departures: [
      { busId: "BUS-11", time: "9:55 AM",  seats: 5,  eta: "15 min" },
      { busId: "BUS-09", time: "10:40 AM", seats: 42, eta: "60 min" },
    ],
  },
  "intra-aba": {
    name: "Intra-City Aba",
    origin: "Aba Main Terminal",
    destination: "Various city stops",
    fare: "₦150", distance: "City routes", duration: "~20 min",
    frequency: "Every 15 minutes", buses: 5,
    stops: [
      { name: "Aba Main Terminal",  time: "Departure" },
      { name: "Ariaria Market",     time: "~8 min"    },
      { name: "Ngwa Road Junction", time: "~14 min"   },
      { name: "Cemetery Junction",  time: "~20 min"   },
    ],
    departures: [
      { busId: "BUS-13", time: "9:45 AM", seats: 22, eta: "5 min"  },
      { busId: "BUS-15", time: "10:00 AM",seats: 50, eta: "20 min" },
    ],
  },
  "intra-umuahia": {
    name: "Intra-City Umuahia",
    origin: "Umuahia Central Terminal",
    destination: "Various city stops",
    fare: "₦150", distance: "City routes", duration: "~20 min",
    frequency: "Every 15 minutes", buses: 5,
    stops: [
      { name: "Umuahia Central Terminal", time: "Departure" },
      { name: "Ubani Market",             time: "~7 min"    },
      { name: "Government House Junction",time: "~13 min"   },
      { name: "Ikot Ekpene Road",         time: "~20 min"   },
    ],
    departures: [
      { busId: "BUS-18", time: "9:50 AM",  seats: 31, eta: "10 min" },
      { busId: "BUS-20", time: "10:05 AM", seats: 50, eta: "25 min" },
    ],
  },
};