# Spec Delta

## Purpose

Gestión de las credenciales de los administradores del panel: cambio de clave, restablecimiento por enlace e invitación de nuevos administradores.

## ADDED Requirements

### Requirement: Confirmación de clave consistente
Toda pantalla donde se define una clave nueva (restablecer/invitación y cambio de clave en "Mi cuenta") SHALL pedir la clave nueva y su confirmación. La comparación MUST hacerse sobre los valores exactos que contienen los campos al enviar, incluyendo valores pegados o autocompletados por el navegador. Si no coinciden, MUST mostrarse "Las claves no coinciden." y MUST NOT enviarse la solicitud. Si coinciden, MUST NOT mostrarse ese mensaje.

#### Scenario: Claves idénticas pegadas
- **WHEN** el usuario pega la misma clave en ambos campos y pulsa "Guardar clave"
- **THEN** no aparece "Las claves no coinciden." y la clave se guarda

#### Scenario: Claves distintas
- **WHEN** las dos claves difieren
- **THEN** aparece "Las claves no coinciden." y no se envía ninguna solicitud al servidor

#### Scenario: Cambio de clave en Mi cuenta
- **WHEN** el administrador cambia su clave desde "Mi cuenta"
- **THEN** debe ingresar clave actual, clave nueva y confirmación, con la misma validación

### Requirement: Usuario visible al aceptar una invitación
Al abrir un enlace de invitación o de restablecimiento válido, la pantalla SHALL mostrar el nombre de usuario de la cuenta ("Tu usuario es: …") antes de pedir la clave. Tras guardar la clave, la pantalla MUST recordar ese usuario y el formulario de login MUST llegar con el usuario prellenado. El correo de invitación MUST indicar el usuario con el que se ingresará. Un token inválido o vencido MUST mostrar un mensaje en español y un enlace para solicitar uno nuevo, sin revelar datos de la cuenta.

#### Scenario: Correo de invitación
- **WHEN** se invita a un nuevo administrador
- **THEN** el correo muestra en un bloque destacado "Tu usuario para ingresar: X", además del saludo, y aclara que se ingresa con ese usuario y no con el correo

#### Scenario: Aceptar invitación
- **WHEN** un invitado abre el enlace de su invitación
- **THEN** ve su nombre de usuario asignado y define su clave

#### Scenario: Ir a iniciar sesión después de guardar
- **WHEN** el invitado guarda la clave y pulsa "Ir a iniciar sesión"
- **THEN** el login muestra su usuario ya escrito en el campo de usuario

#### Scenario: Token vencido
- **WHEN** alguien abre un enlace vencido
- **THEN** ve "El enlace no es válido o ya venció." y no se muestra ningún usuario
