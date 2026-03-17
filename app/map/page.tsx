"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  MapMouseEvent,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps"

// variant config: label + color
const VARIANTS = [
  { id: 1, label: "Cicada", color: "#FF4444" },
  { id: 2, label: "Foguete", color: "#44AAFF" },
  { id: 3, label: "High Line", color: "#44DD44" },
  { id: 4, label: "Find your way", color: "#FFaa00" },
  { id: 5, label: "Sticker", color: "#CC44FF" },
] as const

type Pin = {
  id: string
  lat: number
  lng: number
  variant: 1 | 2 | 3 | 4 | 5
  note?: string
  createdAt: string
}

export default function MapPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState(false)
  const [pins, setPins] = useState<Pin[]>([])
  const [selectedVariant, setSelectedVariant] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [activePin, setActivePin] = useState<Pin | null>(null)
  const [noteInput, setNoteInput] = useState("")

  // check if already authed via cookie (no data, just auth check)
  useEffect(() => {
    fetch("/api/map/auth")
      .then((r) => { if (r.ok) setAuthed(true) })
      .catch(() => {})
  }, [])

  // load pins only after auth is confirmed
  useEffect(() => {
    if (!authed) return
    fetch("/api/map")
      .then((r) => r.ok ? r.json() : [])
      .then(setPins)
      .catch(() => {})
  }, [authed])

  // handle login
  const handleLogin = async () => {
    const res = await fetch("/api/map/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
    } else {
      setAuthError(true)
    }
  }

  // click on map to add pin
  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      if (!e.detail.latLng) return

      const res = await fetch("/api/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: e.detail.latLng.lat,
          lng: e.detail.latLng.lng,
          variant: selectedVariant,
        }),
      })

      const pin = await res.json()
      setPins((prev) => [...prev, pin])
    },
    [selectedVariant]
  )

  // delete pin
  const handleDelete = useCallback(async (id: string) => {
    await fetch("/api/map", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })

    setPins((prev) => prev.filter((p) => p.id !== id))
    setActivePin(null)
  }, [])

  // update pin variant
  const handleUpdateVariant = useCallback(async (id: string, variant: 1 | 2 | 3 | 4 | 5) => {
    const res = await fetch("/api/map", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, variant }),
    })
    const updated = await res.json()
    setPins((prev) => prev.map((p) => (p.id === id ? updated : p)))
    setActivePin(updated)
  }, [])

  // counts per variant
  const counts = pins.reduce(
    (acc, p) => {
      acc[p.variant] = (acc[p.variant] || 0) + 1
      return acc
    },
    {} as Record<number, number>
  )

  // password screen
  if (!authed) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm text-zinc-500 font-medium">IMPOSSIBLE MAP</span>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setAuthError(false) }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="password"
            className="px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm outline-none border border-zinc-700 w-72 text-center placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
            autoFocus
          />
          {authError && <span className="text-xs text-red-500">wrong password</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white">
      {/* toolbar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <span className="text-sm font-medium opacity-60">IMPOSSIBLE MAP</span>

        {/* variant selector */}
        <div className="flex gap-2 ml-4">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariant(v.id as 1 | 2 | 3 | 4 | 5)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all"
              style={{
                backgroundColor:
                  selectedVariant === v.id ? v.color + "30" : "transparent",
                border: `2px solid ${selectedVariant === v.id ? v.color : "transparent"}`,
                color: v.color,
              }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: v.color }}
              />
              {v.label}
              <span className="opacity-50 ml-1">{counts[v.id] || 0}</span>
            </button>
          ))}
        </div>

        {/* total */}
        <span className="ml-auto text-sm opacity-40">{pins.length} pins</span>
      </div>

      {/* map */}
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}>
        <MapInner
          pins={pins}
          selectedVariant={selectedVariant}
          activePin={activePin}
          noteInput={noteInput}
          onMapClick={handleMapClick}
          onPinClick={(pin) => { setActivePin(pin); setNoteInput(pin.note || "") }}
          onDelete={handleDelete}
          onCloseInfo={() => setActivePin(null)}
          onUpdateVariant={handleUpdateVariant}
        />
      </APIProvider>
    </div>
  )
}

