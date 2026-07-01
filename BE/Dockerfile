# batch 1, Docker philosophy: every command line that executes creates a new batch (layer) cached by Docker
# fpm is a web server and application server for PHP
FROM php:8.3-fpm

WORKDIR /var/www

RUN apt-get update && apt-get install -y \
    # build-essential is a package that contains the tools needed to compile software from source code
    build-essential \  
    # these are libs to deal with images(cuting, rezsizing, etc)
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    # locales configuration for languages and system timestamps
    locales \
    # zip libraries required by Laravel and Composer to manage packages
    zip \
    unzip \
    libzip-dev \
    # to download and install packages from the internet
    git \
    curl \
    # tools to compress and optimize image sizes
    jpegoptim optipng pngquant gifsicle \
    # the most important library to connect PHP with PostgreSQL database
    libpq-dev 
    

RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install pdo pdo_pgsql pgsql zip exif pcntl gd    

COPY . /var/www

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

CMD ["php-fpm"]