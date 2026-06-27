import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const pincode = searchParams.get("pincode");

    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit pincode." },
        { status: 400 }
      );
    }

    // Fetch all configured delivery zones from database
    const zones = await db.deliveryZone.findMany();
    
    // Find the zone with the longest prefix that matches the customer's pincode
    // e.g. If pincode is "500001", "500" beats "50".
    let bestZone = null;
    let maxMatchLength = -1;

    for (const zone of zones) {
      if (pincode.startsWith(zone.prefix)) {
        if (zone.prefix.length > maxMatchLength) {
          bestZone = zone;
          maxMatchLength = zone.prefix.length;
        }
      }
    }

    if (bestZone) {
      if (!bestZone.isServiceable) {
        return NextResponse.json(
          { serviceable: false, message: "Sorry, we do not deliver to this pincode currently." },
          { status: 200 }
        );
      }

      const expectedDeliveryDate = new Date();
      // Add 1 day for warehouse handling to the configured transit days
      const totalDays = bestZone.transitDays + 1;
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + totalDays);

      return NextResponse.json({
        serviceable: true,
        expectedDelivery: expectedDeliveryDate.toISOString(),
        codAvailable: bestZone.codAvailable,
        transitDays: totalDays
      });
    }

    // Default Fallback if no zone matches
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 6); // 5 days + 1 handling

    return NextResponse.json({
      serviceable: true,
      expectedDelivery: expectedDeliveryDate.toISOString(),
      codAvailable: true,
      transitDays: 6,
      message: "Standard delivery applies"
    });
  } catch (error) {
    console.error("Delivery Check API Error:", error);
    return NextResponse.json(
      { error: "Failed to check delivery status" },
      { status: 500 }
    );
  }
}
