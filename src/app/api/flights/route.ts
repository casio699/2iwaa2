import { NextResponse } from "next/server";

// Mock flight data - in a real implementation, this would scrape or fetch from the airport website
const mockFlights = [
  {
    flightNumber: "ME312",
    airline: "Middle East Airlines",
    origin: "دبي",
    destination: "بيروت",
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    estimatedTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    status: "Delayed",
    gate: "15",
    terminal: "1",
    type: "arrival"
  },
  {
    flightNumber: "TK829",
    airline: "Turkish Airlines",
    origin: "اسطنبول",
    destination: "بيروت",
    scheduledTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    estimatedTime: null,
    status: "On Time",
    gate: "8",
    terminal: "1",
    type: "arrival"
  },
  {
    flightNumber: "QR418",
    airline: "Qatar Airways",
    origin: "بيروت",
    destination: "الدوحة",
    scheduledTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    estimatedTime: null,
    status: "Boarding",
    gate: "22",
    terminal: "1",
    type: "departure"
  },
  {
    flightNumber: "EJU6789",
    airline: "easyJet",
    origin: "لندن",
    destination: "بيروت",
    scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    estimatedTime: null,
    status: "On Time",
    gate: "5",
    terminal: "2",
    type: "arrival"
  },
  {
    flightNumber: "ME234",
    airline: "Middle East Airlines",
    origin: "بيروت",
    destination: "القاهرة",
    scheduledTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    estimatedTime: null,
    status: "On Time",
    gate: "18",
    terminal: "1",
    type: "departure"
  },
  {
    flightNumber: "PS752",
    airline: "Ukraine International Airlines",
    origin: "كiev",
    destination: "بيروت",
    scheduledTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    estimatedTime: null,
    status: "On Time",
    gate: "12",
    terminal: "1",
    type: "arrival"
  },
  {
    flightNumber: "ME228",
    airline: "Middle East Airlines",
    origin: "بيروت",
    destination: "باريس",
    scheduledTime: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    estimatedTime: null,
    status: "On Time",
    gate: "25",
    terminal: "1",
    type: "departure"
  },
  {
    flightNumber: "AF568",
    airline: "Air France",
    origin: "باريس",
    destination: "بيروت",
    scheduledTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    estimatedTime: new Date(Date.now() + 8.5 * 60 * 60 * 1000).toISOString(),
    status: "Delayed",
    gate: "3",
    terminal: "2",
    type: "arrival"
  }
];

// GET /api/flights - Get flight information
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // arrival | departure | all

    let flights = mockFlights;
    
    if (type && type !== "all") {
      flights = mockFlights.filter(flight => flight.type === type);
    }

    // In a real implementation, you would:
    // 1. Use a web scraping service (like Puppeteer, Cheerio) on the server side
    // 2. Or use an official airport API if available
    // 3. Or integrate with a flight tracking service like FlightAware, FlightRadar24
    
    // For now, we return mock data with realistic timing
    const now = new Date();
    const updatedFlights = flights.map(flight => ({
      ...flight,
      // Randomly update some flight statuses to simulate real-time changes
      status: Math.random() > 0.8 ? 
        (Math.random() > 0.5 ? "Delayed" : "On Time") : 
        flight.status,
      estimatedTime: flight.status === "Delayed" ? 
        new Date(new Date(flight.scheduledTime).getTime() + Math.random() * 60 * 60 * 1000).toISOString() : 
        null
    }));

    return NextResponse.json({ 
      flights: updatedFlights,
      count: updatedFlights.length,
      lastUpdate: now.toISOString(),
      source: "Mock data - would be Beirut Airport website in production"
    });
  } catch (error) {
    console.error("Flights API error:", error);
    return NextResponse.json({ 
      flights: [], 
      count: 0, 
      error: "Failed to fetch flight data" 
    }, { status: 500 });
  }
}
