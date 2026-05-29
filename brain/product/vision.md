# Product Vision

## The Problem

Winter is long in German/Nordic cities, and sun deprivation is real. Even during summertime, catching the sun is an opportunity that slips fast. People want to know spontaneously which café has a sunny terrace — right now, before the sun moves.

The inverse also applies: in southern countries during hot summers, users look for shade.

## The Goal

**Help users find a sunny (or shaded) spot to enjoy a drink.**

## Target Users

- Age 16+, core focus 18–40
- Spend money in cafés regularly
- Live in urban areas in Northern Europe (Germany, Scandinavia, NL) where tall buildings block the sun

## Core User Jobs

1. Find a sunny terrace near me **right now**
2. Find where to catch the sun in the **next 30 minutes**
3. **Plan ahead** — pick a time and find what's sunny then

## How It Works

Arkie combines:

- Geographic location data (cafés, bars, restaurants via Google Places)
- Real-time sun position (azimuth + altitude)
- 3D building data (OSM buildings via Cesium) to model shadow casting
- Terrain data (Cesium Ion) for elevation

The Cesium globe shows OSM buildings + terrain with real-time sun lighting. Pins are coloured to indicate sun vs. shade vs. unknown.

## Live App

- Production: https://arkie.app/beta
- Waitlist: https://arkie.app/waitlist
- Founders: Lena Eisenbeis (contact@arkie.app) + Dani Araujo
