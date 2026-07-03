/* =========================================================
  GOOGLE APPS SCRIPT FOR JONATHAN & COLYN RSVP
  Sheet name: RSVP
========================================================= */

const SHEET_NAME = "RSVP";

function doPost(e) {
  const sheet = getOrCreateSheet_();
  const data = e.parameter || {};

  sheet.appendRow([
    new Date(),
    data.fullName || "",
    data.mobileNumber || "",
    data.email || "",
    data.attendance || "",
    data.reservedSeats || "1",
    data.mealPreference || "",
    data.message || "",
    data.submittedAt || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Full Name",
      "Mobile Number",
      "Email",
      "Attendance",
      "Reserved Seats",
      "Meal Preference",
      "Message to Couple",
      "Submitted At"
    ]);
  }

  return sheet;
}
