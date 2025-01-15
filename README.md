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
4. Start the app like

```bash
   HOSTNAME=${NGROK_STATIC_URL} npx expo start
```

## Supported Features

- ListQuotes view provides a list of available Quotes, which can be filtered by available status. It also provides proper loading states and error messages in case something goes wrong.
- CreateQuote view provides a functionality to create a new quote. Quote creation is also available when being offline and will be created once the user / device comes back.
