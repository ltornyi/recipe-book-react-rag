https://mui.com/x/react-data-grid/

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

    cd api
    npm run build
    func host start

in a separate terminal

    cd ui/recipe-book
    npm run dev

in a separate terminal

    swa start http://localhost:5173/ --api-devserver-url http://localhost:7071

SWA is available at `http://localhost:4280/`. 