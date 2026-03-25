# Gestione Contenuti

Questo progetto usa due file JSON per gestire i contenuti senza toccare il codice principale:

1. `treatments.json`
2. `events.json`

Modifica solo questi file per aggiornare listino, eventi e promozioni.

## Regole Generali

1. Usa sempre le virgolette doppie `"`.
2. Dopo ogni blocco, se ce n'e' un altro sotto, serve la virgola.
3. Non lasciare virgole finali dopo l'ultimo elemento.
4. Le immagini vanno salvate nella cartella del progetto e richiamate con il nome file corretto, ad esempio `"Img_WorkshopArmocromia.png"`.
5. Se qualcosa non appare sul sito, controlla prima che il JSON sia scritto correttamente.

## `events.json`

Serve per la sezione `Eventi e offerte` della home.

Ogni elemento sta dentro `items` e puo' essere di due tipi:

1. `event`
2. `promo`

Ogni elemento ha anche il campo:

1. `active`

Se `active` e' `true`, l'elemento compare sul sito.
Se `active` e' `false`, l'elemento resta salvato ma non viene mostrato.

### Campi disponibili

1. `type`: `"event"` oppure `"promo"`
2. `active`: `true` oppure `false`
3. `title`: titolo della card
4. `tag`: piccolo badge, per esempio `"Workshop"` o `"Attiva"` o `"19 aprile | 15:00 - 18:00"`
5. `caption`: testo descrittivo
6. `price`: testo in evidenza, per esempio `"10 euro"` o `"da 30 euro"`
7. `subtitle`: testo secondario sotto o accanto al prezzo
8. `image`: nome file immagine, facoltativo, usato soprattutto per gli eventi
9. `imageAlt`: testo alternativo immagine
10. `ctaLabel`: testo del link finale
11. `ctaUrl`: link finale
12. `ctaType`: per ora puoi usare `"instagram"` oppure `"whatsapp"`

### Esempio evento

```json
{
  "type": "event",
  "active": true,
  "title": "Brinda ai tuoi colori",
  "tag": "Workshop",
  "image": "Img_WorkshopArmocromia.png",
  "imageAlt": "Workshop Brinda ai tuoi colori",
  "caption": "Workshop di armocromia con prova drappi dal vivo e aperitivo finale.",
  "price": "10 euro",
  "subtitle": "19 aprile | 15:00 - 18:00",
  "ctaLabel": "Per maggiori info vai al post Instagram",
  "ctaUrl": "https://www.instagram.com/p/DWBsohBjKik/",
  "ctaType": "instagram"
}
```

### Esempio promo ricorrente non attiva

```json
{
  "type": "promo",
  "active": false,
  "title": "Promo manicure",
  "tag": "Promo",
  "caption": "Manicure con trattamento rinforzante e finish luminoso.",
  "price": "da 25 euro",
}
```

### Come attivare una promo salvata

Se hai una promo gia' nel file e vuoi mostrarla:

```json
"active": true
```

Se vuoi nasconderla senza cancellarla:

```json
"active": false
```

## `treatments.json`

Serve per il listino trattamenti.

La struttura e':

1. `categories`
2. dentro ogni categoria ci sono le `sections`
3. dentro ogni sezione ci sono i `treatments`

### Campi categoria

1. `id`: identificativo tecnico, per esempio `"unghie"`
2. `label`: nome visibile del filtro
3. `sections`: elenco delle sezioni interne

### Campi sezione

1. `title`: nome della sezione
2. `fromPrice`: prezzo da mostrare accanto al titolo, facoltativo
3. `treatments`: elenco trattamenti
4. `notes`: note finali facoltative

### Campi trattamento

1. `name`: nome trattamento
2. `price`: prezzo
3. `duration`: durata
4. `description`: descrizione nel popup
5. `image`: immagine del popup

### Esempio trattamento

```json
{
  "name": "Kombi Manicure",
  "price": 20,
  "duration": "30 min",
  "description": "Descrizione del trattamento.",
  "image": "logo.png"
}
```

## Flusso pratico consigliato

1. Per aggiungere un evento o una promo: modifica `events.json`.
2. Per aggiungere o modificare un trattamento: modifica `treatments.json`.
3. Per nascondere una promo senza eliminarla: metti `"active": false`.
4. Per mostrare una promo gia' pronta: rimetti `"active": true`.

## Nota utile

Se apri il sito direttamente come file locale e qualcosa non compare, puo' dipendere dal `fetch` dei JSON. In quel caso conviene aprire il progetto con un piccolo server locale.
