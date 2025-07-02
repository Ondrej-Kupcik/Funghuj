<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $to = "info@funghuj.cz";
  $subject = "Zpráva z kontaktního formuláře Funghuj";

  $name = htmlspecialchars(trim($_POST["name"] ?? ''));
  $email = htmlspecialchars(trim($_POST["email"] ?? ''));
  $message = htmlspecialchars(trim($_POST["message"] ?? ''));

  if (!$name || !$email || !$message) {
    echo "Vyplňte prosím všechna pole.";
    exit;
  }

  $headers = "From: $name <$email>" . "\r\n" .
             "Reply-To: $email" . "\r\n" .
             "Content-Type: text/plain; charset=utf-8";

  $body = "Jméno: $name\nEmail: $email\n\nZpráva:\n$message";

  if (mail($to, $subject, $body, $headers)) {
    echo "Děkujeme! Vaše zpráva byla odeslána.";
  } else {
    echo "Nastala chyba při odesílání zprávy. Zkuste to prosím později.";
  }
}
?>
