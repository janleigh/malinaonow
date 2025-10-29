# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

    ```bash
    npm install
    ```

2. Start the app

    ```bash
    npx expo start
    ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Development Builds

This project includes a GitHub Action workflow for automated development builds.

### Triggering a Development Build

The development build workflow can be triggered in two ways:

1. **Manual trigger**: Go to Actions > Development Build > Run workflow
2. **Automatic trigger**: Push to `dev`, `develop`, or `development` branches

### Setup Requirements

To use the development build workflow, you need to:

1. Add `EXPO_TOKEN` to your repository secrets (optional):
   - Get your token from [Expo Access Tokens](https://expo.dev/settings/access-tokens)
   - Add it to GitHub: Settings > Secrets and variables > Actions > New repository secret
   - Name: `EXPO_TOKEN`

2. Environment variables for the app are configured as repository secrets:
   - `EXPO_PUBLIC_MAPBOX_APIKEY`
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   
   These are automatically injected during the build process.

The workflow will run `expo prebuild` to generate native iOS and Android projects for development.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
