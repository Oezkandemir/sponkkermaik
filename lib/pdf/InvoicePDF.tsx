import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import React from "react";

// Note: react-pdf doesn't support CSS transforms or absolute positioning well
// We'll use fixed positioning relative to page dimensions

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
  },
  // Header/Briefkopf
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #000",
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  companyDetails: {
    fontSize: 10,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  invoiceInfo: {
    textAlign: "right",
    flex: 1,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1a1a1a",
  },
  invoiceNumber: {
    fontSize: 11,
    marginBottom: 5,
    fontWeight: "bold",
  },
  invoiceDate: {
    fontSize: 10,
    marginBottom: 3,
  },
  // Content sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    borderBottom: "1px solid #ccc",
    paddingBottom: 3,
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.5,
  },
  // Table styles
  table: {
    marginTop: 10,
    border: "1px solid #000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottom: "2px solid #000",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ccc",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableCell: {
    fontSize: 10,
  },
  colDescription: {
    width: "50%",
  },
  colDate: {
    width: "20%",
  },
  colAmount: {
    width: "15%",
    textAlign: "right",
  },
  colTotal: {
    width: "15%",
    textAlign: "right",
  },
  // Totals section
  totalsSection: {
    marginTop: 20,
    alignSelf: "flex-end",
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 10,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  subtotalRow: {
    borderTop: "1px solid #ccc",
    paddingTop: 5,
    marginTop: 5,
  },
  vatRow: {
    borderTop: "1px solid #ccc",
    paddingTop: 5,
    marginTop: 5,
  },
  grandTotalRow: {
    borderTop: "2px solid #000",
    paddingTop: 8,
    marginTop: 8,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  // Notes
  notesSection: {
    marginTop: 25,
    padding: 10,
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
  },
  // Footer
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    borderTop: "2px solid #000",
    fontSize: 9,
  },
  footerSection: {
    marginBottom: 12,
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  footerText: {
    fontSize: 9,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  footerBank: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #ccc",
  },
  footerLegal: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: "1px solid #ccc",
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
  // Paid stamp - positioned in top right corner
  paidStampContainer: {
    position: "absolute",
    top: 125,
    right: 50,
    width: 100,
    height: 50,
  },
  paidStamp: {
    backgroundColor: "#ffffff",
    padding: 6,
    borderRadius: 4,
    border: "2px solid #000000",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  paidStampText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 2,
  },
  paidStampDate: {
    fontSize: 7,
    color: "#000000",
    textAlign: "center",
  },
});

interface Invoice {
  invoice_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  course_title: string;
  booking_date: string;
  amount: number;
  status?: "draft" | "sent" | "paid" | "cancelled";
  paid_at?: string | null;
  notes?: string | null;
}

/**
 * Extracts participant data from notes field
 */
function extractParticipantData(notes: string | null): {
  participants: number;
  participant_names: string[];
  course_price_per_person: number;
} | null {
  if (!notes) return null;
  
  const match = notes.match(/__PARTICIPANT_DATA__:(.+)$/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Error parsing participant data:", e);
      return null;
    }
  }
  
  return null;
}

/**
 * Cleans notes by removing participant data JSON and participant list
 * when participants are already shown in invoice items
 */
function cleanNotesForDisplay(notes: string | null, hasMultipleParticipants: boolean): string | null {
  if (!notes) return null;
  
  let cleaned = notes;
  
  // Remove the JSON participant data string
  cleaned = cleaned.replace(/__PARTICIPANT_DATA__:.+$/, "").trim();
  
  // If multiple participants, remove the "Teilnehmer:" section from notes
  // because they're already shown in the invoice items
  if (hasMultipleParticipants) {
    // Remove "Teilnehmer:" section
    const lines = cleaned.split("\n");
    const cleanedLines: string[] = [];
    let skipParticipantsSection = false;
    
    for (const line of lines) {
      if (line.trim() === "Teilnehmer:") {
        skipParticipantsSection = true;
        continue;
      }
      if (skipParticipantsSection) {
        // Skip lines that match "Teilnehmer X: Name" pattern
        if (line.match(/^Teilnehmer \d+: .+$/)) {
          continue;
        }
        // If we hit a non-participant line, stop skipping
        skipParticipantsSection = false;
      }
      cleanedLines.push(line);
    }
    
    cleaned = cleanedLines.join("\n").trim();
  }
  
  return cleaned || null;
}

/**
 * Invoice PDF Document Component
 */
