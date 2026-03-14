# 🗺️ Civic Lens - Community Issue Tracking Platform

A modern civic engagement platform that empowers citizens to report, track, and vote on community issues with interactive mapping, smart location selection, and time travel analytics.

## ✨ Key Features

- **🗺️ Interactive Map** - Dark-themed map with real-time issue visualization
- **📍 Smart Location Picker** - GPS detection, address search, and map-click selection
- **📱 Rich Media Support** - Upload up to 3 photos (5MB each) + 1 video (50MB)
- **🗳️ Community Voting** - Upvote/downvote issues with real-time feedback
- **🔍 Advanced Search** - Filter by 10+ categories with live results
- **⏰ Time Travel** - Visualize how issues evolved over time
- **📱 Mobile Responsive** - Touch-optimized interface for all devices
- **🔔 Smart Notifications** - Toast alerts for location and system feedback

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker (for Qdrant database)
- Mapbox API key

### Setup

```bash
# Clone and install
git clone <repository-url>
cd civic-lens
npm install

# Configure environment
cp .env.local.example .env.local
# Add your Mapbox API key to .env.local

# Start development
npm run dev
# Open http://localhost:3000
```

### Database Setup

```bash
# Start Qdrant database
npm run qdrant:compose

# Seed with sample data
npm run seed

# Stop database
npm run qdrant:stop
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: Qdrant Vector Database
- **Maps**: Mapbox GL JS with React Map GL
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 🎮 How to Use

### Report Issues

1. Click **+** button → Fill form → Select location on interactive map
2. Upload photos/videos → Choose category → Submit

### Explore Issues

1. **Browse map** - Click markers to view details and vote
2. **Search & filter** - Find issues by location, category, or keywords
3. **Time travel** - Watch issues emerge over time with playback controls

### Location Selection

- **Click anywhere** on the map for precise coordinates
- **Search addresses** with autocomplete
- **Use GPS location** with smart permission handling

## 📂 Project Structure

```
├── app/                    # Next.js app router
├── components/
│   ├── map/               # Map components
│   ├── timeline/          # Time travel controls
│   ├── ui/                # Reusable UI components
│   ├── LocationPicker.tsx # Interactive location selector
│   └── report-form.tsx    # Issue reporting form
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript definitions
```

## 🚀 Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://civic-lens-brown.vercel.app)

**Environment Variables:**

- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Your Mapbox API key
- `QDRANT_URL` - Qdrant database URL (optional for Qdrant Cloud)

---

**Built with ❤️ for stronger communities**
