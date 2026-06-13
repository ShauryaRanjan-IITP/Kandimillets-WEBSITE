import type { InquiryFormData } from "@/types";
import siteConfig from "@/data/siteConfig";

export type SubmitResult = {
  success: boolean;
  message: string;
};

/**
 * Submits inquiry form data to a Google Apps Script web app
 * that writes the data to a Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with columns:
 *    Timestamp | Name | Business Name | Location | Phone | Product Interest | Message
 *
 * 2. Go to Extensions > Apps Script and paste this code:
 *
 *    function doPost(e) {
 *      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *      var data = JSON.parse(e.postData.contents);
 *      sheet.appendRow([
 *        new Date(),
 *        data.name,
 *        data.businessName,
 *        data.location,
 *        data.phone,
 *        data.productInterest,
 *        data.message
 *      ]);
 *      return ContentService
 *        .createTextOutput(JSON.stringify({ result: 'success' }))
 *        .setMimeType(ContentService.MimeType.JSON);
 *    }
 *
 * 3. Deploy as Web App:
 *    - Execute as: Me
 *    - Who has access: Anyone
 *
 * 4. Copy the web app URL and paste it in src/data/siteConfig.ts
 *    under forms.googleSheetsUrl
 */
export async function submitToGoogleSheets(
  formData: InquiryFormData
): Promise<SubmitResult> {
  const url = siteConfig.forms.googleSheetsUrl;

  // Check if the URL has been configured
  if (!url || url === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL") {
    console.warn(
      "Google Sheets URL not configured. Form data logged to console:",
      formData
    );
    // In development, still return success so the UI flow works
    return {
      success: true,
      message:
        "Thank you for your inquiry! We will get back to you shortly.",
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Google Apps Script with no-cors returns opaque response
    // We treat any non-error as success
    return {
      success: true,
      message:
        "Thank you for your inquiry! We will get back to you shortly.",
    };
  } catch (error) {
    console.error("Form submission error:", error);
    return {
      success: false,
      message:
        "Something went wrong. Please try again or contact us directly via WhatsApp.",
    };
  }
}
