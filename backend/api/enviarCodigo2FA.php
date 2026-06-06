<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Método no permitido"
    ]);
    exit;
}

$datos = json_decode(file_get_contents("php://input"), true);

$email = trim($datos["email"] ?? "");
$nombre = trim($datos["nombre"] ?? "Usuario");

if ($email === "") {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Correo requerido"
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Correo inválido"
    ]);
    exit;
}

$codigo = random_int(100000, 999999);
$expira = time() + 300; // 5 minutos

$rutaCodigos = __DIR__ . "/../data/codigos.json";

if (!file_exists($rutaCodigos)) {
    file_put_contents($rutaCodigos, "{}");
}

$codigos = json_decode(file_get_contents($rutaCodigos), true);

if (!is_array($codigos)) {
    $codigos = [];
}

$codigos[$email] = [
    "codigo" => password_hash((string)$codigo, PASSWORD_DEFAULT),
    "expira" => $expira
];

file_put_contents($rutaCodigos, json_encode($codigos, JSON_PRETTY_PRINT));

$config = require __DIR__ . "/../config/mailConfig.php";

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $config["host"];
    $mail->SMTPAuth = true;
    $mail->Username = $config["username"];
    $mail->Password = $config["password"];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $config["port"];

    $mail->setFrom($config["from_email"], $config["from_name"]);
    $mail->addAddress($email, $nombre);

    $mail->isHTML(true);
    $mail->CharSet = "UTF-8";
    $mail->Subject = "Código de verificación - Insignis Store";

    $mail->Body = "
        <div style='font-family:Arial,sans-serif;background:#0a0a0a;color:white;padding:25px;text-align:center;'>
            <h2>INSIGNIS STORE</h2>
            <p>Hola, $nombre.</p>
            <p>Tu código de verificación es:</p>
            <h1 style='letter-spacing:5px;'>$codigo</h1>
            <p>Este código vence en 5 minutos.</p>
        </div>
    ";

    $mail->AltBody = "Tu código de verificación de Insignis Store es: $codigo. Vence en 5 minutos.";

    $mail->send();

    echo json_encode([
        "ok" => true,
        "mensaje" => "Código enviado al correo"
    ]);
} catch (Exception $e) {
    echo json_encode([
        "ok" => false,
        "mensaje" => "No se pudo enviar el correo",
        "error" => $mail->ErrorInfo
    ]);
}
?>