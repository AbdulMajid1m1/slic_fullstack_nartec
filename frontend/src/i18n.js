import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import {baseUrl } from './utils/config'

const storedLanguage = sessionStorage.getItem('selectedLanguaged')
const initialLanguage = storedLanguage || 'ar'

const dynamicTranslations = {
  ar: {},
  en: {}
}

// Function to fetch translations
const fetchTranslations = async () => {
  try {
    const response = await fetch(baseUrl + '/language/translations')
    const data = await response.json()
    if (data.data) {
      const dataArray = Object.entries(data.data)

      dataArray.forEach(([key, value], index) => {
        dynamicTranslations.ar[key] = value
        dynamicTranslations.en[key] = key
      })

      console.log(data.data,'Langauge');
      

      // Initialize i18n before fetching translations
      i18n
        .use(LanguageDetector)
        .use(initReactI18next) // Move initReactI18next here
        .init({
          dynamicTranslations: {},
          fallbackLng: ['ar', 'en'],
          detection: {
            order: ['navigator']
          },
          interpolation: {
            escapeValue: false
          },
          lng: initialLanguage,
          // debug: true
        })

      // Add resource bundles after initializing i18n
      i18n.addResourceBundle('ar', 'translation', dynamicTranslations.ar)
      i18n.addResourceBundle('en', 'translation', dynamicTranslations.en)
    } else {
      console.log("Error fetching translations");
    }
  } catch (error) {
    console.error('Error fetching translations:', error);
    i18n
      .use(LanguageDetector)
      .use(initReactI18next) // Move initReactI18next here
      .init({
        dynamicTranslations: {},
        fallbackLng: ['en'],
        detection: {
          order: ['navigator']
        },
        interpolation: {
          escapeValue: false
        },
        lng: 'en',
        debug: true
      })
  }
}

// Call the fetchTranslations function
fetchTranslations()

export default i18n
