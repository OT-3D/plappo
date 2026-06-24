# 🦜 Plappo – Sprechen lernen mit Pepe

Eine spielerische Sprach-/Logopädie-Übungs-App für **Kinder von 2 bis 10 Jahren**.
Läuft als **PWA (Web-App)** auf **iPhone und iPad** (und auf jedem PC/Android im Browser) –
ohne App-Store, ohne Installation, ohne Konto, ohne Werbung. Alle Daten bleiben auf dem Gerät.

Maskottchen **Pepe der Papagei** spricht jedes Wort langsam und deutlich vor – Kinder sprechen nach.

---

## ▶ So spielst du es auf iPhone & iPad (am einfachsten)

1. **Doppelklick auf `Start-Plappo.bat`** auf dem Windows-PC.
   (Falls Windows nach der Firewall fragt → *Zugriff zulassen*.)
2. Das Fenster zeigt zwei Adressen. Nimm die **„Auf iPhone / iPad"**-Adresse,
   z. B. `http://192.168.0.42:8080`.
   *(iPhone/iPad muss im **gleichen WLAN** sein wie der PC.)*
3. Diese Adresse in **Safari** auf dem iPhone/iPad öffnen.
4. **Als App-Kachel speichern:** Safari → **Teilen-Symbol** (Viereck mit Pfeil) →
   **„Zum Home-Bildschirm"**. Fertig – Plappo liegt jetzt als Icon auf dem Home-Bildschirm
   und startet im Vollbild wie eine echte App.

> Beim ersten Antippen den großen **„Los geht's!"**-Knopf drücken – das schaltet (auf Apple-Geräten nötig) den Ton frei.

### Soll Plappo überall & offline laufen (ohne den PC)?
Die LAN-Variante oben braucht den laufenden PC im gleichen WLAN. Für eine **dauerhafte,
offline-fähige Installation** kann der `Plappo`-Ordner kostenlos auf einen Static-Host gelegt
werden (HTTPS), z. B.:
- **Netlify Drop:** `https://app.netlify.com/drop` öffnen und den **ganzen `Plappo`-Ordner** hineinziehen → fertige HTTPS-URL.
- oder GitHub Pages / Cloudflare Pages / Vercel.

Erst über **HTTPS** funktioniert der Service-Worker → echte Offline-Nutzung (nach 1× Laden
ohne Internet spielbar). Sag Bescheid, wenn ich beim Deployen helfen soll.

---

## 🎮 Die Spiele

