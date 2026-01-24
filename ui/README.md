steps
=====
1. install node@22

    brew install node@22
    echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc

2. create react router project

    cd ui
    npx create-react-router@latest

3. install "Azure Static Web Apps extension for Visual Studio Code"

[Extension on marketplace](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)

4. create static web app via extension

* pick subscription
* specify name of SWA
* app location is "ui/recipe-book"
* build location is "build/client" (this is relative to the app location)

build fails, nodejs >=20 is needed

add

    "engines": {
        "node": ">=22.0.0"
    },

to package.json and also change

    ssr: true

in `react-router.config`

5. local development

Create a `.env` file in the `ui/recipe-book` folder and add the allowed domain as an environment variable:

    VITE_ALLOWED_EMAIL_DOMAIN=mycompanydomain.com

If should be the same as the `ALLOWED_EMAIL_DOMAIN` configured for the API.

Run the function app locally:

    cd api
    npm start

Start the frontend dev server in a new terminal:

    cd ui/recipe-book
    npm run dev

Start the Static Web App emulator in a new terminal:

    swa start http://localhost:5173/ --api-devserver-url http://localhost:7071

SWA is available at `http://localhost:4280/`. 

6. Deploy to Azure

Deployment is automatic with Github actions when changes are pushed or merged into the main branch. Set up the
`VITE_ALLOWED_EMAIL_DOMAIN` as a repository variable (the github action references it). Go to
repository -> Settings -> Secrets and variables -> Actions -> Variables, and click **New repository variable**.

7. PWA

See `vite.config.ts` for the Vite PWA configuration. The service worker registration happens in `root.tsx`; new version check is also there.
The application icons were generated on [PWA Builder](https://www.pwabuilder.com/imageGenerator). Steps:

* Uploaded `PWABuilder/original_image.png` to the tool (the original image is of course AI-generated)
* Hit `Generate`
* Unzipped the downloaded `AppImages.zip`
* copied `ios/180.png` to `recipe-book/public/apple-touch-icon.png`
* copied `android/android-launchericon-192-192.png` and `android/android-launchericon-512-512.png` to `recipe-book/public/icons/icon-192.png` and
    `recipe-book/public/icons/icon-512.png`.

8. Install PWA on iOS

Once you have the deployed web app running in your mobile Safari, tap `...` and then `Share` and then `Add to Home Screen`.