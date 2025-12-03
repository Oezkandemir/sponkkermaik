"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import VoucherReplyModal from "./VoucherReplyModal";
import VoucherMessagesModal from "./VoucherMessagesModal";

interface Voucher {
  id: string;
  user_id: string;
  code: string;
  value: number;
  status: "active" | "used" | "expired" | "pending" | "blocked";
  paypal_order_id: string | null;
  valid_until: string;
  used_at: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  customer_name?: string;
  payment_method?: "paypal" | "bank_transfer";
  hasMessages?: boolean;
}

type VoucherFilter = "all" | "active" | "pending" | "used" | "expired" | "blocked";

/**
 * Admin Vouchers Manager Component
 * 
 * Allows admins to view and manage all vouchers with filters.
 * Can change status, delete, and block vouchers.
 */
function AdminVouchersManager() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [activeFilter, setActiveFilter] = useState<VoucherFilter>("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  /**
   * Loads all vouchers from database using optimized API route
   * Memoized callback to prevent unnecessary re-renders
   */
  const loadVouchers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use API route for better performance and server-side optimization
      const response = await fetch("/api/admin/vouchers");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to load vouchers");
      }

      const result = await response.json();
      setVouchers(result.vouchers || []);
    } catch (err) {
      console.error("Error loading vouchers:", err);
      setMessage({ 
        type: "error", 
        text: err instanceof Error ? err.message : "Fehler beim Laden der Gutscheine" 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  /**
   * Updates voucher status
   */
  const updateVoucherStatus = async (voucherId: string, newStatus: Voucher["status"]) => {
    try {
      const updateData: any = { status: newStatus };
      
      // If marking as used, set used_at timestamp
      if (newStatus === "used" && !vouchers.find(v => v.id === voucherId)?.used_at) {
        updateData.used_at = new Date().toISOString();
      }
      
      // If unblocking or activating, clear used_at if it was blocked
      if ((newStatus === "active" || newStatus === "pending") && vouchers.find(v => v.id === voucherId)?.status === "blocked") {
        // Keep used_at if it was already set
      }

      const { error } = await supabase
        .from("vouchers")
        .update(updateData)
        .eq("id", voucherId);

      if (error) throw error;

      setMessage({ type: "success", text: "Gutschein-Status erfolgreich aktualisiert" });
      loadVouchers();
    } catch (err) {
      console.error("Error updating voucher status:", err);
      setMessage({ 
        type: "error", 
        text: `Fehler beim Aktualisieren des Status: ${err instanceof Error ? err.message : "Unbekannter Fehler"}` 
      });
    }
  };

  /**
   * Deletes a voucher
   */
  const deleteVoucher = async (voucherId: string) => {
    if (!confirm("Möchten Sie diesen Gutschein wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("vouchers")
        .delete()
        .eq("id", voucherId);

      if (error) throw error;

      setVouchers((prevVouchers) => prevVouchers.filter((v) => v.id !== voucherId));
      setMessage({ type: "success", text: "Gutschein erfolgreich gelöscht" });
      
      await loadVouchers();
    } catch (err) {
      console.error("Error deleting voucher:", err);
      setMessage({ 
        type: "error", 
        text: `Fehler beim Löschen des Gutscheins: ${err instanceof Error ? err.message : "Unbekannter Fehler"}` 
      });
    }
  };

  /**
   * Blocks a voucher
   */
  const blockVoucher = async (voucherId: string) => {
    if (!confirm("Möchten Sie diesen Gutschein wirklich sperren? Der Gutschein kann nicht mehr verwendet werden.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("vouchers")
        .update({ status: "blocked" })
        .eq("id", voucherId);

      if (error) throw error;

      setMessage({ type: "success", text: "Gutschein erfolgreich gesperrt" });
      loadVouchers();
    } catch (err) {
      console.error("Error blocking voucher:", err);
      setMessage({ 
        type: "error", 
        text: `Fehler beim Sperren des Gutscheins: ${err instanceof Error ? err.message : "Unbekannter Fehler"}` 
      });
    }
  };

  /**
   * Filters vouchers based on active filter
   * Memoized for performance
   */
  const filteredVouchers = useMemo(() => {
    switch (activeFilter) {
      case "active":
        return vouchers.filter((v) => v.status === "active");
      case "pending":
        return vouchers.filter((v) => v.status === "pending");
      case "used":
        return vouchers.filter((v) => v.status === "used");
      case "expired":
        return vouchers.filter((v) => v.status === "expired");
      case "blocked":
        return vouchers.filter((v) => v.status === "blocked");
      default:
        return vouchers;
    }
  }, [vouchers, activeFilter]);

  const filters: { id: VoucherFilter; label: string; icon: string }[] = [
    { id: "all", label: "Alle", icon: "📋" },
    { id: "active", label: "Aktiv", icon: "✅" },
    { id: "pending", label: "Ausstehend", icon: "⏳" },
    { id: "used", label: "Verwendet", icon: "🎫" },
    { id: "expired", label: "Abgelaufen", icon: "⏰" },
    { id: "blocked", label: "Gesperrt", icon: "🚫" },
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
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

      {/* Filter Tabs */}
      <div className="mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 min-w-max sm:min-w-0 sm:flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeFilter === filter.id
                  ? "border-amber-600 text-amber-600 bg-amber-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <span className="mr-1 sm:mr-2">{filter.icon}</span>
              <span className="hidden sm:inline">{filter.label}</span>
              <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
              {filter.id !== "all" && (
                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                  {vouchers.filter((v) => v.status === filter.id).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers List */}
      {filteredVouchers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Keine Gutscheine in dieser Kategorie</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 font-mono break-all">
                      {voucher.code}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${
                          voucher.status === "active"
                            ? "bg-green-100 text-green-700"
                            : voucher.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : voucher.status === "used"
                            ? "bg-blue-100 text-blue-700"
                            : voucher.status === "expired"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {voucher.status === "active"
                          ? "Aktiv"
                          : voucher.status === "pending"
                          ? "Ausstehend"
                          : voucher.status === "used"
                          ? "Verwendet"
                          : voucher.status === "expired"
                          ? "Abgelaufen"
                          : "Gesperrt"}
                      </span>
                      {voucher.status === "pending" && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 whitespace-nowrap">
                          {voucher.payment_method === "paypal" ? "PayPal" : "Überweisung"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Wert:</span>{" "}
                      <span className="font-bold text-amber-600">{voucher.value}€</span>
                    </div>
                    <div>
                      <span className="font-medium">Kunde:</span>{" "}
                      {voucher.customer_name || voucher.user_email?.split("@")[0] || `User ${voucher.user_id?.substring(0, 8)}...`}
                    </div>
                    <div>
                      <span className="font-medium">E-Mail:</span>{" "}
                      {voucher.user_email || `User ${voucher.user_id?.substring(0, 8)}...`}
                    </div>
                    <div>
                      <span className="font-medium">Gültig bis:</span>{" "}
                      {new Date(voucher.valid_until).toLocaleDateString("de-DE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div>
                      <span className="font-medium">Erstellt:</span>{" "}
                      {new Date(voucher.created_at).toLocaleDateString("de-DE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    {voucher.used_at && (
                      <div>
                        <span className="font-medium">Verwendet am:</span>{" "}
                        {new Date(voucher.used_at).toLocaleDateString("de-DE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    )}
                    {voucher.paypal_order_id && (
                      <div className="break-all">
                        <span className="font-medium">PayPal Order:</span>{" "}
                        <span className="font-mono text-xs break-all">{voucher.paypal_order_id.substring(0, 20)}...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="sm:ml-4 flex flex-col gap-2 w-full sm:w-auto">
                  {/* Details Button */}
                  <Link
                    href={`/vouchers/${voucher.id}`}
                    className="w-full sm:w-auto px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    title="Details anzeigen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Details
                  </Link>
                  
                  {/* Status Change Dropdown */}
                  <select
                    onChange={(e) => {
                      const newStatus = e.target.value as Voucher["status"];
                      if (newStatus !== voucher.status) {
                        updateVoucherStatus(voucher.id, newStatus);
                      }
                    }}
                    value={voucher.status}
                    className="w-full sm:w-auto px-3 py-1.5 text-xs border border-gray-300 rounded hover:border-gray-400 transition-colors bg-white"
                  >
                    <option value="pending">Ausstehend</option>
                    <option value="active">Aktiv</option>
                    <option value="used">Verwendet</option>
                    <option value="expired">Abgelaufen</option>
                    <option value="blocked">Gesperrt</option>
                  </select>
                  
                  {/* Reply Button */}
                  <button
                    onClick={() => {
                      setSelectedVoucher(voucher);
                      setReplyModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-3 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center justify-center gap-1"
                    title="Antwort senden"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Antworten
                  </button>
                  
                  {/* Messages Button (if messages exist) */}
                  {voucher.hasMessages && (
                    <button
                      onClick={() => {
                        setSelectedVoucher(voucher);
                        setMessagesModalOpen(true);
                      }}
                      className="w-full sm:w-auto px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                      title="Nachrichtenverlauf anzeigen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Nachrichten
                    </button>
                  )}
                  
                  {/* Block Button (only if not already blocked) */}
                  {voucher.status !== "blocked" && (
                    <button
                      onClick={() => blockVoucher(voucher.id)}
                      className="w-full sm:w-auto px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      title="Gutschein sperren"
                    >
                      Sperren
                    </button>
                  )}
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteVoucher(voucher.id)}
                    className="w-full sm:w-auto px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors sm:mt-2"
                    title="Gutschein löschen"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedVoucher && (
        <VoucherReplyModal
          isOpen={replyModalOpen}
          onClose={() => {
            setReplyModalOpen(false);
            setSelectedVoucher(null);
          }}
          voucherId={selectedVoucher.id}
          customerEmail={selectedVoucher.user_email || ""}
          customerName={selectedVoucher.customer_name || "Kunde"}
          voucherCode={selectedVoucher.code}
          voucherValue={selectedVoucher.value}
          validUntil={selectedVoucher.valid_until}
          onSuccess={() => {
            // Reload vouchers to update hasMessages flag
            loadVouchers();
          }}
        />
      )}

      {/* Messages Modal */}
      {selectedVoucher && (
        <VoucherMessagesModal
          isOpen={messagesModalOpen}
          onClose={() => {
            setMessagesModalOpen(false);
            setSelectedVoucher(null);
          }}
          voucherId={selectedVoucher.id}
        />
      )}
    </div>
  );
}

export default memo(AdminVouchersManager);

