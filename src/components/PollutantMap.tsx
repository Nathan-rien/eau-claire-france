
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, MapPin, Activity, ShieldAlert, Building2 } from 'lucide-react';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';

interface CityPollutantData {
  name: string;
  coords: [number, number];
  pollutants: { name: string; value: string; limit: string; unit: string }[];
  riskLevel: 'low' | 'medium' | 'high';
  population: number;
  conformityRate: number;
  lastAnalysis: string;
  waterSource: string;
  trend: 'up' | 'down' | 'stable';
}

interface RegionData {
  id: string;
  name: string;
  mainPollutants: string[];
  riskLevel: 'low' | 'medium' | 'high';
  cities: number;
  conformityRate: number;
  population: number;
  supplyZones: number;
  topPollutantValues: Record<string, string>;
}

const pollutantCities: CityPollutantData[] = [
  { name: 'Paris', coords: [2.3522, 48.8566], pollutants: [{ name: 'Nitrates', value: '28', limit: '50', unit: 'mg/L' }, { name: 'Chlore résiduel', value: '0.15', limit: '0.3', unit: 'mg/L' }, { name: 'THM', value: '18', limit: '100', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.08', limit: '0.1', unit: 'µg/L' }, { name: 'Plomb', value: '5.1', limit: '10', unit: 'µg/L' }], riskLevel: 'medium', population: 2161000, conformityRate: 98.2, lastAnalysis: 'Février 2024', waterSource: 'Eau de surface (Seine, Marne)', trend: 'stable' },
  { name: 'Lyon', coords: [4.8357, 45.764], pollutants: [{ name: 'Nitrates', value: '12', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.04', limit: '0.1', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.03', limit: '0.1', unit: 'µg/L' }, { name: 'Sélénium', value: '3.2', limit: '10', unit: 'µg/L' }], riskLevel: 'low', population: 516092, conformityRate: 99.4, lastAnalysis: 'Mars 2024', waterSource: 'Nappe alluviale du Rhône', trend: 'down' },
  { name: 'Marseille', coords: [5.3698, 43.2965], pollutants: [{ name: 'Nitrates', value: '35', limit: '50', unit: 'mg/L' }, { name: 'Arsenic', value: '8.5', limit: '10', unit: 'µg/L' }, { name: 'Fluorures', value: '1.2', limit: '1.5', unit: 'mg/L' }, { name: 'PFAS totaux', value: '0.09', limit: '0.1', unit: 'µg/L' }, { name: 'Microplastiques', value: '12', limit: '—', unit: 'part./L' }], riskLevel: 'high', population: 870018, conformityRate: 96.1, lastAnalysis: 'Janvier 2024', waterSource: 'Canal de Marseille (Durance)', trend: 'up' },
  { name: 'Toulouse', coords: [1.4442, 43.6047], pollutants: [{ name: 'Pesticides', value: '0.09', limit: '0.1', unit: 'µg/L' }, { name: 'Nitrates', value: '31', limit: '50', unit: 'mg/L' }, { name: 'Plomb', value: '8.2', limit: '10', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.07', limit: '0.1', unit: 'µg/L' }, { name: 'Chrome', value: '28', limit: '50', unit: 'µg/L' }], riskLevel: 'high', population: 493465, conformityRate: 95.8, lastAnalysis: 'Mars 2024', waterSource: 'Eau de surface (Garonne)', trend: 'up' },
  { name: 'Nice', coords: [7.2619, 43.7102], pollutants: [{ name: 'Nitrates', value: '14', limit: '50', unit: 'mg/L' }, { name: 'Chlore résiduel', value: '0.1', limit: '0.3', unit: 'mg/L' }, { name: 'Sélénium', value: '2.1', limit: '10', unit: 'µg/L' }], riskLevel: 'low', population: 342669, conformityRate: 99.1, lastAnalysis: 'Février 2024', waterSource: 'Nappe souterraine (Vésubie)', trend: 'stable' },
  { name: 'Nantes', coords: [-1.5534, 47.2184], pollutants: [{ name: 'Pesticides', value: '0.07', limit: '0.1', unit: 'µg/L' }, { name: 'Nitrates', value: '25', limit: '50', unit: 'mg/L' }, { name: 'PFAS totaux', value: '0.05', limit: '0.1', unit: 'µg/L' }, { name: 'Microplastiques', value: '8', limit: '—', unit: 'part./L' }], riskLevel: 'medium', population: 320732, conformityRate: 97.8, lastAnalysis: 'Mars 2024', waterSource: 'Eau de surface (Loire)', trend: 'stable' },
  { name: 'Strasbourg', coords: [7.7521, 48.5734], pollutants: [{ name: 'Nitrates', value: '15', limit: '50', unit: 'mg/L' }, { name: 'PFAS totaux', value: '0.04', limit: '0.1', unit: 'µg/L' }, { name: 'Cuivre', value: '0.8', limit: '2', unit: 'mg/L' }], riskLevel: 'low', population: 287228, conformityRate: 99.5, lastAnalysis: 'Mars 2024', waterSource: 'Nappe phréatique rhénane', trend: 'down' },
  { name: 'Montpellier', coords: [3.8767, 43.6108], pollutants: [{ name: 'Pesticides', value: '0.11', limit: '0.1', unit: 'µg/L' }, { name: 'Arsenic', value: '7.8', limit: '10', unit: 'µg/L' }, { name: 'Nitrates', value: '29', limit: '50', unit: 'mg/L' }, { name: 'Fluorures', value: '1.1', limit: '1.5', unit: 'mg/L' }, { name: 'PFAS totaux', value: '0.06', limit: '0.1', unit: 'µg/L' }, { name: 'Microplastiques', value: '15', limit: '—', unit: 'part./L' }], riskLevel: 'high', population: 295542, conformityRate: 95.3, lastAnalysis: 'Janvier 2024', waterSource: 'Source du Lez', trend: 'up' },
  { name: 'Bordeaux', coords: [-0.5792, 44.8378], pollutants: [{ name: 'Pesticides', value: '0.06', limit: '0.1', unit: 'µg/L' }, { name: 'Nitrates', value: '22', limit: '50', unit: 'mg/L' }, { name: 'Sélénium', value: '4.5', limit: '10', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.04', limit: '0.1', unit: 'µg/L' }], riskLevel: 'medium', population: 260958, conformityRate: 98.0, lastAnalysis: 'Février 2024', waterSource: 'Nappe de l\'Éocène', trend: 'down' },
  { name: 'Lille', coords: [3.0573, 50.6292], pollutants: [{ name: 'Nitrates', value: '32', limit: '50', unit: 'mg/L' }, { name: 'Chlore résiduel', value: '0.18', limit: '0.3', unit: 'mg/L' }, { name: 'THM', value: '22', limit: '100', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.06', limit: '0.1', unit: 'µg/L' }, { name: 'Chrome', value: '15', limit: '50', unit: 'µg/L' }], riskLevel: 'medium', population: 236234, conformityRate: 97.5, lastAnalysis: 'Mars 2024', waterSource: 'Nappe de la Craie', trend: 'stable' },
  { name: 'Rennes', coords: [-1.6778, 48.1173], pollutants: [{ name: 'Nitrates', value: '20', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.05', limit: '0.1', unit: 'µg/L' }, { name: 'Microplastiques', value: '6', limit: '—', unit: 'part./L' }], riskLevel: 'low', population: 222485, conformityRate: 98.9, lastAnalysis: 'Mars 2024', waterSource: 'Barrage de la Chèze', trend: 'down' },
  { name: 'Reims', coords: [4.0317, 49.2583], pollutants: [{ name: 'Nitrates', value: '27', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.06', limit: '0.1', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.05', limit: '0.1', unit: 'µg/L' }], riskLevel: 'medium', population: 182592, conformityRate: 97.9, lastAnalysis: 'Février 2024', waterSource: 'Nappe de la Craie', trend: 'stable' },
  { name: 'Toulon', coords: [5.928, 43.1242], pollutants: [{ name: 'Nitrates', value: '18', limit: '50', unit: 'mg/L' }, { name: 'Chlore résiduel', value: '0.12', limit: '0.3', unit: 'mg/L' }, { name: 'Cuivre', value: '0.5', limit: '2', unit: 'mg/L' }], riskLevel: 'low', population: 178745, conformityRate: 98.7, lastAnalysis: 'Janvier 2024', waterSource: 'Canal de Provence', trend: 'stable' },
  { name: 'Grenoble', coords: [5.7243, 45.1885], pollutants: [{ name: 'Nitrates', value: '8', limit: '50', unit: 'mg/L' }, { name: 'PFAS totaux', value: '0.02', limit: '0.1', unit: 'µg/L' }, { name: 'Sélénium', value: '1.5', limit: '10', unit: 'µg/L' }], riskLevel: 'low', population: 158198, conformityRate: 99.7, lastAnalysis: 'Mars 2024', waterSource: 'Nappe alluviale du Drac', trend: 'down' },
  { name: 'Dijon', coords: [5.0415, 47.322], pollutants: [{ name: 'Nitrates', value: '24', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.05', limit: '0.1', unit: 'µg/L' }, { name: 'Chrome', value: '12', limit: '50', unit: 'µg/L' }], riskLevel: 'low', population: 159346, conformityRate: 99.0, lastAnalysis: 'Février 2024', waterSource: 'Sources de Morcueil', trend: 'stable' },
  { name: 'Angers', coords: [-0.5579, 47.4784], pollutants: [{ name: 'Nitrates', value: '26', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.07', limit: '0.1', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.04', limit: '0.1', unit: 'µg/L' }, { name: 'Microplastiques', value: '7', limit: '—', unit: 'part./L' }], riskLevel: 'medium', population: 155876, conformityRate: 97.6, lastAnalysis: 'Mars 2024', waterSource: 'Eau de surface (Maine)', trend: 'stable' },
  { name: 'Clermont-Ferrand', coords: [3.0863, 45.7772], pollutants: [{ name: 'Nitrates', value: '10', limit: '50', unit: 'mg/L' }, { name: 'Sélénium', value: '1.8', limit: '10', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.01', limit: '0.1', unit: 'µg/L' }], riskLevel: 'low', population: 147865, conformityRate: 99.6, lastAnalysis: 'Mars 2024', waterSource: 'Sources volcaniques (Volvic)', trend: 'down' },
  { name: 'Rouen', coords: [1.0993, 49.4431], pollutants: [{ name: 'Nitrates', value: '30', limit: '50', unit: 'mg/L' }, { name: 'THM', value: '25', limit: '100', unit: 'µg/L' }, { name: 'Pesticides', value: '0.08', limit: '0.1', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.07', limit: '0.1', unit: 'µg/L' }, { name: 'Chrome', value: '18', limit: '50', unit: 'µg/L' }], riskLevel: 'medium', population: 113368, conformityRate: 97.3, lastAnalysis: 'Février 2024', waterSource: 'Eau de surface (Seine)', trend: 'up' },
  { name: 'Brest', coords: [-4.486, 48.3905], pollutants: [{ name: 'Nitrates', value: '22', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.04', limit: '0.1', unit: 'µg/L' }, { name: 'Cuivre', value: '0.6', limit: '2', unit: 'mg/L' }], riskLevel: 'low', population: 139926, conformityRate: 98.8, lastAnalysis: 'Mars 2024', waterSource: 'Barrage du Drennec', trend: 'stable' },
  { name: 'Perpignan', coords: [2.8956, 42.6886], pollutants: [{ name: 'Nitrates', value: '38', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.12', limit: '0.1', unit: 'µg/L' }, { name: 'Arsenic', value: '6.2', limit: '10', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.08', limit: '0.1', unit: 'µg/L' }, { name: 'Microplastiques', value: '18', limit: '—', unit: 'part./L' }], riskLevel: 'high', population: 121875, conformityRate: 94.9, lastAnalysis: 'Janvier 2024', waterSource: 'Nappe du Roussillon', trend: 'up' },
  { name: 'Limoges', coords: [1.2578, 45.8336], pollutants: [{ name: 'Nitrates', value: '11', limit: '50', unit: 'mg/L' }, { name: 'Sélénium', value: '2.4', limit: '10', unit: 'µg/L' }, { name: 'Cuivre', value: '0.3', limit: '2', unit: 'mg/L' }], riskLevel: 'low', population: 132175, conformityRate: 99.3, lastAnalysis: 'Mars 2024', waterSource: 'Barrage de Saint-Marc', trend: 'down' },
  { name: 'Amiens', coords: [2.2958, 49.8941], pollutants: [{ name: 'Nitrates', value: '34', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.08', limit: '0.1', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.06', limit: '0.1', unit: 'µg/L' }, { name: 'Chrome', value: '20', limit: '50', unit: 'µg/L' }], riskLevel: 'medium', population: 135501, conformityRate: 97.2, lastAnalysis: 'Février 2024', waterSource: 'Nappe de la Craie', trend: 'stable' },
  { name: 'Metz', coords: [6.1757, 49.1193], pollutants: [{ name: 'Nitrates', value: '16', limit: '50', unit: 'mg/L' }, { name: 'Chlore résiduel', value: '0.11', limit: '0.3', unit: 'mg/L' }, { name: 'PFAS totaux', value: '0.03', limit: '0.1', unit: 'µg/L' }], riskLevel: 'low', population: 120205, conformityRate: 99.2, lastAnalysis: 'Mars 2024', waterSource: 'Eau de surface (Moselle)', trend: 'stable' },
  { name: 'Orléans', coords: [1.9039, 47.9029], pollutants: [{ name: 'Nitrates', value: '23', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.06', limit: '0.1', unit: 'µg/L' }, { name: 'Sélénium', value: '3.8', limit: '10', unit: 'µg/L' }], riskLevel: 'medium', population: 116685, conformityRate: 98.1, lastAnalysis: 'Février 2024', waterSource: 'Nappe de Beauce', trend: 'stable' },
  { name: 'Ajaccio', coords: [8.7369, 41.9192], pollutants: [{ name: 'Nitrates', value: '9', limit: '50', unit: 'mg/L' }, { name: 'Cuivre', value: '0.4', limit: '2', unit: 'mg/L' }], riskLevel: 'low', population: 72399, conformityRate: 98.5, lastAnalysis: 'Janvier 2024', waterSource: 'Sources de montagne (Prunelli)', trend: 'stable' },
  // 5 nouvelles villes
  { name: 'Caen', coords: [-0.3708, 49.1829], pollutants: [{ name: 'Nitrates', value: '29', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.07', limit: '0.1', unit: 'µg/L' }, { name: 'THM', value: '20', limit: '100', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.05', limit: '0.1', unit: 'µg/L' }], riskLevel: 'medium', population: 108365, conformityRate: 97.6, lastAnalysis: 'Mars 2024', waterSource: 'Nappe de l\'Orne', trend: 'stable' },
  { name: 'Poitiers', coords: [0.3404, 46.5802], pollutants: [{ name: 'Nitrates', value: '27', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.06', limit: '0.1', unit: 'µg/L' }, { name: 'Sélénium', value: '3.0', limit: '10', unit: 'µg/L' }], riskLevel: 'medium', population: 89212, conformityRate: 97.9, lastAnalysis: 'Février 2024', waterSource: 'Nappe du Dogger', trend: 'down' },
  { name: 'Besançon', coords: [6.0243, 47.2378], pollutants: [{ name: 'Nitrates', value: '13', limit: '50', unit: 'mg/L' }, { name: 'PFAS totaux', value: '0.03', limit: '0.1', unit: 'µg/L' }, { name: 'Chrome', value: '8', limit: '50', unit: 'µg/L' }], riskLevel: 'low', population: 119163, conformityRate: 99.1, lastAnalysis: 'Mars 2024', waterSource: 'Sources karstiques du Doubs', trend: 'down' },
  { name: 'Nancy', coords: [6.1844, 48.6921], pollutants: [{ name: 'Nitrates', value: '19', limit: '50', unit: 'mg/L' }, { name: 'Chlore résiduel', value: '0.13', limit: '0.3', unit: 'mg/L' }, { name: 'PFAS totaux', value: '0.04', limit: '0.1', unit: 'µg/L' }, { name: 'Cuivre', value: '0.7', limit: '2', unit: 'mg/L' }], riskLevel: 'low', population: 104072, conformityRate: 99.0, lastAnalysis: 'Mars 2024', waterSource: 'Nappe des Grès vosgiens', trend: 'stable' },
  { name: 'Saint-Étienne', coords: [4.3872, 45.4397], pollutants: [{ name: 'Nitrates', value: '17', limit: '50', unit: 'mg/L' }, { name: 'Pesticides', value: '0.05', limit: '0.1', unit: 'µg/L' }, { name: 'PFAS totaux', value: '0.03', limit: '0.1', unit: 'µg/L' }, { name: 'Microplastiques', value: '5', limit: '—', unit: 'part./L' }], riskLevel: 'low', population: 174082, conformityRate: 99.2, lastAnalysis: 'Mars 2024', waterSource: 'Barrage de Lavalette', trend: 'down' },
];

const pollutantRegions: RegionData[] = [
  { id: 'ile-de-france', name: 'Île-de-France', mainPollutants: ['Nitrates', 'THM', 'Chlore résiduel', 'PFAS'], riskLevel: 'medium', cities: 1276, conformityRate: 98.2, population: 12270000, supplyZones: 320, topPollutantValues: { Nitrates: '28 mg/L', THM: '18 µg/L', 'Chlore résiduel': '0.15 mg/L', PFAS: '0.08 µg/L' } },
  { id: 'auvergne-rhone-alpes', name: 'Auvergne-Rhône-Alpes', mainPollutants: ['Nitrates', 'Pesticides', 'PFAS'], riskLevel: 'low', cities: 4032, conformityRate: 99.3, population: 8090000, supplyZones: 1850, topPollutantValues: { Nitrates: '12 mg/L', Pesticides: '0.04 µg/L', PFAS: '0.03 µg/L' } },
  { id: 'nouvelle-aquitaine', name: 'Nouvelle-Aquitaine', mainPollutants: ['Pesticides', 'Nitrates', 'Sélénium'], riskLevel: 'medium', cities: 4356, conformityRate: 97.8, population: 6040000, supplyZones: 1620, topPollutantValues: { Pesticides: '0.07 µg/L', Nitrates: '22 mg/L', Sélénium: '4.5 µg/L' } },
  { id: 'occitanie', name: 'Occitanie', mainPollutants: ['Pesticides', 'Arsenic', 'Nitrates', 'PFAS', 'Microplastiques'], riskLevel: 'high', cities: 4448, conformityRate: 95.6, population: 5930000, supplyZones: 1480, topPollutantValues: { Pesticides: '0.11 µg/L', Arsenic: '7.8 µg/L', Nitrates: '31 mg/L', PFAS: '0.07 µg/L' } },
  { id: 'hauts-de-france', name: 'Hauts-de-France', mainPollutants: ['Nitrates', 'Chlore résiduel', 'Pesticides', 'PFAS'], riskLevel: 'medium', cities: 3789, conformityRate: 97.4, population: 6010000, supplyZones: 920, topPollutantValues: { Nitrates: '33 mg/L', 'Chlore résiduel': '0.18 mg/L', Pesticides: '0.08 µg/L', PFAS: '0.06 µg/L' } },
  { id: 'grand-est', name: 'Grand Est', mainPollutants: ['Nitrates', 'Chlore résiduel', 'PFAS'], riskLevel: 'low', cities: 5133, conformityRate: 99.1, population: 5560000, supplyZones: 1340, topPollutantValues: { Nitrates: '16 mg/L', 'Chlore résiduel': '0.11 mg/L', PFAS: '0.04 µg/L' } },
  { id: 'provence-alpes-cote-azur', name: 'Provence-Alpes-Côte d\'Azur', mainPollutants: ['Nitrates', 'Arsenic', 'Fluorures', 'PFAS'], riskLevel: 'medium', cities: 946, conformityRate: 97.2, population: 5080000, supplyZones: 680, topPollutantValues: { Nitrates: '25 mg/L', Arsenic: '6.5 µg/L', Fluorures: '1.1 mg/L', PFAS: '0.07 µg/L' } },
  { id: 'pays-de-la-loire', name: 'Pays de la Loire', mainPollutants: ['Nitrates', 'Pesticides', 'Microplastiques'], riskLevel: 'medium', cities: 1775, conformityRate: 97.6, population: 3830000, supplyZones: 720, topPollutantValues: { Nitrates: '25 mg/L', Pesticides: '0.06 µg/L', Microplastiques: '7 part./L' } },
  { id: 'bretagne', name: 'Bretagne', mainPollutants: ['Nitrates', 'Pesticides', 'Microplastiques'], riskLevel: 'medium', cities: 1208, conformityRate: 97.5, population: 3370000, supplyZones: 580, topPollutantValues: { Nitrates: '27 mg/L', Pesticides: '0.05 µg/L', Microplastiques: '6 part./L' } },
  { id: 'normandie', name: 'Normandie', mainPollutants: ['Nitrates', 'THM', 'Pesticides', 'PFAS'], riskLevel: 'medium', cities: 2651, conformityRate: 97.3, population: 3320000, supplyZones: 780, topPollutantValues: { Nitrates: '30 mg/L', THM: '25 µg/L', Pesticides: '0.07 µg/L', PFAS: '0.06 µg/L' } },
  { id: 'bourgogne-franche-comte', name: 'Bourgogne-Franche-Comté', mainPollutants: ['Nitrates', 'Pesticides', 'Chrome'], riskLevel: 'low', cities: 3702, conformityRate: 98.8, population: 2800000, supplyZones: 920, topPollutantValues: { Nitrates: '20 mg/L', Pesticides: '0.04 µg/L', Chrome: '10 µg/L' } },
  { id: 'centre-val-de-loire', name: 'Centre-Val de Loire', mainPollutants: ['Nitrates', 'Pesticides', 'Sélénium'], riskLevel: 'medium', cities: 1756, conformityRate: 97.7, population: 2570000, supplyZones: 640, topPollutantValues: { Nitrates: '26 mg/L', Pesticides: '0.06 µg/L', Sélénium: '3.8 µg/L' } },
  { id: 'corse', name: 'Corse', mainPollutants: ['Nitrates'], riskLevel: 'low', cities: 360, conformityRate: 98.5, population: 344000, supplyZones: 210, topPollutantValues: { Nitrates: '9 mg/L' } },
];

// Compute stats
const totalCities = pollutantCities.length;
const avgConformity = (pollutantCities.reduce((s, c) => s + c.conformityRate, 0) / totalCities).toFixed(1);
const totalExceedances = pollutantCities.reduce((s, c) => s + c.pollutants.filter(p => p.limit !== '—' && parseFloat(p.value) >= parseFloat(p.limit)).length, 0);
const highRiskRegions = pollutantRegions.filter(r => r.riskLevel === 'high').length;

const PollutantMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(2.3488);
  const [lat, setLat] = useState(46.6034);
  const [zoom, setZoom] = useState(4);

  useEffect(() => {
    if (!mapContainer.current) return;

    MapboxSecurityService.configureMapbox(mapboxgl);

    map.current = new mapboxgl.Map(
      MapboxSecurityService.createSecureMapOptions(mapContainer.current)
    );

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const getRiskColor = (riskLevel: string) => {
      switch (riskLevel) {
        case 'low': return '#10b981';
        case 'medium': return '#f59e0b';
        case 'high': return '#ef4444';
        default: return '#6b7280';
      }
    };

    const getRiskLabel = (r: string) =>
      r === 'low' ? 'Faible' : r === 'medium' ? 'Modéré' : 'Élevé';

    const getTrendHtml = (trend: string) => {
      if (trend === 'up') return '<span style="color:#ef4444;font-weight:700" title="Dégradation">↗ En hausse</span>';
      if (trend === 'down') return '<span style="color:#10b981;font-weight:700" title="Amélioration">↘ En baisse</span>';
      return '<span style="color:#6b7280;font-weight:700" title="Stable">→ Stable</span>';
    };

    const formatPopulation = (n: number) => n.toLocaleString('fr-FR');

    pollutantCities.forEach(city => {
      const el = document.createElement('div');
      el.style.cssText = `
        width:32px;height:32px;border-radius:50%;
        background:${getRiskColor(city.riskLevel)};
        border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        font-size:11px;font-weight:700;color:white;
        transition:box-shadow .2s;
      `;
      el.textContent = city.riskLevel === 'high' ? '⚠️' : '●';
      el.addEventListener('mouseenter', () => { el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)'; });
      el.addEventListener('mouseleave', () => { el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'; });

      const conformityColor = city.conformityRate >= 98 ? '#10b981' : city.conformityRate >= 96 ? '#f59e0b' : '#ef4444';

      const pollutantRows = city.pollutants.map(p => {
        const val = parseFloat(p.value);
        const lim = parseFloat(p.limit);
        const hasLimit = p.limit !== '—';
        const ratio = hasLimit ? val / lim : 0;
        const color = !hasLimit ? '#6b7280' : ratio >= 1 ? '#ef4444' : ratio >= 0.7 ? '#f59e0b' : '#10b981';
        return `<tr>
          <td style="padding:2px 6px;font-size:12px">${p.name}</td>
          <td style="padding:2px 6px;font-size:12px;text-align:right;color:${color};font-weight:600">${p.value} ${p.unit}</td>
          <td style="padding:2px 6px;font-size:12px;text-align:right;color:#888">${hasLimit ? p.limit : '—'}</td>
        </tr>`;
      }).join('');

      const popup = new mapboxgl.Popup({ offset: 20, maxWidth: '360px' }).setHTML(
        `<div style="padding:8px">
          <h3 style="font-weight:700;font-size:15px;margin-bottom:2px">${city.name}</h3>
          <p style="font-size:11px;color:#888;margin-bottom:6px">${city.waterSource}</p>
          <div style="display:flex;gap:12px;margin-bottom:8px;font-size:12px;flex-wrap:wrap">
            <div><span style="color:#888">Risque</span><br/><span style="color:${getRiskColor(city.riskLevel)};font-weight:600">${getRiskLabel(city.riskLevel)}</span></div>
            <div><span style="color:#888">Conformité</span><br/><span style="color:${conformityColor};font-weight:600">${city.conformityRate}%</span></div>
            <div><span style="color:#888">Population</span><br/><span style="font-weight:600">${formatPopulation(city.population)}</span></div>
            <div><span style="color:#888">Tendance</span><br/>${getTrendHtml(city.trend)}</div>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:6px">
            <thead><tr style="border-bottom:1px solid #e5e7eb">
              <th style="text-align:left;padding:2px 6px;font-size:11px;color:#888">Polluant</th>
              <th style="text-align:right;padding:2px 6px;font-size:11px;color:#888">Mesuré</th>
              <th style="text-align:right;padding:2px 6px;font-size:11px;color:#888">Limite</th>
            </tr></thead>
            <tbody>${pollutantRows}</tbody>
          </table>
          <p style="font-size:10px;color:#aaa;margin:0">Dernier contrôle : ${city.lastAnalysis}</p>
        </div>`
      );

      new mapboxgl.Marker(el)
        .setLngLat(city.coords)
        .setPopup(popup)
        .addTo(map.current!);
    });

    map.current.on('move', () => {
      if (map.current) {
        setLng(Number(map.current.getCenter().lng.toFixed(4)));
        setLat(Number(map.current.getCenter().lat.toFixed(4)));
        setZoom(Number(map.current.getZoom().toFixed(2)));
      }
    });

    return () => { map.current?.remove(); };
  }, []);

  const getRiskBadgeClass = (r: string) =>
    r === 'low'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : r === 'medium'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'Faible';
      case 'medium': return 'Modéré';
      case 'high': return 'Élevé';
      default: return 'Non évalué';
    }
  };

  const getConformityColor = (rate: number) => {
    if (rate >= 98) return 'bg-green-500';
    if (rate >= 96) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10"><MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCities}</p>
              <p className="text-xs text-muted-foreground">Villes surveillées</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10"><Activity className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgConformity}%</p>
              <p className="text-xs text-muted-foreground">Conformité moyenne</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500/10"><ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalExceedances}</p>
              <p className="text-xs text-muted-foreground">Dépassements détectés</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-500/10"><Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{highRiskRegions}</p>
              <p className="text-xs text-muted-foreground">Régions à risque élevé</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Légende des niveaux de risque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { level: 'low', label: 'Faible', desc: 'Polluants sous les seuils réglementaires', color: 'bg-green-500' },
              { level: 'medium', label: 'Modéré', desc: 'Présence de polluants à surveiller', color: 'bg-yellow-500' },
              { level: 'high', label: 'Élevé', desc: 'Dépassements ou polluants préoccupants', color: 'bg-red-500' },
            ].map(item => (
              <div key={item.level} className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {item.level === 'high' ? '⚠️' : '●'}
                </div>
                <div>
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <div ref={mapContainer} className="h-96 w-full rounded-lg" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="text-sm font-medium text-foreground/70">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Pollutant Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pollutantRegions
          .sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.riskLevel] - order[b.riskLevel];
          })
          .map(region => (
          <Card key={region.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{region.name}</CardTitle>
                <Badge className={getRiskBadgeClass(region.riskLevel)}>
                  {getRiskLabel(region.riskLevel)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Conformité</span>
                    <span className="font-medium">{region.conformityRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getConformityColor(region.conformityRate)}`}
                      style={{ width: `${region.conformityRate}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Population desservie</span>
                  <span className="font-medium">{region.population.toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Zones d'approvisionnement</span>
                  <span className="font-medium">{region.supplyZones.toLocaleString('fr-FR')}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Polluants principaux :</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {region.mainPollutants.map(pollutant => (
                      <Badge key={pollutant} variant="outline" className="text-xs">
                        {pollutant}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Valeurs moyennes :</span>
                  <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                    {Object.entries(region.topPollutantValues).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Communes concernées</span>
                  <span className="font-medium">{region.cities.toLocaleString('fr-FR')}</span>
                </div>
                {region.riskLevel === 'high' && (
                  <div className="flex items-center space-x-1 text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Zone à surveiller</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PollutantMap;
