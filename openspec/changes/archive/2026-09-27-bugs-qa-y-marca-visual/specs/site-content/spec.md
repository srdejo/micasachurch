# Spec Delta

## Purpose

Textos del landing que el administrador edita desde la vista "Contenido" del panel, y cómo se organizan para que sea evidente dónde se cambia cada uno.

## ADDED Requirements

### Requirement: Textos de Prédicas editables
El título y el texto de la tarjeta de Prédicas (hoy "Las últimas prédicas, siempre al día" y su párrafo) SHALL ser contenido editable desde "Contenido", con los textos actuales como valor inicial. Siguen el mismo flujo de guardado/publicación que el resto del contenido.

#### Scenario: Editar el texto de Prédicas
- **WHEN** el administrador cambia el texto de la tarjeta de Prédicas y lo publica
- **THEN** el landing muestra el nuevo texto en la sección Prédicas

### Requirement: Título de Quiénes somos editable
El título de la sección Quiénes somos (hoy "Una familia antes que un edificio") SHALL ser contenido editable desde "Contenido".

#### Scenario: Editar el título de Quiénes somos
- **WHEN** el administrador cambia el título y lo publica
- **THEN** el landing muestra el nuevo título en Quiénes somos

### Requirement: Contenido agrupado por sección
La vista "Contenido" SHALL agrupar los campos bajo el nombre de la sección del sitio donde aparecen (Inicio, Prédicas, Quiénes somos, Ofrendas), en el mismo orden en que aparecen en el landing, y cada campo MUST tener una etiqueta que describa qué es (p. ej. "Título", "Párrafo 1").

#### Scenario: Buscar dónde editar Prédicas
- **WHEN** el administrador abre "Contenido"
- **THEN** ve un grupo "Prédicas" con los campos de título y texto de esa sección
