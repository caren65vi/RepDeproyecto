# ══════════════════════════════════════════════
#  TEST FIREBASE FIRESTORE — colección incidente
# ══════════════════════════════════════════════

$API_KEY    = "AIzaSyARb-OKQqlYTj_qlxabnOKGkjzLT5JmLxg"
$PROJECT_ID = "proyecto-2026-1-web"

Write-Host ""
Write-Host "══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST FIREBASE - coleccion incidente" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ── PASO 1: Credenciales ──────────────────────
$EMAIL    = Read-Host "Ingresa tu email de Firebase"
$PASSWORD = Read-Host "Ingresa tu contrasena"

# ── PASO 2: Login y obtener token ─────────────
Write-Host ""
Write-Host "[1/3] Autenticando con Firebase..." -ForegroundColor Yellow

$authBody = '{"email":"' + $EMAIL + '","password":"' + $PASSWORD + '","returnSecureToken":true}'

try {
    $authResp = Invoke-RestMethod `
        -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" `
        -Method POST `
        -ContentType "application/json" `
        -Body $authBody
    Write-Host "    OK - Autenticado como: $($authResp.email)" -ForegroundColor Green
    $TOKEN  = $authResp.idToken
    $UID    = $authResp.localId
} catch {
    Write-Host "    ERROR al autenticar: $_" -ForegroundColor Red
    Write-Host "    Verifica tu email y contrasena." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# ── PASO 3: Guardar documento de prueba ───────
Write-Host ""
Write-Host "[2/3] Guardando documento en Firestore..." -ForegroundColor Yellow

$testId  = "test_ps_$(Get-Date -Format 'yyyyMMddHHmmss')"
$fecha   = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
$BASE_URL = "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents"

$docBody = @"
{
  "fields": {
    "id":             { "stringValue": "$testId" },
    "tipo":           { "stringValue": "electrico" },
    "descripcion":    { "stringValue": "Prueba automatica desde PowerShell" },
    "foto":           { "stringValue": "https://test.com/foto.jpg" },
    "estado":         { "stringValue": "abierto" },
    "idUsuario":      { "stringValue": "$UID" },
    "fecha":          { "stringValue": "$fecha" },
    "latitud":        { "doubleValue": 1.6166 },
    "longitud":       { "doubleValue": -75.6155 },
    "ubicacionTextual": { "stringValue": "Florencia, Caqueta - Prueba" },
    "createdAt":      { "stringValue": "$fecha" },
    "updatedAt":      { "nullValue": null }
  }
}
"@

try {
    $saveResp = Invoke-RestMethod `
        -Uri "$BASE_URL/incidente/$testId" `
        -Method PATCH `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $TOKEN" } `
        -Body $docBody
    Write-Host "    OK - Documento guardado con ID: $testId" -ForegroundColor Green
} catch {
    Write-Host "    ERROR al guardar: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles causas:" -ForegroundColor Red
    Write-Host "  - Las reglas de Firestore no permiten escritura" -ForegroundColor Red
    Write-Host "  - La coleccion 'incidente' no existe" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# ── PASO 4: Leer el documento de vuelta ───────
Write-Host ""
Write-Host "[3/3] Verificando lectura del documento..." -ForegroundColor Yellow

try {
    $readResp = Invoke-RestMethod `
        -Uri "$BASE_URL/incidente/$testId" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $TOKEN" }

    $f = $readResp.fields
    Write-Host "    OK - Documento leido correctamente:" -ForegroundColor Green
    Write-Host "         id          : $($f.id.stringValue)"
    Write-Host "         tipo        : $($f.tipo.stringValue)"
    Write-Host "         descripcion : $($f.descripcion.stringValue)"
    Write-Host "         estado      : $($f.estado.stringValue)"
    Write-Host "         idUsuario   : $($f.idUsuario.stringValue)"
    Write-Host "         fecha       : $($f.fecha.stringValue)"
} catch {
    Write-Host "    ERROR al leer: $_" -ForegroundColor Red
    exit 1
}

# ── RESULTADO FINAL ───────────────────────────
Write-Host ""
Write-Host "══════════════════════════════════════" -ForegroundColor Green
Write-Host "   PRUEBA EXITOSA" -ForegroundColor Green
Write-Host "   Firebase Firestore esta funcionando" -ForegroundColor Green
Write-Host "══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Puedes ver el documento en:" -ForegroundColor Cyan
Write-Host "  Firebase Console -> Firestore -> incidente -> $testId" -ForegroundColor Cyan
Write-Host ""
Read-Host "Presiona Enter para salir"
