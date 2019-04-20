# Dayley

A daily task manager with various features. Dayley is a PWA made with Angular 7.

# Installation

  - Clone this repo
  - Run `npm install`
  - Create a Firebase project
  - Add your web credentials/certificate at `/src/app/configs/firebase.cert.json`
  - Add your admin service account at `/firebase-admin.cert.json`
  - Enable email authentication on the Firebase project
  - Enable realtime database on the Firebase project
  - Deploy `firebase.rules.json` to database rules
  - If Firebase hosting is used, make sure to have the following headers settings in your `firebase.json` under `hosting`:
    ```json
    "headers": [
      {
        "source": "ngsw-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
    ```

# Deploying

If Firebase hosting is used, use `npm run deploy`, otherwise make sure to run `node broadcast-version.js` to broadcast the new version to the database after each deploy.

# Building

Use `ng build --prod`.
