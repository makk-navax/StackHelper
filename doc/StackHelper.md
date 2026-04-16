# Entwicklerdokumentation – StackHelper

## Überblick

**Beschreibung:**
StackHelper ist eine VS Code Erweiterung die Fehlermeldungen aus BC analysiert und den darin enthaltenen Call-Stack extrahiert.
Dieser wird dann mit einer benutzerfreundlichen Navigation bereitgestellt.

**Ziel:**
Durch die Erweiterung soll das Analysieren von Fehlermeldungen automatisiert werden und die Effizienz steigern.

**Zielgruppe:**
Die Erweiterung richtet sich primär an Entwickler, kann aber von jedem der in BC Fehler analysiert genutzt werden.

**Hauptfunktionen:**

* Erfassung einer Fehlermeldung aus BC
* Auslesen des Call-Stacks aus der Fehlermeldung 
* Darstellung des ausgelesenen Call-Stacks entsprechend der Ausführungsreihenfolge 
* Navigation in die jeweilige Quellcode Datei über den Call-Stack
* Beim öffnen der Quellcode Datei wird in die Zeile der aufgerufenen Funktion gesprungen

## Architektur

**Architekturübersicht:**
Die System-Architektur wurde in zwei Schichten aufgeteilt.
In die Präsentations-Schicht und die Logik-Schicht

**Technologien:**

* Sprache: TypeScript / JavaScript
* Darstellung: HTML und CSS

**Komponenten:**

* StackHelper WebView: Die Oberfläche bei der man die Fehlermeldung eingibt und den Button zum auslesen drückt.
* Call-Stack WebView: Die Oberfläche bei der der ausgelesene Call-Stack angezeigt wird.
* File-Service: Baut beim starten der Erweiterung einen Index auf und weist jeder Quellcode Datei einen einzigartigen Schlüssel zu. Dieser setzt sich auch Objekttyp und Objekt-ID zusammen.

**Datenfluss:** 
Der Datenfluss ist eventbasiert. Die WebViews stoßen also ein Event an und die Logikschicht führt das entsprechende Event aus.

## Setup & Installation

### Voraussetzungen

* Node.js in einer aktuellen Version 20.x und aufwärts
* Git in einer aktuellen Version

### Installation

```bash
# Repository klonen
git clone https://github.com/makk-navax/StackHelper
```

## Nutzung / Getting Started

**Beispiel-Workflow:**

1. Fehlermeldung aus BC kopieren
2. Fehlermeldung bei StackHelper in der Textarea einfügen
3. Auf "Call-Stack auslesen" drücken
4. Innerhalb des Call-Stacks navigieren und eine Datei öffnen
5. Im Quellcode den Fehler analysieren

## Projekt-Struktur

```
/Stackhelper
│── .vscode/
│── doc/
│   ├── README.md
│   ├── StackHelper.md
│   ├── vsc-extension-quickstart.md
│── node_modules/
│── out/
│── resource/
│   ├── stack.png/
│── src/
│   ├── test/
│   ├── extension.ts
│   ├── fileIndexService.ts
│   ├── openCallstackEntry.ts
│── .gitignore
│── .vscode-test.mjs
│── .vscodeignore
│── package-lock.json
│── package.json
│── tsconfig.json
```

Die Quellcode Dateien des Projekts sind im "src" Ordner hinterlegt.

## 🧠 Designentscheidungen

* **GUI mit Umgebungs Vars:** Dadurch passt sich die GUI dem Farbschema des Benutzers an, was die benutzerfreundlichkeit fördert.
* **Schichtenarchitektur:** Erhöht die Wartbarkeit und Modularität um zukünftige Anpassungen und Erweiterung einfacher einspielen zu können

**Testarten:**

* Integration Tests
* Manuelle Tests

## 🚀 Deployment

**Voraussetzung:**
das Modul "vsce" ist installiert.

Installations-Befehl:
npm install -g @vscode/vsce

**Package:**

```bash
$ cd StackHelper
$ vsce package
# StackHelper.vsix wird generiert
```

**Deployment-Schritte:**

1. StackHelper.vsix manuell in VS Code installieren (Über das UI)
2. In der Aktivitätsleiste auf Erweiterungen gehen
3. Auf die drei Punkte und "Install from VSIX" auswählen

