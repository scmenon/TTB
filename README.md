# TTB Image Checker App

A React + Vite frontend application with AWS Amplify backend for image checking functionality.

## Project Overview

This project combines:
- **Frontend**: React 19 + Vite (Fast build tool with HMR)
- **Backend**: AWS Amplify with Lambda function for image processing
- **API**: REST API built with API Gateway

## Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** (v20+): [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **AWS CLI**: [Install Guide](https://aws.amazon.com/cli/)
- **Amplify CLI**: Will be installed in the setup

## Local Setup Instructions

### 1. Clone and Navigate to Project

```bash
cd smenon-ttb-app
```

### 2. Install Dependencies

```bash
npm install
```

This installs all frontend dependencies defined in `package.json`.

### 3. Configure AWS Credentials (First time only)

If you haven't already configured AWS credentials:

```bash
aws configure
```

You'll be prompted for:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (e.g., `json`)

### 4. Initialize Amplify (First time only)

If Amplify hasn't been initialized yet:

```bash
amplify init
```

Follow the interactive prompts to set up your Amplify environment.

### 5. Pull Backend Configuration

To sync with the cloud backend:

```bash
amplify pull
```

This pulls the current backend configuration and generates necessary files.

## Running the Application

### Development Server

Start the frontend development server with hot module replacement:

```bash
npm run dev
```

The application will typically run at `http://localhost:5173`

You'll see live reloading as you make changes to your React code.

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

### Lint Code

Check code quality and find potential issues:

```bash
npm run lint
```

## Backend Management

### View Backend Status

Check what resources are added to your backend:

```bash
amplify status
```

### Deploy Backend Changes

After making changes to backend resources:

```bash
amplify push
```

### Open Amplify Console

View your project in AWS Amplify Console:

```bash
amplify console
```

## Project Structure

```
smenon-ttb-app/
├── src/                    # React source code
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Entry point
│   ├── index.css          # Styles
│   └── assets/            # Static assets
├── amplify/               # AWS Amplify configuration
│   ├── backend/           # Backend resources
│   │   ├── function/      # Lambda functions
│   │   ├── api/           # REST API configuration
│   │   └── ...
│   └── cli.json           # Amplify CLI config
├── dist/                  # Production build (after npm run build)
├── public/                # Public static files
├── package.json           # Project dependencies and scripts
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── index.html             # HTML entry point
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `amplify status` | View backend resource status |
| `amplify push` | Deploy backend changes to AWS |
| `amplify pull` | Pull latest backend configuration |
| `amplify console` | Open AWS Amplify Console |

## Features

- ⚡ **Fast Development**: Vite provides instant HMR
- 🔄 **Live Reloading**: See changes instantly as you code
- 🚀 **Production Ready**: Optimized build with code splitting
- 🔐 **AWS Amplify Backend**: Serverless API and functions
- 📊 **Image Processing**: Lambda function for image checking

## Testing

The application can be tested locally by:

1. Running `npm run dev` to start the development server
2. Opening `http://localhost:5173` in your browser
3. Making API calls to the backend endpoint (available after `amplify push`)

## Deployment

To deploy to production using Amplify:

```bash
amplify publish
```

This builds and deploys both frontend and backend resources.

## Troubleshooting

### Node.js/npm not found
- Ensure Node.js is installed: `node --version`
- Update PATH if needed (see installation guide)

### Amplify CLI not found
- Install globally: `npm install -g @aws-amplify/cli`

### AWS Credentials Error
- Run `aws configure` to set up credentials
- Verify credentials: `aws sts get-caller-identity`

### Backend deployment fails
- Run `amplify pull` to sync configuration
- Check Python version for Lambda: `python --version`
- Ensure pipenv is installed: `pip install pipenv`

## Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [AWS Amplify Documentation](https://docs.amplify.aws)
- [AWS Lambda Python Guide](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html)

## React + Vite Plugin Information

This project uses:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) for Babel/Fast Refresh

For more plugin options, see the [Vite documentation](https://vitejs.dev/guide/features.html).
