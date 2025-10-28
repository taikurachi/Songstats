# Songstats

Live Link: https://www.songstats.xyz/

A modern, feature-rich music analytics web application built with Next.js that provides comprehensive song data, streaming statistics, lyrics analysis, and more. Explore detailed insights about your favorite tracks with data from Spotify, streaming platforms, and concert events.

![Next.js](https://img.shields.io/badge/Next.js-15.1.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)

## Features

### **Search & Discovery**

- **Smart Search**: Debounced search with real-time suggestions
- **Quick Search**: Keyboard navigation support for efficient browsing
- **Search History**: Track your previous searches

### **Song Details**

- **Comprehensive Metadata**: Track name, artists, album, release date, duration
- **Album Artwork**: High-quality album cover images
- **Dynamic Color Themes**: Automatically extracted color palettes from album art
- **Artist Profiles**: Detailed information about artists
- **Similar Songs**: Discover tracks similar to what you're listening to
- **More By Artist**: Explore other works by the same artist

### **Analytics & Statistics**

- **Streaming Data**: Real-time stream counts from multiple platforms
- **Chart Performance**: Historical chart positions and trends
- **Country-by-Country Stats**: Streaming data broken down by country (via Kworb)
- **Visual Analytics**: Interactive charts and graphs

### **Lyrics & Analysis**

- **Synchronized Lyrics**: Display song lyrics with ISRC matching
- **AI-Powered Analysis**: Intelligent lyrics interpretation using Perplexity AI
- **Lyrics Scoring**: Automated quality and complexity scoring
- **Detailed Breakdown**: Genre classification and musical attributes

### **Related Media**

- **Music Videos**: Browse official music videos and related content
- **Video Grid/List Views**: Multiple viewing options for media content

### **Live Events**

- **Concert Information**: Find upcoming concerts and events via Ticketmaster
- **Event Details**: Venue, date, and ticket information

### **UI/UX Features**

- **Spotify-Inspired Design**: Beautiful, modern interface following Spotify's design language
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Smooth Animations**: Framer Motion animations for seamless transitions
- **Wave Background**: P5.js-powered animated background on the home page
- **Dark Theme**: Eye-friendly dark mode throughout the application

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: Next.js 15.1.2 (App Router)
- **UI Library**: React 19.0.0
- **Styling**: TailwindCSS 3.4.1
- **Animations**: Framer Motion (motion 12.0.6)
- **State Management**: TanStack Query (React Query) 5.80.7
- **Graphics**: P5.js 2.0.1
- **Image Processing**: ColorThief for color extraction

### **Backend & APIs**

- **Spotify API**: Authentication and music data
- **Ticketmaster API**: Concert and event information
- **Perplexity AI**: Lyrics analysis and scoring
- **AWS Lambda**: Python-based web scraper for streaming statistics
- **Custom Scrapers**: Kworb data scraping for country-specific stats

### **Development Tools**

- **Language**: TypeScript 5.0
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun package manager
- Spotify Developer Account
- Ticketmaster API Key (optional)
- Perplexity API Key (optional, for AI features)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token

# Ticketmaster API (Optional)
TICKETMASTER_API_KEY=your_ticketmaster_api_key

# Perplexity AI API (Optional - for lyrics analysis)
PERPLEXITY_API_KEY=your_perplexity_api_key
```

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Songstats
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

   - Copy `.env.example` to `.env.local` (if available)
   - Fill in your API credentials

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

## Getting API Keys

### Spotify API

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Copy the **Client ID** and **Client Secret**
4. For the refresh token, follow [Spotify's Authorization Guide](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)

### Ticketmaster API

1. Visit [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)
2. Sign up and create an app
3. Copy your API key

### Perplexity AI

1. Go to [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an API key
3. Add it to your environment variables

## Project Structure

```
Songstats/
├── app/
│   ├── (music-app)/          # Main app routes
│   │   ├── search/            # Search functionality
│   │   └── songs/             # Song detail pages
│   ├── api/                   # API routes
│   │   ├── events/            # Ticketmaster events
│   │   ├── lyrics-analysis/   # AI lyrics analysis
│   │   ├── token/             # Spotify authentication
│   │   └── external-scraper/  # Web scraping endpoints
│   ├── components/            # React components
│   │   ├── main-search/       # Search components
│   │   ├── song-page/         # Song detail components
│   │   ├── lyrics-component/  # Lyrics display
│   │   └── related-media/     # Video content
│   ├── context/               # React Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── utilsFn/               # Utility functions
│   │   ├── colorFn/           # Color manipulation
│   │   └── fetch*.ts          # API fetch functions
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── scripts/                   # Deployment scripts
│   └── lambda-scraper-final/  # AWS Lambda scraper
└── tests/                     # Test files
```

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**

```bash
npm i -g vercel
```

2. **Deploy**

```bash
vercel
```

3. **Set environment variables** in the Vercel dashboard

### AWS Lambda Scraper

For streaming statistics scraping functionality:

1. Navigate to `scripts/lambda-scraper-final/`
2. Follow instructions in `scripts/AWS_LAMBDA_DEPLOYMENT.md`
3. Deploy the Lambda function
4. Update your API endpoints to point to the Lambda function

See `scripts/DEPLOYMENT.md` for detailed deployment instructions.

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Features in Detail

### Dynamic Color Extraction

The app uses ColorThief to extract dominant colors from album artwork and creates beautiful gradient backgrounds that adapt to each song.

### Real-time Data Scraping

Custom Python scrapers (deployed on AWS Lambda) fetch real-time streaming statistics from various platforms, providing up-to-date analytics.

### AI-Powered Insights

Integration with Perplexity AI provides intelligent analysis of song lyrics, including themes, emotions, and literary devices.

### Responsive Design

Built with Tailwind CSS, the application is fully responsive and provides an optimal viewing experience across all devices.

## License

This project is private and not licensed for public use.

## Contributing

This is a private project. If you have access and would like to contribute:

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## Support

For issues or questions, please open an issue in the repository.

## Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api) for music data
- [Ticketmaster API](https://developer.ticketmaster.com/) for event information
- [Perplexity AI](https://www.perplexity.ai/) for lyrics analysis
- [Kworb](https://kworb.net/) for streaming statistics
- Design inspired by [Spotify](https://spotify.com)

---
