#!/bin/sh
set -e

echo "Esperando a que la base de datos este lista..."
php -r "
\$dbReady = false;
for (\$i = 0; \$i < 5; \$i++) {
    try {
        \$host = getenv('DB_HOST');
        \$port = getenv('DB_PORT') ?: '5432';
        \$dbname = getenv('DB_DATABASE');
        \$user = getenv('DB_USERNAME');
        \$pass = getenv('DB_PASSWORD');
        
        file_put_contents('php://stderr', 'Conectando a ' . \$host . ':' . \$port . ' db=' . \$dbname . ' user=' . \$user . PHP_EOL);
        
        \$pdo = new PDO('pgsql:host=' . \$host . ';port=' . \$port . ';dbname=' . \$dbname, \$user, \$pass);
        \$dbReady = true;
        break;
    } catch (Exception \$e) {
        file_put_contents('php://stderr', 'Intento ' . (\$i + 1) . ' fallo: ' . \$e->getMessage() . PHP_EOL);
        sleep(2);
    }
}
if (!\$dbReady) {
    file_put_contents('php://stderr', 'No se pudo conectar a la base de datos. Continuando arranque...' . PHP_EOL);
}
"

echo "Ejecutando php artisan migrate --force..."
php artisan migrate --force

echo "Arrancando FrankenPHP..."
exec frankenphp run --config /app/Caddyfile
