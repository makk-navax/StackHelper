# StackHelper – Benutzerhandbuch

## 1. Einführung
- VS Code Erweiterug zur vereinfachten Fehleranalyse in BC
- Zielgruppe: Entwickler und Consultants

## 2. Erste Schritte
### 2.1 Systemanforderungen
- Betriebssystem: Windows(10, 11) | Linux (Debian, Ubuntu, Red Hat, Fedora, SUSE) | macOS (11.0+)
- Hardware: Computer mit ausreichend Prozessorleistung und RAM

### 2.2 Voraussetzungen
- StackHelper.vsix aus dem Repository herunterladen

### 2.2 Installation
1. VS Code öffnen
2. In den Reiter "Erweiterungen" navigieren
3. Auf die drei Punkte oben rechts drücken und "Install from vsix" auswählen
4. StackHelper.vsix auswählen

### 2.3 Schnellstart
- VS Code öffnen
- Projektordner (Workspace) in VS Code öffnen
- In die Erweiterung über der Aktivitätleiste navigieren

**Wichtig:**
Wenn kein Workspace ausgewählt wird kann die Erweiterung nicht starten.
Sie würde also unendlich versuchen den Workspace zu laden.

## 3. Benutzeroberfläche
### 3.1 Überblick
- Textfeld zur Eingabe der Fehlermeldung
- Button um die Fehlermeldung auszulesen
- Button um Textfeld zu leeren

- Call-Stack Anzeigebereich
- Call-Stack Eintrag

### 3.2 Navigation
- Buttons
- Call-Stack -> Link in die jeweiligen Quellcode Dateien

## 6. Konfiguration & Einstellungen
- Anzeige kann über die Farbschemata in VS Code geändert werden

## 7. Fehlerbehebung
- Häufige Probleme:
    - Erweiterung läd nicht beim Starten  ->  Workspace auswählen
    - Falls die Erweiterung immer noch nicht läd  ->  F1 und "Developer Reload Window"
