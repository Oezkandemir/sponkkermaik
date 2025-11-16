import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * API Route für Chatbase JWT Token-Generierung
 * 
 * Diese Route generiert JWT-Tokens für die Benutzeridentifikation in Chatbase.
 * 
 * WICHTIG: Diese Route sollte nur aufgerufen werden, wenn ein Benutzer eingeloggt ist.
 * Aktuell ist die Route deaktiviert, da keine Benutzeranmeldung implementiert ist.
 * 
 * Um diese Route zu aktivieren:
 * 1. Implementieren Sie eine Benutzeranmeldung
 * 2. Prüfen Sie die Authentifizierung in dieser Route
 * 3. Aktivieren Sie die Identifikation in ChatbaseWidget.tsx
 */

const CHATBASE_IDENTITY_SECRET = process.env.CHATBASE_IDENTITY_SECRET;

export async function GET(request: NextRequest) {
  // Aktuell deaktiviert - keine Benutzeranmeldung vorhanden
  return NextResponse.json(
    { error: 'User identification not available' },
    { status: 401 }
  );

  // TODO: Aktivieren Sie diesen Code, wenn eine Benutzeranmeldung implementiert ist
  /*
  try {
    // Prüfen Sie, ob der Benutzer eingeloggt ist
    const user = await getSignedInUser(); // Implementieren Sie diese Funktion
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!CHATBASE_IDENTITY_SECRET) {
      console.error('CHATBASE_IDENTITY_SECRET is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // JWT Token generieren
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        // Fügen Sie weitere benutzerdefinierte Attribute hinzu:
        // stripe_accounts: user.stripe_accounts,
        // name: user.name,
        // etc.
      },
      CHATBASE_IDENTITY_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating Chatbase token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
  */
}