// inner component to access useMap hook
function MapInner({
  pins, selectedVariant, activePin, noteInput,
  onMapClick, onPinClick, onDelete, onCloseInfo, onUpdateVariant,
}: {
  pins: Pin[]
  selectedVariant: 1 | 2 | 3 | 4 | 5
  activePin: Pin | null
  noteInput: string
  onMapClick: (e: MapMouseEvent) => void
  onPinClick: (pin: Pin) => void
  onDelete: (id: string) => void
  onCloseInfo: () => void
  onUpdateVariant: (id: string, variant: 1 | 2 | 3 | 4 | 5) => void
}) {
  const map = useMap()
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)

  // watch user's location + center on first fix
  const hasCentered = useRef(false)
  useEffect(() => {
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(loc)
        if (!hasCentered.current && map) {
          map.panTo(loc)
          map.setZoom(15)
          hasCentered.current = true
        }
      },
      () => {},
      { enableHighAccuracy: true }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [map])

  // center on user's current location
  const handleLocate = useCallback(() => {
    if (userPos) {
      map?.panTo(userPos)
      map?.setZoom(16)
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserPos(loc)
          map?.panTo(loc)
          map?.setZoom(16)
        },
        () => alert("Could not get location")
      )
    }
  }, [map, userPos])

  // places autocomplete
  const placesLib = useMapsLibrary("places")
  const [searchInput, setSearchInput] = useState("")
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number } | null>(null)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  useEffect(() => {
    if (!placesLib || !map) return
    autocompleteService.current = new placesLib.AutocompleteService()
    placesService.current = new placesLib.PlacesService(map)
  }, [placesLib, map])

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    if (!value || !autocompleteService.current) {
      setPredictions([])
      return
    }
    autocompleteService.current.getPlacePredictions(
      { input: value },
      (results) => setPredictions(results || [])
    )
  }, [])

  const handleSelectPlace = useCallback((placeId: string) => {
    if (!placesService.current) return
    placesService.current.getDetails(
      { placeId, fields: ["geometry"] },
      (place) => {
        if (!place?.geometry?.location) return
        const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
        map?.panTo(loc)
        map?.setZoom(16)
        setSearchMarker(loc)
      }
    )
    setSearchInput("")
    setPredictions([])
  }, [map])

  // clear search marker on map interaction
  useEffect(() => {
    if (!map || !searchMarker) return
    const listeners = [
      map.addListener("dragstart", () => setSearchMarker(null)),
      map.addListener("zoom_changed", () => setSearchMarker(null)),
    ]
    return () => listeners.forEach((l) => l.remove())
  }, [map, searchMarker])

  return (
    <div className="flex-1 relative">
      {/* search bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[420px]">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search location..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900/95 backdrop-blur-sm text-white text-sm outline-none border border-zinc-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] placeholder:text-zinc-500 focus:border-zinc-500 transition-colors"
          />
        </div>
        {predictions.length > 0 && (
          <div className="mt-2 bg-zinc-900/95 backdrop-blur-sm rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-zinc-700 overflow-hidden">
            {predictions.map((p) => (
              <button
                key={p.place_id}
                onClick={() => handleSelectPlace(p.place_id)}
                className="w-full text-left px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800 last:border-0 transition-colors"
              >
                {p.description}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* locate button */}
      <button
        onClick={handleLocate}
        className="absolute top-3 right-3 z-10 bg-white text-black w-10 h-10 rounded-lg shadow-lg flex items-center justify-center hover:bg-zinc-100 transition-colors cursor-pointer"
        title="My location"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
      </button>

      <Map
        className="w-full h-full"
        defaultCenter={{ lat: -23.55, lng: -46.63 }}
        defaultZoom={12}
        onClick={onMapClick}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        {/* search result indicator */}
        {searchMarker && (
          <Marker
            position={searchMarker}
            clickable={false}
          />
        )}

        {/* blue dot: user's current location */}
        {userPos && (
          <Marker
            key={`user-${userPos.lat}-${userPos.lng}`}
            position={userPos}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                  <circle cx="14" cy="14" r="12" fill="#4285F4" opacity="0.2"/>
                  <circle cx="14" cy="14" r="7" fill="#4285F4" stroke="white" stroke-width="2"/>
                </svg>`
              )}`,
              scaledSize: { width: 28, height: 28, equals: () => false } as google.maps.Size,
              anchor: { x: 14, y: 14, equals: () => false } as google.maps.Point,
            }}
            clickable={false}
          />
        )}

        {pins.map((pin) => {
          const variant = VARIANTS.find((v) => v.id === pin.variant)!

          // colored circle SVG as marker icon
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="${variant.color}" stroke="white" stroke-width="2"/></svg>`
          const icon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`

          return (
            <Marker
              key={pin.id}
              position={{ lat: pin.lat, lng: pin.lng }}
              icon={{ url: icon, scaledSize: { width: 24, height: 24, equals: () => false } as google.maps.Size }}
              onClick={() => onPinClick(pin)}
            />
          )
        })}

        {/* info window for selected pin */}
        {activePin && (
          <InfoWindow
            position={{ lat: activePin.lat, lng: activePin.lng }}
            onCloseClick={onCloseInfo}
          >
            <div className="text-black p-1 min-w-[160px]">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: VARIANTS.find(
                      (v) => v.id === activePin.variant
                    )!.color,
                  }}
                />
                <span className="font-medium">
                  {VARIANTS.find((v) => v.id === activePin.variant)!.label}
                </span>
              </div>

              {/* date + time */}
              <p className="text-xs opacity-60 mb-2">
                {new Date(activePin.createdAt).toLocaleDateString("en-US")}{" "}
                {new Date(activePin.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>

              {activePin.note && (
                <p className="text-sm mb-2">{activePin.note}</p>
              )}

              {/* variant switcher */}
              <div className="flex gap-1 mb-2">
                {VARIANTS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => onUpdateVariant(activePin.id, v.id as 1 | 2 | 3 | 4 | 5)}
                    className="w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
                    style={{
                      backgroundColor: v.color,
                      borderColor: activePin.variant === v.id ? "#000" : "transparent",
                    }}
                    title={v.label}
                  />
                ))}
              </div>

              <button
                onClick={() => onDelete(activePin.id)}
                className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
              >
                remove
              </button>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  )
}
