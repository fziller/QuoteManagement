# Welcome to your Quote Management 👋

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up and start Webserver by following the Setup guide in the [sample repo](https://gitlab.com/meisterwerk-public/mw-invoicing-api-sample). Make sure to seed some data.
3. a. If not done, create a new account for [ngrok](https://ngrok.com/)
   b. Create a [static URL](https://ngrok.com/blog-post/free-static-domains-ngrok-users) in your ngrok account.
   c. Make the Webserver publicly available by running
   ```bash
      ngrok http localhost:8090 --url ${NGROK_STATIC_DOMAIN}
   ```
4. Make sure to have either an [android emulator](https://developer.android.com/studio/run/managing-avds?hl=en) or a [ios simulator](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device) created by following the linked guides.

5. Start the app on the simulator / emulator like

```bash
   HOSTNAME=${NGROK_STATIC_DOMAIN} npx expo start
```

or connect your device and start it on android device via

```bash
   HOSTNAME=${NGROK_STATIC_DOMAIN} npx expo run:android --device
```

or on iOS device via

```bash
   HOSTNAME=${NGROK_STATIC_DOMAIN} npx expo run:ios --device
```

## Build the app

For building the application for an android device, execute

```bash
   cd android && HOSTNAME=${NGROK_STATIC_DOMAIN} ./gradlew assembleRelease
```

The \*.apk file can be found under android/app/build/outputs/apk/release/app-release.apk

## Run tests

## Supported Features

- ListQuotes view provides a list of available Quotes, which can be filtered by available status as well as customer names or email addresses. It can also be sorted by the given totals. It also provides proper loading states and error messages in case something goes wrong.
- CreateQuote view provides a functionality to create a new quote. Quote creation is also available when being offline and will be created once the user / device comes back.

## Known issues

- Queries created while being offline are not created when application is killed before sending it.
- Some further design issues, e.g. if only one query result is being shown