| Spiel | Was es übt | Bewertung |
|---|---|---|
| **Aufwärmen** 👅 | Mund-Turnen – ein **animiertes Gesicht macht jede Übung vor** | – |
| **Sprich nach** 🦜 | Lautanbahnung: Hören → Nachsprechen → **Klang-Check** → sich selbst anhören | automatisch + Eltern-Override |
| **Zauberschlüssel** 🔑 | Lautschlüssel (Sprachify): Tier-Trick (Rabe „Kra"→k, Tiger „Grrr"→r …), dann Wörter | sich selbst hören |
| **Wörter-Welt** 🔎 | Wortschatz & Wort-Erkennung zum Ziel-Laut | automatisch |
| **Gleich oder anders?** 👂 | Auditive Diskrimination (Minimalpaare hören) | automatisch |
| **Welches Wort?** 🎯 | Minimalpaar-Identifikation | automatisch |
| **Anlaut-Jagd** 🔤 | Anlaut-Erkennung (z. B. „was beginnt mit /s/?") | automatisch |
| **Silben klatschen** 👏 | Silbensegmentierung | automatisch |
| **Reim-Paare** 🎵 | Reim-Erkennung | automatisch |
| **Quatsch-Maschine** 🤪 | Quatschwörter-Methode (Sprachify) – alberne Zauberwörter nachsprechen | Spaß, kein Score |

Belohnung: Sterne ⭐, Konfetti, Jubel und ein **Sticker-Album** zum Sammeln.

## 🌱 Fortschritt sehen (nicht nur Belohnung)

- **Laut-Garten:** Jeder Laut wächst mit jedem Üben vom 🌱 Samen bis zur 🌸 Blüte – das Kind
  *sieht* seinen Fortschritt pro Laut.
- **Sprach-Tagebuch (Früher vs. Jetzt):** Im „Sprich nach"-Spiel werden die eigenen Aufnahmen
  über die Zeit gespeichert (lokal, IndexedDB). Im Tagebuch kann das Kind ein Wort antippen und
  **„Früher" gegen „Jetzt"** anhören – so hört es die eigene Verbesserung. (Selbst-Wahrnehmung ist
  ein Kernprinzip der Logopädie: *„Erst wenn ich es wahrnehme, kann ich es verändern."*)
- **Sticker-„Video":** Jeder gesammelte Sticker ist antippbar → die Figur spielt eine kleine
  Animation (fliegen, hüpfen, schwimmen, tanzen).
- **🎡 Spielplatz:** Mit erspielten ⭐ schaltet das Kind **echte Mini-Spiele zum Zocken** frei –
  🫧 Seifenblasen (ab 10 ⭐), 💨 **Pups-Party** (ab 20 ⭐, zum Lachen), 🧺 Pepe fängt (ab 30 ⭐).
  Üben lohnt sich, ohne Therapie-Druck.
- **Übungs-Serie** (🔥 Tage hintereinander) – als sanfte Motivation, nicht als Druck.

Der **Laut-Garten wächst** aus mehreren Spielen (Sprich nach, Wörter-Welt, Anlaut-Jagd).

## ✅ Stimmen-Validierung (Qualitätssicherung)

Damit Kinder nichts falsch lernen, wurde **jedes der 170 Modell-Wörter automatisch geprüft**:
jeder Clip wurde von einer Spracherkennung (Whisper) zurück-transkribiert und mit dem Soll-Wort
verglichen (mehrfach, in Trägersätzen, um ASR-Rauschen auszuschließen). Ergebnis: **169/170 korrekt**;
das eine unklare Wort wurde entfernt. Skripte: `C:\tmp\plappo_validate_voice.py` / `plappo_probe.py`.

---

## 👨‍👩‍👧 Elternbereich

Über das **⚙️-Zahnrad** (durch eine kleine Rechen-Aufgabe für Erwachsene geschützt):
- **Alter einstellen** → welche Laute angeboten werden (nach Lauterwerb, Fox-Boyer).
- **Ziel-Laute** gezielt wählen (z. B. nur /sch/, wenn das Kind das gerade übt).
- **Ton an/aus**, Hinweise zum gemeinsamen Üben, Sicherheits-Hinweise.
- **Eltern-Coach** mit Sonjas (Sprachify) Methode: die 3 Heim-Rituale (Fersengang, Mund-Fühlen
  beim Essen, Lausch-Spiel unterwegs) und „mit Humor & ohne Druck" (Koko, verhexte Tage).

---

## 🎤 Stimme & automatischer Klang-Check

- **Menschliche Stimme:** Alle Wörter und Sätze sind mit einer **lokalen Neural-Stimme**
  (Piper, deutsch) vorab erzeugt und gebündelt (`audio/`, ~6 MB, 378 Clips) — klingt deutlich
  natürlicher als die System-Stimme, gleichbleibend, **offline, kostenlos**. Fehlt ein Clip,
  springt automatisch die System-Stimme ein.
  *Aktuell: eine warme, natürliche Stimme (Piper „thorsten"). Eine weibliche Variante kann in
  wenigen Minuten neu gerendert werden — sag einfach, was dir nach dem Hören lieber ist.*
- **Klang-Check (On-Device):** Beim „Sprich nach"-Spiel analysiert die App die Aufnahme direkt
  auf dem Gerät (Web Audio/FFT): **Hat das Kind gesprochen? Laut & klar genug?** und bei den
  Zischlauten **s / sch** eine echte Spektral-Prüfung. Ergebnis = Ampel (🌟 super / 👍 fast /
  🔈 lauter). Das Kind hört danach **seine eigene Aufnahme** im Vergleich zu Pepe — so erkennt
  es den Unterschied selbst. Ehrlich: ein **ermutigender Übungs-Coach, kein klinischer Richter**.
  Die Kinderstimme verlässt nie das Gerät.
- **App-Store-Pfad:** Für eine spätere native iOS-App lässt sich der Klang-Check durch Apples
  **kostenlose, geräteinterne Speech-Erkennung** (offline) ersetzen — die Architektur passt dazu.

## 🩺 Fachlicher Hintergrund (wichtig)

Plappo ist ein **Spiel zum Üben und Anregen** und folgt etablierten Konzepten der deutschen
Logopädie (Lauterwerb nach **Fox-Boyer**, Lautanbahnung **Laut → Wort → Minimalpaar**,
phonologische Bewusstheit nach dem **Würzburger Trainingsprogramm**).

**Plappo ersetzt keine logopädische Diagnostik oder Therapie.** Bewusste Design-Entscheidungen:
- **Keine automatische Aussprache-Bewertung.** Spracherkennung ist auf iOS unzuverlässig und
  bei Kinderstimmen fehleranfällig – ein falsches „✗" wäre demotivierend und fachlich riskant.
  Stattdessen: **Vormachen → Nachsprechen → Aufnehmen/Anhören → Erwachsene:r bestätigt.**
  (Die Erkennungs-Spiele bewerten nur **Hör-Aufgaben**, das ist unbedenklich.)
- **Mundmotorik** ist als **Spaß-Aufwärmen** gerahmt, nicht als „Laut-Korrektur" (Evidenzlage).
- Bei Auffälligkeiten (z. B. mit 2 J. < 50 Wörter, Lispeln nach 4½ J., mit 4 J. schwer
  verständlich, Stottern mit Anstrengung, Verlust gekonnter Wörter) →
  **Kinderärzt:in, HNO oder Logopäd:in**.

---

## 🛠 Technik

- Reines **HTML/CSS/JavaScript**, kein Build-Schritt, kein Framework.
- **Bilder = Emojis** (rendern auf Apple-Geräten farbig, keine Asset-Dateien nötig).
- **Stimme:** vorab gerenderte **Neural-Clips** (`audio/`) + Web-Speech-Fallback.
- **Klang-Check & Aufnahme** über Web Audio (`AnalyserNode`/FFT) + `MediaRecorder` — alles lokal.
- **Schriften gebündelt** (Fredoka + Nunito, `fonts/`) für ein einheitliches Bild auf allen Geräten.
- **PWA**: `manifest.webmanifest` + Service-Worker (`sw.js`, cacht App + Schriften + alle Stimm-Clips) für Offline-Betrieb (über HTTPS).
- Getestet im Browser, alle Spiele fehlerfrei, iOS-Safari-Eigenheiten berücksichtigt
  (Audio-Freischaltung per Geste, Voice-Loading, Safe-Area, kein Doppel-Start).

### Ordnerstruktur
```
Plappo/
  index.html            App-Hülle (PWA-Meta, lädt alle Skripte)
  Start-Plappo.bat      Doppelklick-Starter (Server + iPhone-Adresse)
  manifest.webmanifest  PWA-Manifest
  sw.js                 Service-Worker (Offline-Cache)
  css/styles.css        Design-System "Pepes Dschungel" (Fredoka/Nunito, große Tap-Flächen)
  fonts/                gebündelte Schriften (Fredoka, Nunito)
  audio/                378 vorgerenderte Stimm-Clips + manifest.json
  icons/                App-Icons (Papagei)
  js/
    data.js             Inhalte: Laute, Wörter+Emoji, Minimalpaare, Silben, Reime …
    audio.js            Stimm-Clips + Fallback-TTS + Soundeffekte + Aufnahme + Klang-Analyse
    diary.js            Sprach-Tagebuch (Aufnahmen über die Zeit, IndexedDB)
    face.js             animiertes SVG-Gesicht für die Aufwärm-Übungen
    fun/                Spielplatz-Mini-Spiele (Seifenblasen, Pepe fängt)
    state.js            Sterne, Fortschritt, Alters-Einstellung (localStorage)
    ui.js               Pepe, Belohnungen, Konfetti, Leerlauf-Hinweis
    app.js              Hub, Navigation, Elternbereich
    games/              die 8 Spiele (je eine Datei)
```

### Mögliche Erweiterungen (v2)
- Pro Altersband zusätzlich Auswahl-Anzahl/Tempo skalieren (aktuell v. a. über Laut-Tiers).
- Aufnahmen optional speichern, um sie der Logopäd:in zu zeigen.
- Mehr Wörter/Sticker, eigene Pepe-Stimme statt System-TTS.

---

*Erstellt als fertige, spielbare PWA. Viel Spaß beim Plappern! 🦜*
