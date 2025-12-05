"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

interface Invoice {
  id: string;
  invoice_number: string;
  booking_id: string | null;
  customer_email: string;
  customer_name: string;
  course_title: string;
  booking_date: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "cancelled";
  created_at: string;
  sent_at: string | null;
  paid_at: string | null;
  notes: string | null;
}

interface Booking {
  id: string;
  customer_email: string;
  customer_name: string;
  course_title: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  participants?: number;
  course_price?: number;
  calculated_amount?: number;
}

/**
 * Admin Invoices Manager Component
 * 
 * Allows admins to create, view, and manage invoices for customer bookings.
 */
export default function AdminInvoicesManager() {
  const t = useTranslations("admin.invoices");
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<string>("");
  const [invoiceNotes, setInvoiceNotes] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  /**
   * Loads all invoices from API
   */
  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const url = statusFilter !== "all"
        ? `/api/admin/invoices?status=${statusFilter}`
        : "/api/admin/invoices";
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to load invoices");
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error("Error loading invoices:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Laden der Rechnungen",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  /**
   * Loads available bookings for invoice creation
   */
  const loadBookings = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/bookings");
      
      if (!response.ok) {
        throw new Error("Failed to load bookings");
      }

      const data = await response.json();
      // Filter bookings that don't already have an invoice
      const bookingsWithInvoices = new Set(invoices.map(inv => inv.booking_id).filter(Boolean));
      const availableBookings = (data.bookings || []).filter(
        (b: Booking) => !bookingsWithInvoices.has(b.id)
      );
      setBookings(availableBookings);
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  }, [invoices]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    if (showCreateModal) {
      loadBookings();
    }
  }, [showCreateModal, loadBookings]);

  /**
   * Extracts participant names from booking
   */
  const extractParticipantNames = (booking: Booking): string[] => {
    const participants: string[] = [];
    // First participant is the customer_name
    participants.push(booking.customer_name);
    
    // Extract additional participants from participantList if available
    // The API provides participantList which contains names from notes
    if ((booking as any).participantList && Array.isArray((booking as any).participantList)) {
      participants.push(...(booking as any).participantList);
    }
    
    return participants;
  };

  /**
   * Creates a new invoice from a booking
   * 
   * NOTE: This function ONLY creates the invoice with status "draft".
   * It does NOT send any emails. To send an invoice, use sendInvoice() instead.
   */
  const createInvoice = async () => {
    if (!selectedBooking || !invoiceAmount) {
      setMessage({ type: "error", text: "Bitte wählen Sie eine Buchung und geben Sie einen Betrag ein" });
      return;
    }

    const amount = parseFloat(invoiceAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Bitte geben Sie einen gültigen Betrag ein" });
      return;
    }

    // Extract participant names
    const participantNames = extractParticipantNames(selectedBooking);
    const participants = selectedBooking.participants || 1;
    const coursePricePerPerson = selectedBooking.course_price || 0;

    try {
      setCreating(true);
      setMessage(null);

      const response = await fetch("/api/admin/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          customer_email: selectedBooking.customer_email,
          customer_name: selectedBooking.customer_name,
          course_title: selectedBooking.course_title,
          booking_date: selectedBooking.booking_date,
          amount: amount,
          participants: participants,
          participant_names: participantNames,
          course_price_per_person: coursePricePerPerson,
          notes: invoiceNotes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }

      setMessage({ type: "success", text: "Rechnung erfolgreich erstellt" });
      setShowCreateModal(false);
      setSelectedBooking(null);
      setInvoiceAmount("");
      setInvoiceNotes("");
      await loadInvoices();
    } catch (err) {
      console.error("Error creating invoice:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Erstellen der Rechnung",
      });
    } finally {
      setCreating(false);
    }
  };

  /**
   * Sends invoice via email
   */
  const sendInvoice = async (invoiceId: string) => {
    try {
      setSending(invoiceId);
      setMessage(null);

      const response = await fetch(`/api/admin/invoices/${invoiceId}/send`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Send invoice error:", errorData);
        throw new Error(errorData.details || errorData.error || "Failed to send invoice");
      }

      setMessage({ type: "success", text: "Rechnung erfolgreich per E-Mail versendet" });
      await loadInvoices();
    } catch (err) {
      console.error("Error sending invoice:", err);
      const errorMessage = err instanceof Error ? err.message : "Fehler beim Versenden der Rechnung";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSending(null);
    }
  };

  /**
   * Updates invoice status
   * 
   * NOTE: This function ONLY updates the status in the database.
   * It does NOT send any emails. To send an invoice, use sendInvoice() instead.
   * Changing status to "sent" manually does NOT trigger email sending.
   */
  const updateStatus = async (invoiceId: string, newStatus: Invoice["status"]) => {
    try {
      setMessage(null);

      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      setMessage({ type: "success", text: "Status erfolgreich aktualisiert" });
      await loadInvoices();
    } catch (err) {
      console.error("Error updating status:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Aktualisieren des Status",
      });
    }
  };

  /**
   * Deletes an invoice
   */
  const deleteInvoice = async (invoiceId: string) => {
    try {
      setDeleting(invoiceId);
      setMessage(null);

      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete invoice");
      }

      setMessage({ type: "success", text: "Rechnung erfolgreich gelöscht" });
      setInvoiceToDelete(null);
      await loadInvoices();
    } catch (err) {
      console.error("Error deleting invoice:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Löschen der Rechnung",
      });
    } finally {
      setDeleting(null);
    }
  };

  /**
   * Shows preview of invoice PDF
   */
  const previewInvoicePDF = async (invoice: Invoice) => {
    setPreviewInvoice(invoice);
  };

  /**
   * Downloads PDF of invoice
   */
  const downloadPDF = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/pdf`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("PDF generation error:", errorData);
        throw new Error(errorData.details || errorData.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      const errorMessage = err instanceof Error ? err.message : "Fehler beim Herunterladen der PDF";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    }
  };

  /**
   * Filtered invoices based on search query
   */
  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return invoices;

    const query = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(query) ||
        inv.customer_name.toLowerCase().includes(query) ||
        inv.customer_email.toLowerCase().includes(query) ||
        inv.course_title.toLowerCase().includes(query)
    );
  }, [invoices, searchQuery]);

  /**
   * Gets status badge color
   */
  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "sent":
        return "bg-blue-100 text-blue-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /**
   * Gets status label
   */
  const getStatusLabel = (status: Invoice["status"]) => {
    switch (status) {
      case "draft":
        return "Entwurf";
      case "sent":
        return "Versendet";
      case "paid":
        return "Bezahlt";
      case "cancelled":
        return "Storniert";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-4 text-sm underline"
          >
            Schließen
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("createInvoice")}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
        >
          <option value="all">{t("allStatuses")}</option>
          <option value="draft">{t("statusDraft")}</option>
          <option value="sent">{t("statusSent")}</option>
          <option value="paid">{t("statusPaid")}</option>
          <option value="cancelled">{t("statusCancelled")}</option>
        </select>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t("noInvoices")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("invoiceNumber")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("customer")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("course")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("amount")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("date")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <div>{invoice.customer_name}</div>
                      <div className="text-xs text-gray-500">{invoice.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {invoice.course_title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.amount.toFixed(2)}€
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(invoice.created_at).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => previewInvoicePDF(invoice)}
                          className="text-green-600 hover:text-green-700"
                          title="Vorschau"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => downloadPDF(invoice.id)}
                          className="text-amber-600 hover:text-amber-700"
                          title={t("downloadPDF")}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        {invoice.status === "draft" && (
                          <button
                            onClick={() => sendInvoice(invoice.id)}
                            disabled={sending === invoice.id}
                            className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                            title={t("sendEmail")}
                          >
                            {sending === invoice.id ? (
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        )}
                        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                          <select
                            value={invoice.status}
                            onChange={(e) => updateStatus(invoice.id, e.target.value as Invoice["status"])}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="draft">{t("statusDraft")}</option>
                            <option value="sent">{t("statusSent")}</option>
                            <option value="paid">{t("statusPaid")}</option>
                            <option value="cancelled">{t("statusCancelled")}</option>
                          </select>
                        )}
                        <button
                          onClick={() => setInvoiceToDelete(invoice)}
                          disabled={deleting === invoice.id}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          title="Löschen"
                        >
                          {deleting === invoice.id ? (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => !creating && setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t("createInvoice")}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("selectBooking")} *
                </label>
                <select
                  value={selectedBooking?.id || ""}
                  onChange={(e) => {
                    const booking = bookings.find((b) => b.id === e.target.value);
                    setSelectedBooking(booking || null);
                    if (booking && booking.calculated_amount) {
                      // Automatically calculate amount: participants * course_price
                      setInvoiceAmount(booking.calculated_amount.toFixed(2));
                    } else {
                      setInvoiceAmount("");
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">{t("selectBookingPlaceholder")}</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.customer_name} - {booking.course_title} ({new Date(booking.booking_date).toLocaleDateString("de-DE")})
                    </option>
                  ))}
                </select>
              </div>

              {selectedBooking && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div><strong>{t("customer")}:</strong> {selectedBooking.customer_name}</div>
                    <div><strong>{t("email")}:</strong> {selectedBooking.customer_email}</div>
                    <div><strong>{t("course")}:</strong> {selectedBooking.course_title}</div>
                    <div><strong>{t("date")}:</strong> {new Date(selectedBooking.booking_date).toLocaleDateString("de-DE")}</div>
                    <div><strong>{t("time")}:</strong> {selectedBooking.start_time} - {selectedBooking.end_time}</div>
                    {selectedBooking.participants !== undefined && (
                      <div><strong>Teilnehmer:</strong> {selectedBooking.participants}</div>
                    )}
                    {selectedBooking.course_price !== undefined && selectedBooking.course_price > 0 && (
                      <div><strong>Kurspreis pro Person:</strong> {selectedBooking.course_price.toFixed(2)}€</div>
                    )}
                    {selectedBooking.calculated_amount !== undefined && selectedBooking.calculated_amount > 0 && (
                      <div className="pt-2 border-t border-gray-300">
                        <strong className="text-base">Berechneter Betrag:</strong> {selectedBooking.calculated_amount.toFixed(2)}€
                        {selectedBooking.participants !== undefined && selectedBooking.course_price !== undefined && (
                          <span className="text-gray-600 text-xs ml-2">
                            ({selectedBooking.participants} × {selectedBooking.course_price.toFixed(2)}€)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("amount")} (€) *
                      {selectedBooking.calculated_amount !== undefined && selectedBooking.calculated_amount > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          (automatisch berechnet, kann angepasst werden)
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("notes")} ({t("optional")})
                    </label>
                    <textarea
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder={t("notesPlaceholder")}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedBooking(null);
                    setInvoiceAmount("");
                    setInvoiceNotes("");
                  }}
                  disabled={creating}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={createInvoice}
                  disabled={creating || !selectedBooking || !invoiceAmount}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? t("creating") : t("create")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewInvoice && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewInvoice(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Rechnungsvorschau: {previewInvoice.invoice_number}
              </h3>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* PDF Preview */}
            <div className="flex-1 overflow-auto p-6 bg-gray-100">
              <div className="w-full h-full min-h-[600px] border border-gray-300 rounded-lg bg-white overflow-hidden">
                <object
                  data={`/api/admin/invoices/${previewInvoice.id}/pdf?preview=true`}
                  type="application/pdf"
                  className="w-full h-full min-h-[600px]"
                  aria-label="Invoice Preview"
                >
                  <div className="p-8 text-center">
                    <p className="text-gray-600 mb-4">Die PDF-Vorschau konnte nicht geladen werden.</p>
                    <button
                      onClick={() => downloadPDF(previewInvoice.id)}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold"
                    >
                      PDF herunterladen
                    </button>
                  </div>
                </object>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Schließen
              </button>
              <button
                onClick={() => {
                  downloadPDF(previewInvoice.id);
                  setPreviewInvoice(null);
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF herunterladen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {invoiceToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => !deleting && setInvoiceToDelete(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rechnung löschen?</h3>
            <p className="text-gray-600 mb-6">
              Möchten Sie die Rechnung <strong>{invoiceToDelete.invoice_number}</strong> wirklich löschen?
              <br />
              <br />
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setInvoiceToDelete(null)}
                disabled={deleting === invoiceToDelete.id}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={() => deleteInvoice(invoiceToDelete.id)}
                disabled={deleting === invoiceToDelete.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting === invoiceToDelete.id ? "Löschen..." : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

