"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Droplets, Power, Battery, Sprout, Settings, Sun, AlertTriangle, CheckCircle, Circle } from "lucide-react"

// Types
interface ZoneConfig {
  plantType: string
  soilType: string
}

interface ZoneData {
  id: number
  name: string
  moisture: number
  valveOpen: boolean
  plantType: string
  soilType: string
}

interface SystemStatus {
  pumpOn: boolean
  batteryLevel: number
  solarPower: boolean
  lastUpdate: string
}

const PLANT_TYPES = [
  { value: "tomates", label: "Tomates" },
  { value: "laitue", label: "Laitue" },
  { value: "basilic", label: "Basilic" },
  { value: "courgettes", label: "Courgettes" },
  { value: "radis", label: "Radis" },
  { value: "carottes", label: "Carottes" },
  { value: "persil", label: "Persil" },
  { value: "menthe", label: "Menthe" },
]

const SOIL_TYPES = [
  { value: "argileux", label: "Sol argileux" },
  { value: "sableux", label: "Sol sableux" },
  { value: "limoneux", label: "Sol limoneux" },
  { value: "humifere", label: "Sol humifère" },
  { value: "calcaire", label: "Sol calcaire" },
]

export default function IrrigationSystem() {
  // États principaux
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "config" | "dashboard">("welcome")
  const [plantingStatus, setPlantingStatus] = useState<"new" | "existing" | null>(null)

  // Configuration des zones
  const [zoneConfigs, setZoneConfigs] = useState<Record<number, ZoneConfig>>({
    1: { plantType: "", soilType: "" },
    2: { plantType: "", soilType: "" },
    3: { plantType: "", soilType: "" },
    4: { plantType: "", soilType: "" },
  })

  const [globalSoilType, setGlobalSoilType] = useState("")
  const [useGlobalSoil, setUseGlobalSoil] = useState(true)

  // Données du système
  const [zones, setZones] = useState<ZoneData[]>([
    { id: 1, name: "Zone 1", moisture: 45, valveOpen: false, plantType: "Tomates", soilType: "Sol argileux" },
    { id: 2, name: "Zone 2", moisture: 62, valveOpen: true, plantType: "Laitue", soilType: "Sol sableux" },
    { id: 3, name: "Zone 3", moisture: 38, valveOpen: false, plantType: "Basilic", soilType: "Sol limoneux" },
    { id: 4, name: "Zone 4", moisture: 71, valveOpen: false, plantType: "Courgettes", soilType: "Sol humifère" },
  ])

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    pumpOn: false,
    batteryLevel: 78,
    solarPower: true,
    lastUpdate: new Date().toLocaleTimeString("fr-FR"),
  })

  const [logs, setLogs] = useState<string[]>([
    "Système démarré à 08:30",
    "Zone 2 - Irrigation activée",
    "Niveau batterie: 78%",
    "Capteur Zone 3 - Humidité faible détectée",
  ])

  // Simulation des données en temps réel
  useEffect(() => {
    if (currentScreen !== "dashboard") return

    const interval = setInterval(() => {
      // Simulation des données de capteurs
      setZones((prev) =>
        prev.map((zone) => ({
          ...zone,
          moisture: Math.max(20, Math.min(100, zone.moisture + (Math.random() - 0.5) * 5)),
        })),
      )

      // Mise à jour du statut système
      setSystemStatus((prev) => ({
        ...prev,
        batteryLevel: Math.max(20, Math.min(100, prev.batteryLevel + (Math.random() - 0.5) * 2)),
        lastUpdate: new Date().toLocaleTimeString("fr-FR"),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [currentScreen])

  // Fonctions de contrôle
  const toggleValve = async (zoneId: number) => {
    try {
      // Simulation appel API ESP32
      // await fetch(`/api/zone${zoneId}/valve`, { method: 'POST' })

      setZones((prev) => prev.map((zone) => (zone.id === zoneId ? { ...zone, valveOpen: !zone.valveOpen } : zone)))

      const zone = zones.find((z) => z.id === zoneId)
      const action = zone?.valveOpen ? "fermée" : "ouverte"
      setLogs((prev) => [`Zone ${zoneId} - Vanne ${action}`, ...prev.slice(0, 9)])
    } catch (error) {
      console.error("Erreur contrôle vanne:", error)
    }
  }

  const togglePump = async () => {
    try {
      // Simulation appel API ESP32
      // await fetch('/api/pump/toggle', { method: 'POST' })

      setSystemStatus((prev) => ({ ...prev, pumpOn: !prev.pumpOn }))
      const action = systemStatus.pumpOn ? "arrêtée" : "démarrée"
      setLogs((prev) => [`Pompe ${action}`, ...prev.slice(0, 9)])
    } catch (error) {
      console.error("Erreur contrôle pompe:", error)
    }
  }

  const handleConfigSubmit = () => {
    // Appliquer la configuration aux zones
    const updatedZones = zones.map((zone) => {
      const config = zoneConfigs[zone.id]
      const plantLabel = PLANT_TYPES.find((p) => p.value === config.plantType)?.label || zone.plantType
      const soilLabel = useGlobalSoil
        ? SOIL_TYPES.find((s) => s.value === globalSoilType)?.label || zone.soilType
        : SOIL_TYPES.find((s) => s.value === config.soilType)?.label || zone.soilType

      return {
        ...zone,
        plantType: plantLabel,
        soilType: soilLabel,
      }
    })

    setZones(updatedZones)
    setCurrentScreen("dashboard")
  }

  const getMoistureColor = (moisture: number) => {
    if (moisture < 30) return "text-red-500"
    if (moisture < 60) return "text-yellow-500"
    return "text-green-500"
  }

  const getMoistureStatus = (moisture: number) => {
    if (moisture < 30) return "Sec"
    if (moisture < 60) return "Modéré"
    return "Humide"
  }

  // Écran de bienvenue
  if (currentScreen === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Système d'Irrigation Autonome</CardTitle>
            <p className="text-gray-600">Bienvenue dans votre jardin connecté</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Avez-vous déjà planté ou venez-vous de planter ?</h3>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setPlantingStatus("new")
                  setCurrentScreen("config")
                }}
                className="w-full h-12 text-left justify-start"
                variant="outline"
              >
                <Sprout className="w-5 h-5 mr-3 text-green-600" />
                Je viens de planter
              </Button>
              <Button
                onClick={() => {
                  setPlantingStatus("existing")
                  setCurrentScreen("dashboard")
                }}
                className="w-full h-12 text-left justify-start"
                variant="outline"
              >
                <CheckCircle className="w-5 h-5 mr-3 text-blue-600" />
                Mes plantes sont déjà en place
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Écran de configuration
  if (currentScreen === "config") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Configuration de vos zones de plantation
              </CardTitle>
              <p className="text-gray-600">Configurez le type de plantes et de sol pour chaque zone</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Option sol global */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="globalSoil"
                    checked={useGlobalSoil}
                    onChange={(e) => setUseGlobalSoil(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="globalSoil" className="text-sm font-medium">
                    Utiliser le même type de sol pour toutes les zones
                  </label>
                </div>

                {useGlobalSoil && (
                  <Select value={globalSoilType} onValueChange={setGlobalSoilType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type de sol" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOIL_TYPES.map((soil) => (
                        <SelectItem key={soil.value} value={soil.value}>
                          {soil.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Separator />

              {/* Configuration par zone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((zoneId) => (
                  <Card key={zoneId} className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Zone {zoneId}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Type de plante</label>
                        <Select
                          value={zoneConfigs[zoneId].plantType}
                          onValueChange={(value) =>
                            setZoneConfigs((prev) => ({
                              ...prev,
                              [zoneId]: { ...prev[zoneId], plantType: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une plante" />
                          </SelectTrigger>
                          <SelectContent>
                            {PLANT_TYPES.map((plant) => (
                              <SelectItem key={plant.value} value={plant.value}>
                                {plant.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {!useGlobalSoil && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Type de sol</label>
                          <Select
                            value={zoneConfigs[zoneId].soilType}
                            onValueChange={(value) =>
                              setZoneConfigs((prev) => ({
                                ...prev,
                                [zoneId]: { ...prev[zoneId], soilType: value },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir le sol" />
                            </SelectTrigger>
                            <SelectContent>
                              {SOIL_TYPES.map((soil) => (
                                <SelectItem key={soil.value} value={soil.value}>
                                  {soil.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setCurrentScreen("welcome")} className="flex-1">
                  Retour
                </Button>
                <Button
                  onClick={handleConfigSubmit}
                  className="flex-1"
                  disabled={
                    Object.values(zoneConfigs).some((config) => !config.plantType) || (useGlobalSoil && !globalSoilType)
                  }
                >
                  Valider la configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Système d'Irrigation</h1>
            <p className="text-gray-600">Dernière mise à jour: {systemStatus.lastUpdate}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={systemStatus.solarPower ? "default" : "secondary"} className="flex items-center gap-1">
              <Sun className="w-4 h-4" />
              {systemStatus.solarPower ? "Solaire actif" : "Solaire inactif"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setCurrentScreen("welcome")}>
              <Settings className="w-4 h-4 mr-2" />
              Reconfigurer
            </Button>
          </div>
        </div>

        {/* Statut système */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${systemStatus.pumpOn ? "bg-blue-100" : "bg-gray-100"}`}>
                  <Power className={`w-6 h-6 ${systemStatus.pumpOn ? "text-blue-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pompe</p>
                  <p className="font-semibold">{systemStatus.pumpOn ? "EN MARCHE" : "ARRÊTÉE"}</p>
                </div>
              </div>
              <Button onClick={togglePump} variant={systemStatus.pumpOn ? "destructive" : "default"} size="sm">
                {systemStatus.pumpOn ? "Arrêter" : "Démarrer"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Battery className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Batterie</p>
                  <div className="flex items-center gap-2">
                    <Progress value={systemStatus.batteryLevel} className="flex-1" />
                    <span className="text-sm font-semibold">{systemStatus.batteryLevel}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Zones actives</p>
                  <p className="font-semibold">
                    {zones.filter((z) => z.valveOpen).length} / {zones.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zones d'irrigation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {zones.map((zone) => (
            <Card key={zone.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{zone.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Circle
                      className={`w-3 h-3 ${zone.valveOpen ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"}`}
                    />
                    <span className="text-xs text-gray-500">{zone.valveOpen ? "Ouverte" : "Fermée"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Sprout className="w-4 h-4" />
                    {zone.plantType}
                  </p>
                  <p className="text-xs text-gray-500">{zone.soilType}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Humidité du sol</span>
                    <span className={`text-sm font-semibold ${getMoistureColor(zone.moisture)}`}>{zone.moisture}%</span>
                  </div>
                  <Progress value={zone.moisture} className="h-2" />
                  <p className={`text-xs mt-1 ${getMoistureColor(zone.moisture)}`}>
                    {getMoistureStatus(zone.moisture)}
                  </p>
                </div>

                <Button
                  onClick={() => toggleValve(zone.id)}
                  variant={zone.valveOpen ? "destructive" : "default"}
                  size="sm"
                  className="w-full"
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  {zone.valveOpen ? "Fermer vanne" : "Ouvrir vanne"}
                </Button>
              </CardContent>

              {zone.moisture < 30 && (
                <div className="absolute top-2 right-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Journal d'activité */}
        <Card>
          <CardHeader>
            <CardTitle>Journal d'activité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                  <span className="text-gray-600">{new Date().toLocaleTimeString("fr-FR")}</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
