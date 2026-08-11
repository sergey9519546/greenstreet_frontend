const UNVERIFIED_BOOKING_EMBED =
  /<div class="booking-embed w-embed w-iframe w-script"><!-- Start of Meetings Embed Script -->[\s\S]*?<!-- End of Meetings Embed Script --><\/div>/g;

const BOOKING_FALLBACK =
  '<div class="booking-embed booking-fallback-panel"><p>Online scheduling is unavailable. Continue with the owned scenario-review form.</p><a class="booking-fallback-link" href="/book-demo">Open scenario review</a></div>';

/**
 * The legacy Webflow export carries an unverified HubSpot Meetings embed.
 * Preserve its popup shell for Webflow's interaction targets, but replace all
 * remote iframe and script content before the markup reaches the browser.
 */
export function replaceUnverifiedBookingEmbeds(html: string): string {
  return html.replace(UNVERIFIED_BOOKING_EMBED, BOOKING_FALLBACK);
}
