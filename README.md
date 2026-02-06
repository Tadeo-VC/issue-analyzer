# Nombre del Proyecto

> Chat web de inteligencia artificial que analiza la complejidad de issues de GitHub para ayudar a desarrolladores a entender y priorizar el trabajo en sus proyectos.

---

## Descripción

Issue Analyzer es una aplicación web que ofrece un chat basado en inteligencia artificial que permite analizar la complejidad de los issues de un repositorio de GitHub. Actualmente, el sistema utiliza la API de OpenAI como modelo de lenguaje y se enfoca exclusivamente en repositorios alojados en GitHub.

El objetivo principal de la aplicación es asistir a desarrolladores que están dando sus primeros pasos en proyectos reales, donde la cantidad de issues, su ambigüedad o su nivel de dificultad pueden resultar abrumadores. A través de distintas heurísticas, Issue Analyzer evalúa cada issue y devuelve un análisis que ayuda a comprender su complejidad y a definir un posible camino de acción.

La aplicación integra Supabase como servicio central para la persistencia de los chats y la autenticación de usuarios mediante GitHub. Esto permite que cada usuario mantenga un historial de conversaciones asociado a su cuenta y trabaje únicamente sobre los repositorios a los que tiene acceso.

Issue Analyzer está pensado como una herramienta de apoyo para la toma de decisiones tempranas en proyectos de software, priorizando claridad, trazabilidad y una experiencia guiada para desarrolladores en etapa de aprendizaje.

## Historias de Usuario

- Como usuario, quiero autenticarme con mi cuenta de GitHub para poder analizar repositorios a los que tengo acceso.
- Como usuario, quiero analizar la complejidad de los issues de un repositorio para estimar mejor el esfuerzo requerido.
- Como usuario, quiero ver un desglose estructurado de los criterios de complejidad.
- Como usuario, quiero que mis conversaciones se persistan para poder retomarlas más adelante.
- Como usuario, quiero recibir respuestas validadas y confiables del sistema.

---

## Instalación Local

### Dependencias

- next `16.1.6`
- react `19.2.3`
- react-dom `19.2.3`
- @chakra-ui/react `^3.32.0`
- @chakra-ui/system `^2.6.2`
- @emotion/react `^11.14.0`
- @emotion/styled `^11.14.1`
- framer-motion `^12.33.0`
- next-themes `^0.4.6`
- @supabase/supabase-js `^2.94.1`
- @supabase/ssr `^0.8.0`
- openai `^6.17.0`
- zod `^4.3.6`
- node-fetch `^3.3.2`
- react-icons `^5.5.0`
- typescript `^5`
- eslint `^9`
- eslint-config-next `16.1.6`
- tailwindcss `^4`
- @tailwindcss/postcss `^4`
- vitest `^4.0.18`
- vite-tsconfig-paths `^6.0.5`
- @types/node `^20`
- @types/react `^19`
- @types/react-dom `^19`

### Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL = <your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY = <your-supabase-anon-key>
OPENAI_API_KEY = <your-openai-api-key>
```

---

## Arquitectura y Decisiones Tecnicas

### Arquitectura General
- Aplicación web basada en Next.js con App Router
- Backend lógico integrado mediante rutas y componentes de servidor
- Integración con Supabase para autenticación y persistencia
- Integración con GitHub para análisis de issues
- Validación con Zod para garantizar contratos
- Diseño orientado a extensibilidad (otros clientesllm, otras aplicaciones de hosting de git, etc)

### Frontend

Lamentablemente no logre realizar el trabajo completo en el tiempo estipulado debido a que implico diversas tecnologias nuevas para mi, y por ello, priorice poner el foco en el backend y la arquitectura, para implementar las funcionalidades de la aplicacion de la mejor manera posible. 

### Dominio

Las entidades principales del modelo son `Chat`,`Agent` y `ClientLLM`. El `Chat` es la entidad persistible que funciona como medio para que los interlocutores `User` y `Agent` se comuniquen. El `Agent` encapsula la logica correspondiente al armado de la response del `ClientLLM` junto a las `Tool`, orquestando la comunicacion entre ellos y manteniendolos desacoplados a traves de las clases de `Generate Results` para enviar a los resultados a las entidades correspondientes. 

A traves de la clase abstract `ClientLLM` se implementa la logica de dominio relacionada al flujo de las request, response y llamdo de tools del llm, encapsulando como metodo abstracto la logica correspondiente al envio de la request al llm, permitiendo evolucionar al sistema manteniendolo flexible con respecto a la imlpementacion concreta de un cliente llm. `ClientLLM` es una clase stateless para evitar la mutabilidad del objeto y el surgimiento de errores inesperados. Otros puntos a destacar del `ClientLLM` son:
- La aplicación utiliza tool calling nativo del LLM, evitando el parsing manual de texto o JSON generado por el modelo. Esto permite ejecutar acciones de forma estructurada y segura, con validación explícita de los argumentos, reduciendo errores y mejorando la mantenibilidad del sistema.
- El sistema separa claramente la intención detectada, la tool asociada y la lógica de ejecución. Esta separación reduce el acoplamiento, facilita la extensión del comportamiento del agente y permite agregar nuevas tools o intenciones sin afectar el flujo general de la aplicación. Aunque existe un acoplamiento implicito entre las estrucutras JSON solicitadas y recibidas por el `ClientLLM` y las `Tool` 

La primera tool es `analyze_issues_complexity`, que permite analizar la complejidad de los issues de un repositorio de GitHub. Cuando el usuario solicita analizar problemas, el LLM invoca esta herramienta proporcionando tres parámetros: el chat_id para recuperar el token de autenticación de la sesión actual, el nombre de usuario u organización en GitHub (user), y el nombre del repositorio (repo). El sistema entonces se conecta a la API de GitHub, obtiene los issues del repositorio, extrae señales de complejidad basadas en la descripción y etiquetas, y evalúa cada issue utilizando heurísticas predefinidas para finalmente retornar el análisis al LLM, quien lo presenta al usuario en lenguaje natural.

La segunda tool es `persist_chat`, que permite guardar permanentemente una conversación en la base de datos. Los chats se almacenan inicialmente en memoria con un tiempo de vida de 30 minutos, pero esta herramienta permite que el usuario preserve conversaciones importantes antes de que expiren. Cuando se invoca, el sistema recupera el chat de memoria usando el `chat_id` proporcionado y guarda toda la conversación y sus mensajes en Supabase, retornando una confirmación de éxito al LLM.

### Persistencia y Manejo de Chats

Para la persistencia y el manejo de `Chat` no persistidos (dado que las conversaciones se persisten a traves de una tool, tras recibir la solicitud del usuario) se utiliza un `ChatContextRepository` en memoria para mantener el estado activo de los chats durante la sesión. Este repositorio encapsula el Chat junto con su `ChatContext` (por ejemplo, el token de autorización de GitHub), permitiendo que las tools accedan al contexto necesario sin depender directamente de la UI ni de las cookies. Además, facilita la gestión de ciclo de vida del chat (TTL, reutilización y limpieza).El `SupabaseRepository` se encarga exclusivamente de la persistencia y autenticación. Centraliza el acceso a la base de datos y a `Supabase Auth`, desacoplando la lógica de negocio del proveedor de almacenamiento. Esto permite persistir chats, recuperar historial y manejar usuarios autenticados sin mezclar responsabilidades con la capa de orquestación o las tools.

---

## Lista de Features Bonus Implementados
- Test unitarios

---

## Link al Deploy
> https://issue-analyzer.vercel.app/