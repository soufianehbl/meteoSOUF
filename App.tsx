import React, { useState, useEffect } from 'react';
import { MapPin, Wind, Droplets, Clock, Info, ExternalLink, ChevronDown, Sun, Moon } from 'lucide-react';

// Données des villes
const CITIES = [
  { name: 'Béni Mellal', lat: 32.3369, lon: -6.3498 },
  { name: 'Fkih Ben Salah', lat: 32.5021, lon: -6.6885 },
  { name: 'Khouribga', lat: 32.8851, lon: -6.9063 }
] as const;

const API_KEY = '5872b2bad844027de49ce482c353ff8b';

function App() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        const [currentRes, forecastRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&appid=${API_KEY}&lang=fr`),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&appid=${API_KEY}&lang=fr`)
        ]);

        if (currentRes.status === 401 || forecastRes.status === 401) {
          throw new Error('API_KEY_INVALID');
        }

        if (!currentRes.ok || !forecastRes.ok) {
          if (currentRes.status === 404 || forecastRes.status === 404) {
            throw new Error('LOCATION_NOT_FOUND');
          }
          throw new Error('API_ERROR');
        }

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        if (!currentData || !forecastData) {
          throw new Error('INVALID_DATA');
        }

        setCurrentWeather(currentData);
        setForecast(forecastData);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des données météo:', error);
        
        if (error instanceof Error) {
          switch (error.message) {
            case 'API_KEY_INVALID':
              setError('Clé API invalide. Veuillez vérifier votre clé API OpenWeatherMap.');
              break;
            case 'LOCATION_NOT_FOUND':
              setError('Localisation non trouvée. Veuillez vérifier les coordonnées.');
              break;
            case 'INVALID_DATA':
              setError('Les données reçues sont invalides. Veuillez réessayer plus tard.');
              break;
            case 'API_ERROR':
              setError('Erreur du service météo. Veuillez réessayer plus tard.');
              break;
            default:
              setError('Impossible de charger les données météo. Veuillez vérifier votre connexion Internet et réessayer plus tard.');
          }
        } else {
          setError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedCity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Erreur</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 dark:from-gray-800 dark:to-gray-900">
      {/* Barre de navigation */}
      <nav className="bg-white/10 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-white" />
              <h1 className="text-2xl font-bold text-white">Météo Béni Mellal-Khénifra</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sélecteur de ville */}
              <div className="relative w-full md:w-64">
                <select
                  value={selectedCity.name}
                  onChange={(e) => {
                    const city = CITIES.find(c => c.name === e.target.value);
                    if (city) setSelectedCity(city);
                  }}
                  className="w-full px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg appearance-none cursor-pointer text-gray-800 dark:text-white font-medium shadow-sm transition-colors hover:bg-white/90 dark:hover:bg-gray-600/90 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {CITIES.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
              </div>
              
              {/* Toggle mode sombre */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 dark:bg-gray-700/20 dark:hover:bg-gray-700/30 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-white" />
                ) : (
                  <Moon className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Météo actuelle */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
                  {currentWeather?.main?.temp != null ? `${Math.round(currentWeather.main.temp)}°C` : 'N/A'}
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 capitalize">
                  {currentWeather?.weather?.[0]?.description ?? 'Information non disponible'}
                </p>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Wind className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  <span>Vent: {currentWeather?.wind?.speed != null ? `${currentWeather.wind.speed} km/h` : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Droplets className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  <span>Humidité: {currentWeather?.main?.humidity != null ? `${currentWeather.main.humidity}%` : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1584545284372-f22510eb7c26?auto=format&fit=crop&w=800"
                alt="Béni Mellal"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Prévisions */}
        {forecast?.list && (
          <div className="mt-8 overflow-x-auto">
            <div className="inline-flex gap-4 pb-4 min-w-full">
              {forecast.list.slice(0, 8).map((item: any, index: number) => (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-md min-w-[140px]"
                >
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-sky-600 dark:text-sky-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(item.dt * 1000).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                      {item?.main?.temp != null ? `${Math.round(item.main.temp)}°C` : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {item?.weather?.[0]?.description ?? 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* À propos */}
        <section className="mt-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">À propos</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Notre mission est de fournir des informations météorologiques précises et à jour pour la région de Béni Mellal-Khénifra.
            Nous nous engageons à aider les habitants et les visiteurs à planifier leurs activités en fonction des conditions météorologiques locales.
          </p>
        </section>
      </main>

      {/* Pied de page */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-12 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.marocmeteo.ma" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    Météo Maroc
                  </a>
                </li>
                <li>
                  <a href="http://www.protection-civile.gov.ma" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    Protection Civile
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p>Email: contact@meteo-benimellal.ma</p>
              <p>Tél: +212 5XX XX XX XX</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Avertissement</h3>
              <p className="text-sm">
                Les données météorologiques sont fournies à titre indicatif.
                Consultez les autorités locales pour les alertes officielles.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>&copy; 2024 Météo Béni Mellal-Khénifra. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;