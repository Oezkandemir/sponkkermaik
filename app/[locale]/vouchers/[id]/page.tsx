"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface VoucherMessage {
  id: string;
  sender_type: "customer" | "admin";
  sender_id: string | null;
  message: string;
  created_at: string;
}

/**
 * Voucher Details Page Component
 * 
 * Displays detailed information about a specific voucher including messages.
 * Allows both admins and customers to send messages (chat functionality).
 */
export default function VoucherDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const voucherId = params.id as string;
  const t = useTranslations("vouchers");
  const supabase = createClient();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState<any>(null);
  const [messages, setMessages] = useState<VoucherMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      
      setUser(user);
      
      // Load voucher first to verify access
      try {
        const { data: voucherData, error: voucherError } = await supabase
          .from("vouchers")
          .select("*")
          .eq("id", voucherId)
          .single();

        if (voucherError) throw voucherError;

        // Verify ownership or admin access
        const { data: adminData } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        const userIsAdmin = !!adminData;
        const isOwner = voucherData.user_id === user.id;

        if (!userIsAdmin && !isOwner) {
          router.push("/vouchers");
          return;
        }

        setIsAdmin(userIsAdmin);
        setVoucher(voucherData);
      } catch (err) {
        console.error("Error loading voucher:", err);
        router.push("/vouchers");
        return;
      }
      
      await loadMessages();
      setLoading(false);
    }

    if (voucherId) {
      loadData();
    }
  }, [voucherId]);

  /**
   * Loads messages for the voucher
   */
  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/vouchers/messages?voucherId=${voucherId}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  /**
   * Handles sending a reply (works for both admin and customer)
   */
  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      setReplyError("Bitte geben Sie eine Nachricht ein.");
      return;
    }

    setSendingReply(true);
    setReplyError(null);

    try {
      let response;
      
      if (isAdmin) {
        // Admin uses admin reply API
        response = await fetch("/api/vouchers/send-reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voucherId,
            message: replyMessage.trim(),
            customerEmail: voucher.user_email || "",
            customerName: voucher.customer_name || "Kunde",
            voucherCode: voucher.code,
            voucherValue: voucher.value,
          }),
        });
      } else {
        // Customer uses customer reply API (need to create this)
        response = await fetch("/api/vouchers/send-customer-reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voucherId,
            message: replyMessage.trim(),
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Senden der Nachricht");
      }

      // Success - clear reply and reload messages
      setReplyMessage("");
      setReplyError(null);
      await loadMessages();
    } catch (err) {
      console.error("Error sending reply:", err);
      setReplyError(err instanceof Error ? err.message : "Fehler beim Senden der Nachricht");
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return null;
  }

  const validUntilDate = new Date(voucher.valid_until).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href={isAdmin ? "/admin" : "/vouchers"}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {isAdmin ? "Zurück zum Admin-Dashboard" : "Zurück zu Meine Gutscheine"}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gutschein-Details</h1>
          <p className="text-gray-600">Gutschein-Code: <strong className="font-mono">{voucher.code}</strong></p>
        </div>

        {/* Voucher Information Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm opacity-90">Wert</label>
              <p className="text-4xl font-bold mt-1">{voucher.value}€</p>
            </div>
            
            <div>
              <label className="text-sm opacity-90">Status</label>
              <p className="mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  voucher.status === "active"
                    ? "bg-white/20 text-white"
                    : voucher.status === "pending"
                    ? "bg-yellow-200 text-yellow-800"
                    : voucher.status === "used"
                    ? "bg-blue-200 text-blue-800"
                    : voucher.status === "expired"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-red-200 text-red-800"
                }`}>
                  {voucher.status === "active" ? "Aktiv" : 
                   voucher.status === "pending" ? "Ausstehend" : 
                   voucher.status === "used" ? "Verwendet" : 
                   voucher.status === "expired" ? "Abgelaufen" : "Gesperrt"}
                </span>
              </p>
            </div>
            
            <div>
              <label className="text-sm opacity-90">Gültig bis</label>
              <p className="text-lg font-semibold mt-1">{validUntilDate}</p>
            </div>
            
            <div>
              <label className="text-sm opacity-90">Erstellt am</label>
              <p className="text-lg font-semibold mt-1">
                {new Date(voucher.created_at).toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {voucher.used_at && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <label className="text-sm opacity-90">Verwendet am</label>
              <p className="text-lg font-semibold mt-1">
                {new Date(voucher.used_at).toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Messages Section - Chat Style */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Nachrichten</h2>
          
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Noch keine Nachrichten vorhanden.</p>
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {messages.map((msg) => {
                  const isCurrentUser = (isAdmin && msg.sender_type === "admin") || (!isAdmin && msg.sender_type === "customer");
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          isCurrentUser
                            ? isAdmin
                              ? "bg-amber-600 text-white rounded-br-none"
                              : "bg-gray-600 text-white rounded-br-none"
                            : isAdmin
                            ? "bg-gray-100 text-gray-900 rounded-bl-none"
                            : "bg-amber-100 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${
                            isCurrentUser ? "text-white/80" : "text-gray-600"
                          }`}>
                            {msg.sender_type === "admin" ? "Admin" : isAdmin ? "Kunde" : "Sie"}
                          </span>
                          <span className={`text-xs ${
                            isCurrentUser ? "text-white/60" : "text-gray-500"
                          }`}>
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p className={`text-sm whitespace-pre-wrap ${
                          isCurrentUser ? "text-white" : "text-gray-700"
                        }`}>
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Chat Input Section (always visible for both admin and customer) */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isAdmin ? "Nachricht senden" : "Nachricht schreiben"}
            </h3>
            <div className="mb-4">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                disabled={sendingReply}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder={isAdmin ? "Schreiben Sie hier eine Nachricht an den Kunden..." : "Schreiben Sie hier eine Nachricht..."}
              />
            </div>
            {replyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {replyError}
              </div>
            )}
            <button
              onClick={handleSendReply}
              disabled={sendingReply || !replyMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sendingReply ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Wird gesendet...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {isAdmin ? "Nachricht senden" : "Nachricht senden"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}













