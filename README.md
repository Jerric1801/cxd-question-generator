# CXD Question Generator

A simple static web application built with Astro that generates random icebreaker questions using the Google Gemini API.

## Features

- 🎯 Generate random icebreaker questions for team meetings
- 🚀 Built with Astro for fast, modern web development
- 📄 Static site generation for optimal performance
- 📱 Responsive design with Tailwind CSS
- 🔒 Environment variable API key handling
- ☁️ Ready for deployment on Netlify

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Google Gemini API key

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cxd-question-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   To get a Gemini API key:
   1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   2. Create a new API key
   3. Copy the key to your `.env` file

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:4321`

## Development

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

## Deployment

### Netlify (Recommended)

1. **Connect your repository to Netlify**
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository in Netlify dashboard

2. **Set environment variables in Netlify**
   - Go to Site settings > Environment variables
   - Add `PUBLIC_GEMINI_API_KEY` with your API key value

3. **Deploy**
   - Netlify will automatically build and deploy your site
   - The `netlify.toml` file is already configured for static site deployment

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory

## Project Structure

```
cxd-question-generator/
├── src/
│   ├── pages/
│   │   └── index.astro          # Main page with UI
│   ├── styles/
│   │   └── global.css           # Global styles with Tailwind CSS
│   └── env.d.ts                 # Environment variable types
├── astro.config.mjs             # Astro configuration
├── tailwind.config.mjs          # Tailwind CSS configuration
├── netlify.toml                 # Netlify deployment config
├── package.json                 # Dependencies and scripts
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## How It Works

The application uses the Google Gemini API directly from the client-side. The API key is read from the `PUBLIC_GEMINI_API_KEY` environment variable and used to make requests to the Gemini API to generate random icebreaker questions.

**Note:** The `PUBLIC_` prefix is required for environment variables to be accessible in the client-side code.

## Technologies Used

- **Astro** - Modern web framework for static site generation
- **Tailwind CSS** - Utility-first CSS framework (locally installed)
- **Google Gemini API** - AI-powered question generation
- **Netlify** - Hosting and deployment platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

