"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface NewsletterComposerProps {
  activeSubscribersCount: number;
  allSubscribersCount: number;
}

interface NewsletterSection {
  id: string;
  type: "heading" | "text" | "image" | "button" | "divider";
  content: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
}

/**
 * Newsletter Composer Component
 * 
 * Allows admins to create newsletters using a template-based editor.
 */
export default function NewsletterComposer({
  activeSubscribersCount,
  allSubscribersCount,
}: NewsletterComposerProps) {
  const t = useTranslations("admin.newsletter");
  const [subject, setSubject] = useState("");
  const [sections, setSections] = useState<NewsletterSection[]>([
    {
      id: "1",
      type: "heading",
      content: "Willkommen zu unserem Newsletter!",
    },
    {
      id: "2",
      type: "text",
      content: "Hier können Sie Ihren Text eingeben. Erzählen Sie Ihren Abonnenten von neuen Kursen, Angeboten oder Neuigkeiten.",
    },
  ]);
  const [recipientType, setRecipientType] = useState<"active" | "all">("active");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  /**
   * Adds a new section to the newsletter
   */
  const addSection = (type: NewsletterSection["type"]) => {
    const newSection: NewsletterSection = {
      id: Date.now().toString(),
      type,
      content: type === "heading" ? "Neue Überschrift" : type === "text" ? "Neuer Text" : "",
      buttonText: type === "button" ? "Jetzt buchen" : undefined,
      buttonLink: type === "button" ? "https://www.sponkkeramik.de/book-course" : undefined,
    };
    setSections([...sections, newSection]);
  };

  /**
   * Removes a section
   */
  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  /**
   * Updates a section
   */
  const updateSection = (id: string, updates: Partial<NewsletterSection>) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  /**
   * Moves a section up or down
   */
  const moveSection = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex((s) => s.id === id);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const newSections = [...sections];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      setSections(newSections);
    } else if (direction === "down" && index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      setSections(newSections);
    }
  };

  /**
   * Handles image upload
   */
  const handleImageUpload = async (sectionId: string, file: File) => {
    // In production, you would upload to a storage service
    // For now, we'll use a data URL (base64)
    const reader = new FileReader();
    reader.onloadend = () => {
      updateSection(sectionId, { imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  /**
   * Generates HTML from sections
   */
  const generateHtml = useMemo(() => {
    let htmlContent = "";

    sections.forEach((section) => {
      switch (section.type) {
        case "heading":
          htmlContent += `<h2 style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 20px 0 15px 0; line-height: 1.4;">${section.content}</h2>`;
          break;
        case "text":
          htmlContent += `<p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 15px 0;">${section.content.replace(/\n/g, "<br>")}</p>`;
          break;
        case "image":
          if (section.imageUrl) {
            htmlContent += `<div style="margin: 25px 0; text-align: center;">
              <img src="${section.imageUrl}" alt="Newsletter Bild" style="max-width: 100%; height: auto; border-radius: 8px;" />
            </div>`;
          }
          break;
        case "button":
          htmlContent += `<div style="margin: 30px 0; text-align: center;">
            <a href="${section.buttonLink || "#"}" style="display: inline-block; background-color: #d97706; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">${section.buttonText || "Button"}</a>
          </div>`;
          break;
        case "divider":
          htmlContent += `<div style="border-top: 2px solid #e5e7eb; margin: 30px 0;"></div>`;
          break;
      }
    });

    return htmlContent;
  }, [sections]);

  /**
   * Generates preview HTML with email template
   */
  const previewHtml = useMemo(() => {
    if (!generateHtml.trim()) {
      return "";
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || "Newsletter"}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 40px 20px; text-align: center;">
              <img src="https://www.sponkkeramik.de/images/emaillogo.webp" alt="Sponk Keramik Logo" style="max-width: 400px; width: 100%; height: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${generateHtml}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong style="color: #1f2937;">Sponk Keramik</strong><br>
                Fürstenplatz 15<br>
                40215 Düsseldorf
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af;">
                <a href="https://www.sponkkeramik.de/newsletter/unsubscribe?email={{EMAIL}}" style="color: #6b7280; text-decoration: underline;">Vom Newsletter abmelden</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }, [generateHtml, subject]);

  /**
   * Handles newsletter sending
   */
  const handleSend = async () => {
    if (!subject.trim()) {
      setMessage({ type: "error", text: "Bitte geben Sie einen Betreff ein." });
      return;
    }

    if (sections.length === 0 || !generateHtml.trim()) {
      setMessage({ type: "error", text: "Bitte fügen Sie mindestens einen Abschnitt hinzu." });
      return;
    }

    if (!confirm(`Möchten Sie diesen Newsletter wirklich an ${recipientType === "active" ? activeSubscribersCount : allSubscribersCount} Empfänger senden?`)) {
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          htmlContent: generateHtml,
          recipientType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Versenden des Newsletters");
      }

      setMessage({
        type: "success",
        text: `Newsletter erfolgreich an ${data.sentCount} Empfänger gesendet!`,
      });

      // Reset form
      setSubject("");
      setSections([
        {
          id: "1",
          type: "heading",
          content: "Willkommen zu unserem Newsletter!",
        },
        {
          id: "2",
          type: "text",
          content: "Hier können Sie Ihren Text eingeben.",
        },
      ]);
    } catch (err) {
      console.error("Error sending newsletter:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Versenden des Newsletters",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recipient Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Empfänger auswählen</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="recipientType"
              value="active"
              checked={recipientType === "active"}
              onChange={(e) => setRecipientType(e.target.value as "active" | "all")}
              className="w-4 h-4 text-amber-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Nur aktive Abonnenten ({activeSubscribersCount})
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="recipientType"
              value="all"
              checked={recipientType === "all"}
              onChange={(e) => setRecipientType(e.target.value as "active" | "all")}
              className="w-4 h-4 text-amber-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Alle Abonnenten ({allSubscribersCount})
            </span>
          </label>
        </div>
      </div>

      {/* Subject */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <label htmlFor="newsletter-subject" className="block text-sm font-medium text-gray-700 mb-2">
          Betreff *
        </label>
        <input
          id="newsletter-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="z.B. Neue Kurse im Januar 2025"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Sections Editor */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Newsletter-Inhalt</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => addSection("heading")}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300"
            >
              + Überschrift
            </button>
            <button
              type="button"
              onClick={() => addSection("text")}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300"
            >
              + Text
            </button>
            <button
              type="button"
              onClick={() => addSection("image")}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300"
            >
              + Bild
            </button>
            <button
              type="button"
              onClick={() => addSection("button")}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300"
            >
              + Button
            </button>
            <button
              type="button"
              onClick={() => addSection("divider")}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300"
            >
              + Trennlinie
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Keine Abschnitte vorhanden. Fügen Sie einen Abschnitt hinzu, um zu beginnen.</p>
            </div>
          ) : (
            sections.map((section, index) => (
              <div
                key={section.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {section.type === "heading" && "Überschrift"}
                      {section.type === "text" && "Text"}
                      {section.type === "image" && "Bild"}
                      {section.type === "button" && "Button"}
                      {section.type === "divider" && "Trennlinie"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Nach oben"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, "down")}
                      disabled={index === sections.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Nach unten"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Löschen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {section.type === "heading" && (
                  <input
                    type="text"
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    placeholder="Überschrift eingeben..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-xl font-bold"
                  />
                )}

                {section.type === "text" && (
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    placeholder="Text eingeben..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                )}

                {section.type === "image" && (
                  <div className="space-y-3">
                    {section.imageUrl ? (
                      <div className="relative">
                        <img
                          src={section.imageUrl}
                          alt="Newsletter"
                          className="w-full h-auto rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => updateSection(section.id, { imageUrl: undefined })}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(section.id, file);
                          }}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 transition-colors">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-600">Klicken Sie hier, um ein Bild hochzuladen</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG oder WEBP</p>
                        </div>
                      </label>
                    )}
                  </div>
                )}

                {section.type === "button" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={section.buttonText || ""}
                      onChange={(e) => updateSection(section.id, { buttonText: e.target.value })}
                      placeholder="Button-Text (z.B. Jetzt buchen)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="url"
                      value={section.buttonLink || ""}
                      onChange={(e) => updateSection(section.id, { buttonLink: e.target.value })}
                      placeholder="Button-Link (z.B. https://www.sponkkeramik.de/book-course)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}

                {section.type === "divider" && (
                  <div className="border-t-2 border-gray-300 py-2">
                    <p className="text-xs text-gray-500 text-center">Trennlinie</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preview Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Vorschau</h3>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300"
          >
            {showPreview ? "Vorschau ausblenden" : "Vorschau anzeigen"}
          </button>
        </div>
        {showPreview && (
          <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden">
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-[600px] border-0"
                title="Newsletter Preview"
              />
            ) : (
              <div className="p-8 text-center text-gray-500">
                Fügen Sie Abschnitte hinzu, um die Vorschau zu sehen
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <p>{message.text}</p>
        </div>
      )}

      {/* Send Button */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <button
          onClick={handleSend}
          disabled={sending || !subject.trim() || sections.length === 0}
          className="w-full px-6 py-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 active:bg-amber-900 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Newsletter wird gesendet...
            </span>
          ) : (
            `Newsletter an ${recipientType === "active" ? activeSubscribersCount : allSubscribersCount} Empfänger senden`
          )}
        </button>
      </div>
    </div>
  );
}