export const InvoiceDocument = ({ invoice }: { invoice: Invoice }) => {
  // Extract participant data from notes
  const participantData = extractParticipantData(invoice.notes);
  const hasMultipleParticipants = participantData && participantData.participants > 1;
  
  // Clean notes for display (remove participant data and participant list)
  const cleanedNotes = cleanNotesForDisplay(invoice.notes, hasMultipleParticipants);
  
  // Calculate VAT (19% in Germany)
  const VAT_RATE = 0.19;
  const netAmount = invoice.amount / (1 + VAT_RATE);
  const vatAmount = invoice.amount - netAmount;
  const isPaid = invoice.status === "paid";
  
  // Calculate price per person
  const pricePerPerson = participantData?.course_price_per_person || (netAmount / (participantData?.participants || 1));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Paid Stamp - positioned absolutely */}
        {isPaid && (
          <View style={styles.paidStampContainer}>
            <View style={styles.paidStamp}>
              <Text style={styles.paidStampText}>BEZAHLT</Text>
              {invoice.paid_at && (
                <Text style={styles.paidStampDate}>
                  {new Date(invoice.paid_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Text>
              )}
            </View>
          </View>
        )}
        {/* Header/Briefkopf */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>SPONK KERAMIK</Text>
              <Text style={styles.companyDetails}>Fürstenplatz 15</Text>
              <Text style={styles.companyDetails}>40215 Düsseldorf</Text>
              <Text style={styles.companyDetails}>Deutschland</Text>
              <Text style={styles.companyDetails}>Tel: +49 (0) 211 12345678</Text>
              <Text style={styles.companyDetails}>E-Mail: info@sponk-keramik.de</Text>
              <Text style={styles.companyDetails}>www.sponk-keramik.de</Text>
            </View>
            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceTitle}>RECHNUNG</Text>
              <Text style={styles.invoiceNumber}>
                Rechnungsnummer: {invoice.invoice_number}
              </Text>
              <Text style={styles.invoiceDate}>
                Datum: {new Date(invoice.created_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rechnungsempfänger:</Text>
          <Text style={styles.text}>{invoice.customer_name}</Text>
          <Text style={styles.text}>{invoice.customer_email}</Text>
        </View>

        {/* Invoice Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rechnungsposten:</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.colDescription]}>Beschreibung</Text>
              <Text style={[styles.tableCell, styles.colDate]}>Datum</Text>
              <Text style={[styles.tableCell, styles.colAmount]}>Menge</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>Gesamt</Text>
            </View>
            {hasMultipleParticipants && participantData ? (
              // Multiple participants: list each person separately
              participantData.participant_names.map((name: string, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colDescription]}>
                    {invoice.course_title} - {name}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDate]}>
                    {new Date(invoice.booking_date).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={[styles.tableCell, styles.colAmount]}>1</Text>
                  <Text style={[styles.tableCell, styles.colTotal]}>
                    {pricePerPerson.toFixed(2)} €
                  </Text>
                </View>
              ))
            ) : (
              // Single participant: show as before
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDescription]}>
                  {invoice.course_title}
                </Text>
                <Text style={[styles.tableCell, styles.colDate]}>
                  {new Date(invoice.booking_date).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Text>
                <Text style={[styles.tableCell, styles.colAmount]}>1</Text>
                <Text style={[styles.tableCell, styles.colTotal]}>
                  {netAmount.toFixed(2)} €
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={[styles.totalRow, styles.subtotalRow]}>
            <Text style={styles.totalLabel}>Zwischensumme (netto):</Text>
            <Text style={styles.totalValue}>{netAmount.toFixed(2)} €</Text>
          </View>
          <View style={[styles.totalRow, styles.vatRow]}>
            <Text style={styles.totalLabel}>MwSt. (19%):</Text>
            <Text style={styles.totalValue}>{vatAmount.toFixed(2)} €</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Gesamtbetrag (brutto):</Text>
            <Text style={styles.grandTotalValue}>{invoice.amount.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Notes */}
        {cleanedNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Hinweise:</Text>
            <Text style={styles.text}>{cleanedNotes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {!isPaid && (
            <>
              <View style={styles.footerSection}>
                <Text style={styles.footerTitle}>Zahlungsinformationen:</Text>
                <Text style={styles.footerText}>Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen auf folgendes Konto:</Text>
              </View>
              
              <View style={styles.footerBank}>
                <Text style={styles.footerText}>
                  <Text style={{ fontWeight: "bold" }}>Bank:</Text> Sparkasse Düsseldorf
                </Text>
                <Text style={styles.footerText}>
                  <Text style={{ fontWeight: "bold" }}>IBAN:</Text> DE89 3704 0044 0532 0130 00
                </Text>
                <Text style={styles.footerText}>
                  <Text style={{ fontWeight: "bold" }}>BIC:</Text> COBADEFFXXX
                </Text>
                <Text style={styles.footerText}>
                  <Text style={{ fontWeight: "bold" }}>Verwendungszweck:</Text> {invoice.invoice_number}
                </Text>
              </View>
            </>
          )}
          
          {isPaid && (
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Zahlungsinformationen:</Text>
              <Text style={styles.footerText}>
                Diese Rechnung wurde am {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }) : "unbekannt"} bezahlt.
              </Text>
            </View>
          )}

          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Kontakt:</Text>
            <Text style={styles.footerText}>SPONK KERAMIK</Text>
            <Text style={styles.footerText}>Fürstenplatz 15, 40215 Düsseldorf</Text>
            <Text style={styles.footerText}>Tel: +49 (0) 211 12345678</Text>
            <Text style={styles.footerText}>E-Mail: info@sponk-keramik.de</Text>
          </View>

          <View style={styles.footerLegal}>
            <Text>Geschäftsführer: [Name] | USt-IdNr.: DE123456789</Text>
            <Text>Handelsregister: HRB [Nummer] | Amtsgericht Düsseldorf</Text>
            <Text style={{ marginTop: 5 }}>
              Vielen Dank für Ihr Vertrauen und Ihren Auftrag!
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
