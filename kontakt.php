<?php
/*
  Kontaktformular – Loredo’s Automobile
  -------------------------------------
  Schickt Anfragen aus dem Formular per E-Mail an EMPFAENGER.
  Läuft auf jedem Webspace mit PHP (z. B. Hostinger Webhosting).

  Die Mails kommen mit dem Absender webseite@loredosautomobile.de. Landen sie
  im Junk-Ordner: in Outlook als "Kein Junk" markieren bzw. Absender als
  sicher einstufen. Für noch zuverlässigere Zustellung bei Hostinger ein
  E-Mail-Konto anlegen (z. B. anfrage@loredosautomobile.de) und hier eintragen.
*/
declare(strict_types=1);

const EMPFAENGER = 'loredosautomobile@outlook.de';
const ABSENDER = ''; // leer = webseite@loredosautomobile.de (so getestet, kommt bei Outlook an)

date_default_timezone_set('Europe/Berlin');
$ajax = (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'fetch');

function antwort(bool $ok, bool $ajax, int $code = 200): void
{
    if ($ajax) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode(['ok' => $ok]);
    } else {
        // Ohne JavaScript zurück zur Startseite mit Rückmeldung
        header('Location: index.html?anfrage=' . ($ok ? 'ok' : 'fehler') . '#kontakt', true, 303);
    }
    exit;
}

function feld(string $name, int $max, bool $einzeilig = true): string
{
    $wert = $_POST[$name] ?? '';
    if (!is_string($wert)) {
        return '';
    }
    $wert = str_replace("\0", '', $wert);
    $wert = $einzeilig ? preg_replace('/[\r\n\t]+/', ' ', $wert) : str_replace("\r\n", "\n", $wert);
    $wert = trim((string) $wert);
    return function_exists('mb_substr') ? mb_substr($wert, 0, $max, 'UTF-8') : substr($wert, 0, $max);
}

function kopfzeile(string $text): string
{
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antwort(false, $ajax, 405);
}

// Spamschutz: verstecktes Feld muss leer bleiben, Ausfüllen dauert mindestens 2 Sekunden
if (feld('website', 200) !== '') {
    antwort(true, $ajax);
}
if (isset($_POST['dauer']) && (int) $_POST['dauer'] < 2000) {
    antwort(true, $ajax);
}

$anliegen  = feld('anliegen', 80);
$fahrzeug  = feld('fahrzeug', 200);
$name      = feld('name', 100);
$telefon   = feld('telefon', 50);
$email     = feld('email', 150);
// Häufige Tippfehler wie im Formular bereinigen: Leerzeichen, Komma statt Punkt, Punkt am Ende
$email     = rtrim((string) preg_replace(['/\s+/', '/,/', '/\.{2,}/'], ['', '.', '.'], $email), '.');
$nachricht = feld('nachricht', 4000, false);
$seite     = feld('seite', 300);

if ($name === '' || ($telefon === '' && $email === '')) {
    antwort(false, $ajax, 422);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    antwort(false, $ajax, 422);
}
if (preg_match_all('~https?://~i', $nachricht) > 3) {
    antwort(true, $ajax);
}

$host = strtolower((string) preg_replace('/^www\./i', '', (string) ($_SERVER['SERVER_NAME'] ?? '')));
if (!preg_match('/^[a-z0-9-]+(\.[a-z0-9-]+)+$/', $host)) {
    $host = 'localhost.localdomain';
}
$absender = ABSENDER !== '' ? ABSENDER : 'webseite@' . $host;

$betreff = 'Anfrage: ' . ($fahrzeug !== '' ? $fahrzeug : ($anliegen !== '' ? $anliegen : 'Allgemein')) . ' – ' . $name;

$text = "Neue Anfrage über die Webseite\n"
    . "==============================\n\n"
    . 'Anliegen:   ' . ($anliegen !== '' ? $anliegen : '–') . "\n"
    . 'Fahrzeug:   ' . ($fahrzeug !== '' ? $fahrzeug : '–') . "\n\n"
    . 'Name:       ' . $name . "\n"
    . 'Telefon:    ' . ($telefon !== '' ? $telefon : '–') . "\n"
    . 'E-Mail:     ' . ($email !== '' ? $email : '–') . "\n\n"
    . "Nachricht:\n" . ($nachricht !== '' ? $nachricht : '–') . "\n\n"
    . "------------------------------\n"
    . 'Gesendet am ' . date('d.m.Y') . ' um ' . date('H:i') . " Uhr\n"
    . ($seite !== '' ? 'Von der Seite: ' . $seite . "\n" : '')
    . ($email !== '' ? "Mit \"Antworten\" schreiben Sie direkt an den Kunden.\n" : '');

$kopf = [
    'From: ' . kopfzeile('Webseite Loredo’s Automobile') . ' <' . $absender . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: Webseite',
];
if ($email !== '') {
    $kopf[] = 'Reply-To: ' . $email;
}

$parameter = ABSENDER !== '' ? '-f' . ABSENDER : '';
$ok = @mail(EMPFAENGER, kopfzeile($betreff), $text, implode("\r\n", $kopf), $parameter);
antwort($ok, $ajax, $ok ? 200 : 500);
