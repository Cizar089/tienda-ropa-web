<?php
require_once __DIR__ . "/../config/cors.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Método no permitido"
    ]);
    exit;
}

$datos = json_decode(file_get_contents("php://input"), true);

$email = trim($datos["email"] ?? "");
$codigoIngresado = trim($datos["codigo"] ?? "");

if ($email === "" || $codigoIngresado === "") {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Correo y código requeridos"
    ]);
    exit;
}

$rutaCodigos = __DIR__ . "/../data/codigos.json";

if (!file_exists($rutaCodigos)) {
    echo json_encode([
        "ok" => false,
        "mensaje" => "No existe código generado"
    ]);
    exit;
}

$codigos = json_decode(file_get_contents($rutaCodigos), true);

if (!isset($codigos[$email])) {
    echo json_encode([
        "ok" => false,
        "mensaje" => "No se encontró código para este correo"
    ]);
    exit;
}

$registro = $codigos[$email];

if (time() > $registro["expira"]) {
    unset($codigos[$email]);
    file_put_contents($rutaCodigos, json_encode($codigos, JSON_PRETTY_PRINT));

    echo json_encode([
        "ok" => false,
        "mensaje" => "El código expiró"
    ]);
    exit;
}

if (!password_verify($codigoIngresado, $registro["codigo"])) {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Código incorrecto"
    ]);
    exit;
}

unset($codigos[$email]);
file_put_contents($rutaCodigos, json_encode($codigos, JSON_PRETTY_PRINT));

echo json_encode([
    "ok" => true,
    "mensaje" => "Código verificado correctamente"
]);
?>