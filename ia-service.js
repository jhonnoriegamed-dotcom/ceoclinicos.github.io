/**
 * Servicio de IA para el sitio web - replica IAReadOnlyActivity.kt
 * Llama a la API de Gemini (REST) para generar contenido médico.
 */
(function () {
  'use strict';

  var GEMINI_API_KEY = 'AIzaSyCCESHOoSULYuvxiTaEcKNyt8N2OFpBkFg';
  var GEMINI_MODEL = 'gemini-2.5-flash';
  var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + GEMINI_API_KEY;

  var HERRAMIENTAS = [
    { id: 'diccionario',   nombre: 'Diccionario Médico',          costo: 15, desc: 'Busca términos médicos y obtén definiciones claras con contexto clínico.' },
    { id: 'enciclopedia',  nombre: 'Enciclopedia Farmacológica',  costo: 15, desc: 'Consulta información completa sobre fármacos: mecanismo, dosis, efectos adversos.' },
    { id: 'patologia',     nombre: 'Patología',                   costo: 20, desc: 'Genera información completa sobre una patología: concepto, fisiopatología, diagnóstico y más.' },
    { id: 'diagnostico',   nombre: 'Diagnóstico Diferencial',     costo: 15, desc: 'Obtén los diagnósticos diferenciales más relevantes para una patología.' },
    { id: 'comparativo',   nombre: 'Cuadro Comparativo',          costo: 15, desc: 'Compara dos términos médicos en definición, características y diferencias.' },
    { id: 'tutor',         nombre: 'Tutor Médico',                costo: 15, desc: 'Haz cualquier pregunta médica y recibe una respuesta profesional y educativa.' },
    { id: 'ordenes',       nombre: 'Órdenes Médicas',             costo: 20, desc: 'Genera órdenes médicas completas para una patología (emergencia o ambulatoria).' }
  ];

  function buildPrompt(toolId, params) {
    switch (toolId) {
      case 'diccionario':
        return 'Eres un experto en terminología médica. Genera definiciones profesionales y claras.\n\n' +
          'TÉRMINOS A INVESTIGAR:\n' + params.terminos + '\n\n' +
          'INSTRUCCIONES:\n' +
          '1. Para cada término, proporciona: concepto claro y contexto clínico relevante\n' +
          '2. Usa lenguaje profesional pero accesible\n' +
          '3. Usa formato HTML con <b> para títulos y términos importantes\n' +
          '4. Usa <br> para saltos de línea\n' +
          '5. Mínimo 30, máximo 60 palabras por sección\n\n' +
          'FORMATO:\n<b>TÉRMINO</b><br><b>Concepto:</b> definición...<br><b>Contexto clínico:</b> uso...<br><br>\n' +
          '(Repite para cada término)\n\nIMPORTANTE: Responde SOLO con el contenido HTML, sin explicaciones adicionales.';

      case 'enciclopedia':
        return 'Eres un experto en farmacología clínica.\n\n' +
          'FÁRMACO A INVESTIGAR: "' + params.farmaco + '"\n\n' +
          'INSTRUCCIONES:\n' +
          '1. Proporciona información completa del fármaco\n' +
          '2. Incluye: Nombre genérico/comercial, Grupo farmacológico, Mecanismo de acción, Indicaciones, Contraindicaciones, Dosis habitual, Efectos adversos, Interacciones importantes\n' +
          '3. Usa formato HTML con <b> para títulos y términos importantes\n' +
          '4. Usa <br> para saltos de línea y viñetas con •\n' +
          '5. Entre 300 y 500 palabras\n\n' +
          'FORMATO:\n<b>FÁRMACO: ' + params.farmaco.toUpperCase() + '</b><br><br>\n' +
          '<b>Grupo farmacológico:</b> ...<br><br>\n' +
          '<b>Mecanismo de acción:</b> ...<br><br>\n' +
          '(y así cada sección)\n\nIMPORTANTE: Responde SOLO con el contenido HTML.';

      case 'patologia':
        return 'Eres un experto médico. Proporciona información completa sobre la patología.\n\n' +
          'PATOLOGÍA: "' + params.patologia + '"\n\n' +
          'INSTRUCCIONES:\n' +
          '1. Genera información EXCLUSIVAMENTE sobre "' + params.patologia + '"\n' +
          '2. Usa formato HTML con <b> para títulos y términos importantes\n' +
          '3. Usa <br> para saltos de línea y viñetas con • o listas numeradas\n' +
          '4. Información actualizada a 2025\n' +
          '5. Si tiene clasificación diagnóstica reconocida (NYHA, Child-Pugh, GOLD, TNM, etc.), inclúyela\n\n' +
          'SECCIONES (incluye todas):\n' +
          '<b>CONCEPTO</b> (100-160 palabras)<br>\n' +
          '<b>FISIOPATOLOGÍA</b> (200-350 palabras)<br>\n' +
          '<b>EPIDEMIOLOGÍA</b> (100-200 palabras)<br>\n' +
          '<b>ETIOLOGÍA</b> (100-200 palabras)<br>\n' +
          '<b>SIGNOS Y SÍNTOMAS</b> (200-300 palabras)<br>\n' +
          '<b>EXAMEN FÍSICO</b> (250-400 palabras)<br>\n' +
          '<b>DIAGNÓSTICO</b> (200-300 palabras)<br>\n' +
          '<b>CLASIFICACIÓN</b> (solo si aplica, 150-350 palabras)<br>\n' +
          '<b>DIAGNÓSTICO DIFERENCIAL</b> (150-300 palabras)<br>\n' +
          '<b>TRATAMIENTO</b> (150-300 palabras)<br>\n' +
          '<b>ÓRDENES MÉDICAS</b> (150-300 palabras)<br><br>\n\n' +
          'FORMATO para cada sección:\n<b>NOMBRE SECCIÓN</b><br><br>\ncontenido...<br><br>\n\n' +
          'IMPORTANTE: Responde SOLO con el contenido HTML. Todo sobre "' + params.patologia + '".';

      case 'diagnostico':
        return 'Eres un experto médico. Genera un diagnóstico diferencial completo para: "' + params.patologia + '"\n\n' +
          'INSTRUCCIONES:\n' +
          '1. Lista los diagnósticos diferenciales más relevantes (mínimo 6, máximo 8)\n' +
          '2. Para cada uno incluye: nombre, por qué es diferencial, características distintivas\n' +
          '3. Usa formato HTML con <b> para títulos y términos importantes\n' +
          '4. Usa <br> para saltos de línea y viñetas con •\n' +
          '5. Máximo 100 palabras por diagnóstico diferencial\n\n' +
          'FORMATO:\n<b>DIAGNÓSTICOS DIFERENCIALES PARA: ' + params.patologia.toUpperCase() + '</b><br><br>\n' +
          '• <b>Diagnóstico 1:</b> Descripción...<br><br>\n' +
          '• <b>Diagnóstico 2:</b> Descripción...<br><br>\n(y así)\n\n' +
          'IMPORTANTE: Responde SOLO con el contenido HTML.';

      case 'comparativo':
        return 'Eres un experto médico. Genera un cuadro comparativo detallado entre: "' + params.termino1 + '" y "' + params.termino2 + '"\n\n' +
          'INSTRUCCIONES:\n' +
          '1. Compara ambos términos en: Definición, Características principales, 4 diferencias, Similitudes, Importancia médica\n' +
          '2. Usa formato HTML con <b> para títulos y términos importantes\n' +
          '3. Usa <br> para saltos de línea y viñetas con •\n' +
          '4. Máximo 150 palabras por aspecto\n\n' +
          'FORMATO:\n<b>CUADRO COMPARATIVO: ' + params.termino1.toUpperCase() + ' vs ' + params.termino2.toUpperCase() + '</b><br><br>\n' +
          '<b>DEFINICIÓN:</b><br>\n<b>' + params.termino1 + ':</b> ...<br>\n<b>' + params.termino2 + ':</b> ...<br><br>\n' +
          '<b>CARACTERÍSTICAS:</b><br>...<br><br>\n' +
          '<b>DIFERENCIAS:</b><br>• ...<br><br>\n' +
          '<b>SIMILITUDES:</b><br>• ...<br><br>\n' +
          '<b>IMPORTANCIA MÉDICA:</b><br>...\n\n' +
          'IMPORTANTE: Responde SOLO con el contenido HTML.';

      case 'tutor':
        return 'Eres un tutor médico. Responde preguntas médicas de forma clara, precisa y educativa.\n\n' +
          'PREGUNTA DEL ESTUDIANTE:\n"' + params.pregunta + '"\n\n' +
          'INSTRUCCIONES:\n' +
          '1. Respuesta profesional y completa (200-400 palabras)\n' +
          '2. Usa formato HTML con <b> para términos importantes\n' +
          '3. Usa <br> para saltos de línea, viñetas con • o listas numeradas\n' +
          '4. Información actualizada (2024-2025)\n' +
          '5. Si hay listas o items, dale viñetas y saltos de línea\n' +
          '6. Lenguaje técnico pero accesible\n\n' +
          'FORMATO:\n<b>RESPUESTA:</b><br><br>\n[Respuesta profesional con HTML]\n\n' +
          'IMPORTANTE: Responde directamente, sin introducciones como "Como tutor médico..."';

      case 'ordenes':
        return 'Eres un experto médico. Genera órdenes médicas completas.\n\n' +
          'PATOLOGÍA: "' + params.patologia + '"\n' +
          'CARÁCTER: ' + params.caracter + '\n\n' +
          'INSTRUCCIONES:\n' +
          '1. Genera órdenes médicas integrales para "' + params.patologia + '" en contexto de ' + params.caracter.toLowerCase() + '\n' +
          '2. Incluye: Monitorización, Acceso venoso, Oxigenoterapia (si aplica), Farmacoterapia detallada, Laboratorios, Dieta, Medidas generales\n' +
          '3. Sé específico con dosis, vías de administración y frecuencia\n' +
          '4. Usa formato HTML con <b> para títulos y términos importantes\n' +
          '5. Usa <br> para saltos de línea, listas numeradas y viñetas con •\n' +
          '6. Entre 300 y 500 palabras\n\n' +
          'FORMATO:\n<b>ÓRDENES MÉDICAS: ' + params.patologia.toUpperCase() + ' (' + params.caracter + ')</b><br><br>\n' +
          '<b>1. Monitorización:</b><br>• ...<br><br>\n' +
          '<b>2. Acceso Venoso:</b><br>• ...<br><br>\n' +
          '(y así cada sección)\n\n' +
          'IMPORTANTE: Responde SOLO con el contenido HTML.';

      default:
        return '';
    }
  }

  function callGemini(prompt) {
    return fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
      })
    })
    .then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          throw new Error('Error API (' + res.status + '): ' + t.substring(0, 200));
        });
      }
      return res.json();
    })
    .then(function (data) {
      if (!data.candidates || !data.candidates.length) {
        throw new Error('No se recibió respuesta de Gemini');
      }
      var parts = data.candidates[0].content && data.candidates[0].content.parts;
      if (!parts || !parts.length || !parts[0].text) {
        throw new Error('Respuesta vacía de Gemini');
      }
      return parts[0].text;
    });
  }

  function limpiarRespuesta(texto) {
    texto = texto.replace(/```html\s*/gi, '').replace(/```\s*/g, '');
    texto = texto.trim();
    return texto;
  }

  window.IAService = {
    HERRAMIENTAS: HERRAMIENTAS,

    getHerramienta: function (id) {
      for (var i = 0; i < HERRAMIENTAS.length; i++) {
        if (HERRAMIENTAS[i].id === id) return HERRAMIENTAS[i];
      }
      return null;
    },

    generar: function (toolId, params) {
      var prompt = buildPrompt(toolId, params);
      if (!prompt) return Promise.reject(new Error('Herramienta no reconocida'));
      return callGemini(prompt).then(limpiarRespuesta);
    }
  };
})();
